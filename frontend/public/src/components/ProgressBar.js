import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
      <div
        className="bg-blue-500 h-full text-center text-white text-sm font-semibold transition-all duration-500"
        style={{ width: `${progress}%` }}
      >
        {progress > 0 && `${progress}%`}
      </div>
    </div>
  );
};

export default ProgressBar;
