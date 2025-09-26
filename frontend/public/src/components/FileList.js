import React from "react";

const FileList = ({ files }) => {
  if (!files.length) return <p className="text-gray-500">No files uploaded yet.</p>;

  const sortedFiles = [...files].sort((a, b) => a.file.name.localeCompare(b.file.name));

  return (
    <div className="mt-4">
      <h2 className="font-bold text-lg mb-2">Uploaded Files</h2>
      <ul className="space-y-2">
        {sortedFiles.map(({ file, id }) => (
          <li key={id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button className="text-blue-500 hover:text-blue-700">Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
