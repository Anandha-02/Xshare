import React, { useState } from "react";
import Navbar from "../components/Navbar";
import FileList from "../components/FileList";

const Download = () => {
  const [files] = useState([
    { file: { name: "Document.pdf", size: 102400 }, id: 1 },
    { file: { name: "Image.png", size: 204800 }, id: 2 },
    { file: { name: "Video.mp4", size: 1048576 }, id: 3 },
  ]);
  const [search, setSearch] = useState("");

  const filteredFiles = files.filter(f =>
    f.file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px" }}>
      <Navbar />
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Download Files</h2>
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "20px", borderRadius: "5px", border: "1px solid gray" }}
      />
      <FileList files={filteredFiles} />
    </div>
  );
};

export default Download;
