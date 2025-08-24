import React from "react";

export default function EmptyStateDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  uploading,
  onUploadClick,
}) {
  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl transition-all ${
        isDragActive
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />

      <div className="text-center">
        {uploading ? (
          <>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Uploading files...
            </h3>
            <p className="text-gray-500">
              Please wait while we upload your files.
            </p>
          </>
        ) : isDragActive ? (
          <>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here
            </h3>
            <p className="text-gray-500">Release to upload your files.</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              This folder is empty
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop files here, or{" "}
              <button
                type="button"
                onClick={onUploadClick}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                browse to upload
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
