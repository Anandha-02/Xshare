import React, { useState } from "react";

const FileUploader = ({ onFilesUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}`
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
    onFilesUpload([...selectedFiles, ...newFiles]);
  };

  const handleInputChange = (e) => handleFiles(e.target.files);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== id);
    setSelectedFiles(updatedFiles);
    onFilesUpload(updatedFiles);
  };

  return (
    <div>
      <div
        className={`border-dashed border-4 p-6 rounded-md text-center cursor-pointer ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" multiple onChange={handleInputChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer">
          {dragActive ? "Drop files here..." : "Drag & Drop files or click to upload"}
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <ul className="mt-4 space-y-2">
          {selectedFiles.map(({ file, id }) => (
            <li key={id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
              <span>{file.name}</span>
              <button onClick={() => removeFile(id)} className="text-red-500 hover:text-red-700">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
