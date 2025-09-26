// src/components/FileUploader.js
import React, { useState, useRef } from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import "./FileUploader.css";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const FileUploader = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const cancelTokens = useRef({});

  // Handle files selection
  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles).map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}`,
      uploaded: 0,
      paused: false,
    }));
    setFiles((prev) => [...prev, ...fileArray]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  // Upload single file in chunks
  const uploadFile = async (fileObj) => {
    const { file, id } = fileObj;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setUploading(true);

    let start = 0;
    let chunkIndex = 0;

    while (start < file.size) {
      if (fileObj.paused) break;

      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("fileName", file.name);
      formData.append("chunkIndex", chunkIndex);
      formData.append("totalChunks", totalChunks);

      const source = axios.CancelToken.source();
      cancelTokens.current[id] = source;

      try {
        await axios.post("/api/files/upload-chunk", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          cancelToken: source.token,
        });

        const uploaded = Math.min(((chunkIndex + 1) / totalChunks) * 100, 100);
        setUploadProgress((prev) => ({ ...prev, [id]: uploaded }));

        start += CHUNK_SIZE;
        chunkIndex += 1;
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log(`Upload paused: ${file.name}`);
        } else {
          setErrors((prev) => ({ ...prev, [id]: err.message }));
          break;
        }
      }
    }

    if (!fileObj.paused && (!errors[id] || errors[id] === undefined)) {
      console.log(`File uploaded: ${file.name}`);
    }
    setUploading(false);
  };

  // Start uploading all files
  const handleUploadAll = () => {
    files.forEach((fileObj) => uploadFile(fileObj));
  };

  // Pause a file
  const handlePause = (fileId) => {
    const tokenSource = cancelTokens.current[fileId];
    if (tokenSource) tokenSource.cancel();
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, paused: true } : f))
    );
  };

  // Resume a file
  const handleResume = (fileObj) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileObj.id ? { ...f, paused: false } : f))
    );
    uploadFile({ ...fileObj, paused: false });
  };

  return (
    <div className="uploader-container">
      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag & Drop files here or click to select</p>
        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>Files ready to upload:</h4>
          <ul>
            {files.map((f) => (
              <li key={f.id}>
                <strong>{f.file.name}</strong> -{" "}
                {(f.file.size / 1024 / 1024).toFixed(2)} MB
                <div>
                  <progress
                    value={uploadProgress[f.id] || 0}
                    max="100"
                  />
                  {uploadProgress[f.id]?.toFixed(2)}%
                </div>
                {errors[f.id] && <p className="error">{errors[f.id]}</p>}
                {f.paused ? (
                  <button onClick={() => handleResume(f)}>Resume</button>
                ) : (
                  <button onClick={() => handlePause(f.id)}>Pause</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && !uploading && (
        <button className="upload-btn" onClick={handleUploadAll}>
          Upload All
        </button>
      )}
    </div>
  );
};

export default FileUploader;
