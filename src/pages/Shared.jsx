import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FileIcon, formatBytes } from "../utils/helpers.jsx";
import toast from "react-hot-toast";
import newRequest from "../utils/newRequest";

// Confirmation Modal Component
const ConfirmDeleteModal = ({ item, onClose, onDelete }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete forever?
          </h3>
          <p className="text-gray-500 mb-6">
            <span className="font-medium text-gray-700">"{item.name}"</span>{" "}
            will be deleted forever. This can't be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(item)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Trash() {
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchTrashedItems = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await newRequest.get("/files/trash", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setTrashedItems(response.data);
    } catch (error) {
      console.error("Error fetching trash:", error);
      toast.error("Could not load trash items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrashedItems();
  }, [fetchTrashedItems]);

  const handleRestore = async (item) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const itemType = item.type;

    try {
      await newRequest.post(
        `/files/${itemType}/${item.id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      toast.success(`"${item.name}" restored successfully.`);
      fetchTrashedItems();
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handlePermanentDelete = async (item) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const itemType = item.type;

    try {
      await newRequest.delete(`/files/${itemType}/${item.id}/permanent`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setItemToDelete(null);
      toast.success(`"${item.name}" permanently deleted.`);
      fetchTrashedItems();
    } catch (error) {
      console.error("Permanent delete error:", error);
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
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
              <h1 className="text-2xl font-semibold text-gray-900">Trash</h1>
              <p className="text-gray-600 mt-1">
                Items you've deleted are stored here for 30 days
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading trash...</span>
              </div>
            ) : trashedItems.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="divide-y divide-gray-100">
                  {trashedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mr-4">
                        {item.type === "folder" ? (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-500"
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
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FileIcon type={item.file_type} size="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-700 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatBytes(item.size)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleRestore(item)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restore"
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
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete permanently"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Trash is empty
                </h3>
                <p className="text-gray-500">
                  Items you delete will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      {itemToDelete && (
        <ConfirmDeleteModal
          item={itemToDelete}
          onClose={() => setItemToDelete(null)}
          onDelete={handlePermanentDelete}
        />
      )}
    </div>
  );
}
