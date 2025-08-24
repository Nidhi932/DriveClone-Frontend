import React from "react";
import toast from "react-hot-toast";

export default function FilePreviewModal({ file, onClose }) {
  if (!file || !file.url) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Could not download the file.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                id="download"
              >
                <g
                  fill="none"
                  fill-rule="evenodd"
                  stroke="#4a5565"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                >
                  <path d="M1 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M6 11l4 4 4-4M10 1v14"></path>
                </g>
              </svg>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {file.type.startsWith("image/") ? (
            <div className="h-full flex items-center justify-center p-4">
              <img
                src={file.url}
                alt="File preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <iframe
              src={file.url}
              title="File preview"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
