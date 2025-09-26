import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold">XShare</h1>
      <div className="flex gap-4">
        <button className="hover:bg-blue-500 px-3 py-1 rounded">Home</button>
        <button className="hover:bg-blue-500 px-3 py-1 rounded">My Files</button>
        <button className="hover:bg-blue-500 px-3 py-1 rounded">Upload</button>
      </div>
    </nav>
  );
};

export default Navbar;
