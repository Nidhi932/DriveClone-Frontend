import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FileIcon, formatBytes } from "../utils/helpers.jsx";
import newRequest from "../utils/newRequest";
import toast from "react-hot-toast";

// File Preview Modal (same as updated version)
const FilePreviewModal = ({ file, onClose }) => {
  if (!file || !file.url) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error("Network response was not ok");
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
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-4-4m4 4l4-4m6-8V4a2 2 0 00-2-2H8a2 2 0 00-2 2v4m20 4H4"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
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
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Shared() {
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchSharedItems = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await newRequest.get("/files/shared-with-me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setSharedItems(response.data);
    } catch (error) {
      console.error("Error fetching shared files:", error);
      toast.error("Could not load shared files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSharedItems();
  }, [fetchSharedItems]);

  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      navigate("/", { state: { initialFolder: item } });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You need to be logged in.");
      return;
    }

    try {
      const response = await newRequest.post(
        "/files/signed-url",
        { path: item.storage_path },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setPreviewFile({
        url: response.data.signedUrl,
        type: item.file_type,
        name: item.name,
      });
    } catch (error) {
      console.error("Error getting signed URL:", error);
      toast.error("Could not open file.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onLogout={() => supabase.auth.signOut()}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Shared with me
              </h1>
              <p className="text-gray-600 mt-1">
                Files and folders that others have shared with you
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">
                  Loading shared files...
                </span>
              </div>
            ) : sharedItems.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="divide-y divide-gray-100">
                  {sharedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex-shrink-0 mr-4">
                        {item.type === "folder" ? (
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileIcon type={item.file_type} size="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatBytes(item.size)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No shared files
                </h3>
                <p className="text-gray-500">
                  Files and folders shared with you will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
