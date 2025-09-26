import React, { useState } from "react";
import Navbar from "../components/Navbar";
import FileUploader from "../components/FileUploader";
import ProgressBar from "../components/ProgressBar";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if (!files.length) return alert("Select files first!");
    let uploaded = 0;
    const interval = setInterval(() => {
      uploaded += 10;
      setProgress(Math.min(uploaded, 100));
      if (uploaded >= 100) clearInterval(interval);
    }, 300);
  };

  return (
    <div style={{ padding: "30px" }}>
      <Navbar />
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Upload Files</h2>
      <FileUploader onFilesUpload={setFiles} />
      {files.length > 0 && (
        <>
          <button
            onClick={handleUpload}
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer", backgroundColor: "#1D4ED8", color: "#fff", border: "none", borderRadius: "5px" }}
          >
            Start Upload
          </button>
          <ProgressBar progress={progress} />
        </>
      )}
    </div>
  );
};

export default Upload;