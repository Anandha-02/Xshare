// src/services/fileService.js
import { axiosInstance } from "./filesService";

/**
 * Advanced fileService for chunked/resumable uploads + file operations.
 *
 * Expected backend endpoints (adjust if your backend uses different routes):
 *  POST /files/init           { fileName, fileSize, fileId, totalChunks }
 *  GET  /files/status?fileId=  -> { uploaded: [0,1,2,...] }
 *  POST /files/upload-chunk   formData { chunk, fileId, chunkIndex, fileName }
 *  POST /files/complete       { fileId, fileName, totalChunks }
 *  GET  /files/myfiles
 *  GET  /files/download/:id
 *  DELETE /files/:id
 */

/** Default chunk size (5MB) */
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

/** Default concurrency */
const DEFAULT_CONCURRENCY = 3;

/** Simple deterministic ID for file (based on name/size/lastModified) */
const createFileId = (file) => {
  const seed = `${file.name}-${file.size}-${file.lastModified}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const safe = file.name.replace(/\W+/g, "_");
  return `${safe}_${Math.abs(hash).toString(36)}_${file.size.toString(36)}`;
};

/** Helper: chunk size for index (handles last chunk) */
const chunkSizeForIndex = (index, fileSize, chunkSize) => {
  const start = index * chunkSize;
  const end = Math.min(fileSize, start + chunkSize);
  return end - start;
};

/**
 * Upload a file in chunks with resumability and concurrency.
 *
 * @param {File} file - File object from input
 * @param {Object} opts - options
 *   - chunkSize (bytes)
 *   - concurrency (number)
 *   - onProgress ({ loaded, total, percent }) => void
 *   - onChunkUploaded (index) => void
 *   - onError (err) => void
 *   - signal (AbortSignal) optional to abort
 *
 * @returns Promise resolving to server response of the final "complete" endpoint
 */
export const uploadFile = async (file, opts = {}) => {
  const chunkSize = opts.chunkSize || DEFAULT_CHUNK_SIZE;
  const concurrency = opts.concurrency || DEFAULT_CONCURRENCY;
  const onProgress = typeof opts.onProgress === "function" ? opts.onProgress : () => {};
  const onChunkUploaded = typeof opts.onChunkUploaded === "function" ? opts.onChunkUploaded : () => {};
  const onError = typeof opts.onError === "function" ? opts.onError : () => {};
  const signal = opts.signal;

  const fileId = createFileId(file);
  const totalChunks = Math.ceil(file.size / chunkSize);

  // 1) Initialize upload on server
  await axiosInstance.post("/files/init", {
    fileName: file.name,
    fileSize: file.size,
    fileId,
    totalChunks,
  });

  // 2) Ask server which chunks are already uploaded (for resumable uploads)
  const statusRes = await axiosInstance.get(`/files/status`, { params: { fileId } });
  const uploadedIndices = new Set(Array.isArray(statusRes?.data?.uploaded) ? statusRes.data.uploaded : []);
  // compute already uploaded bytes precisely
  let uploadedBytes = 0;
  uploadedIndices.forEach((idx) => {
    uploadedBytes += chunkSizeForIndex(idx, file.size, chunkSize);
  });

  // queues
  const queue = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedIndices.has(i)) queue.push(i);
  }

  // per-chunk progress tracking for active uploads
  const perChunkLoaded = new Map();

  // worker pool
  let abortCalled = false;

  const worker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) {
        abortCalled = true;
        throw new Error("Upload aborted");
      }

      const idx = queue.shift();
      if (idx === undefined) break;

      const start = idx * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const blob = file.slice(start, end);
      const form = new FormData();
      form.append("chunk", blob);
      form.append("fileId", fileId);
      form.append("chunkIndex", idx);
      form.append("fileName", file.name);

      try {
        await axiosInstance.post("/files/upload-chunk", form, {
          // pass signal if provided (modern axios supports AbortSignal)
          ...(signal ? { signal } : {}),
          onUploadProgress: (ev) => {
            perChunkLoaded.set(idx, ev.loaded);
            const inProgressBytes = Array.from(perChunkLoaded.values()).reduce((s, v) => s + v, 0);
            const currentUploaded = uploadedBytes + inProgressBytes;
            const percent = Math.min(100, Math.round((currentUploaded / file.size) * 100));
            onProgress({ loaded: currentUploaded, total: file.size, percent });
          },
        });

        // chunk uploaded successfully
        // remove per-chunk progress and update uploadedBytes by the exact chunk size
        perChunkLoaded.delete(idx);
        const actualChunkSize = end - start;
        uploadedBytes += actualChunkSize;
        uploadedIndices.add(idx);
        onChunkUploaded(idx);

        // emit progress after chunk completes
        const percent = Math.min(100, Math.round((uploadedBytes / file.size) * 100));
        onProgress({ loaded: uploadedBytes, total: file.size, percent });
      } catch (err) {
        // push the index back for retry logic if not aborted
        if (!abortCalled) queue.unshift(idx);
        onError(err);
        throw err;
      }
    }
  };

  // start pool
  const workers = Array.from({ length: Math.min(concurrency, Math.max(1, queue.length)) }).map(() => worker());
  try {
    await Promise.all(workers);
  } catch (err) {
    // rethrow after notifying
    throw err;
  }

  if (signal?.aborted) throw new Error("Upload aborted");

  // 3) Tell server to merge chunks & finalize
  const completeRes = await axiosInstance.post("/files/complete", {
    fileId,
    fileName: file.name,
    totalChunks,
  });

  return completeRes.data;
};

/** Get upload status (which chunks uploaded) */
export const getUploadStatus = async (fileId) => {
  const res = await axiosInstance.get("/files/status", { params: { fileId } });
  return res.data;
};

/** Download file as blob (caller should handle saving) */
export const downloadFile = async (fileIdOrDbId) => {
  const res = await axiosInstance.get(`/files/download/${fileIdOrDbId}`, { responseType: "blob" });
  return res.data; // Blob
};

/** List files uploaded by current user */
export const listMyFiles = async () => {
  const res = await axiosInstance.get("/files/myfiles");
  return res.data;
};

/** Delete file by id */
export const deleteFile = async (fileIdOrDbId) => {
  const res = await axiosInstance.delete(`/files/${fileIdOrDbId}`);
  return res.data;
};

/** Get direct download URL (if backend supports presigned links) */
export const getDownloadLink = async (fileIdOrDbId) => {
  const res = await axiosInstance.get(`/files/link/${fileIdOrDbId}`);
  return res.data;
};

const fileService = {
  uploadFile,
  getUploadStatus,
  downloadFile,
  listMyFiles,
  deleteFile,
  getDownloadLink,
};

export default fileService;
