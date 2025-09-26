// src/utils/formatFileSize.js

/**
 * Convert bytes into a human-readable string.
 * Supports B, KB, MB, GB, TB, PB.
 *
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimals (default 2)
 * @returns {string} - Formatted size string
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (typeof bytes !== "number" || isNaN(bytes)) return "Invalid size";
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "Invalid size";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
};

export default formatFileSize;
