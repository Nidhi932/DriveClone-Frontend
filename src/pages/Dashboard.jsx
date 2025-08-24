import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import newRequest from "../utils/newRequest";

// Import components
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import FileGrid from "../components/FileGrid";
import FileListComponent from "../components/FileListComponent";
import EmptyStateDropzone from "../components/EmptyStateDropzone";
import NewFolderModal from "../components/NewFolderModal";
import FilePreviewModal from "../components/FilePreviewModal";
import ShareModal from "../components/ShareModal";

// Confirm Delete Modal with updated design
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
            Move to Trash
          </h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to move{" "}
            <span className="font-medium text-gray-700 truncate inline-block max-w-xs">
              "{item.name}"
            </span>
            <br />
            to the trash?
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
              Move to Trash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal States
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToShare, setItemToShare] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  // UI State
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("name-asc");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Folder State
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: null, name: "My Files" },
  ]);

  const location = useLocation();

  const fetchContents = useCallback(
    async (folderId, query) => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        let response;
        const config = {
          headers: { Authorization: `Bearer ${session.access_token}` },
        };

        if (query) {
          response = await newRequest.get(`/files/search?q=${query}`, config);
        } else {
          const [sortBy, sortOrder] = sortOption.split("-");
          response = await newRequest.get(
            `/files/contents?sortBy=${sortBy}&sortOrder=${sortOrder}${
              folderId ? `&folderId=${folderId}` : ""
            }`,
            config
          );
        }

        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Could not load files.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [sortOption]
  );

  useEffect(() => {
    const initialFolder = location.state?.initialFolder;
    if (initialFolder) {
      setCurrentFolderId(initialFolder.id);
      setBreadcrumbs([
        { id: null, name: "My Files" },
        { id: initialFolder.id, name: initialFolder.name },
      ]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      fetchContents(null, searchTerm);
    } else {
      fetchContents(currentFolderId);
    }
  }, [currentFolderId, searchTerm, fetchContents]);

  const handleRename = async (item, newName) => {
    if (!newName.trim() || newName === item.name) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const itemType = item.type;
    try {
      await newRequest.patch(
        `/files/${itemType}/${item.id}`,
        { name: newName },
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      toast.success(`Renamed to "${newName}"`);
      fetchContents(currentFolderId, searchTerm);
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSoftDelete = async (item) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const itemType = item.type;
    const truncateForToast = (name) => {
      return name.length > 25 ? name.substring(0, 25) + "..." : name;
    };
    try {
      await newRequest.post(
        `/files/${itemType}/${item.id}/trash`,
        {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      setItemToDelete(null);
      toast.success(`"${truncateForToast(item.name)}" moved to trash.`);
      fetchContents(currentFolderId, searchTerm);
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFileDownload = async (file) => {
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
        { path: file.storage_path },
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      setPreviewFile({
        url: response.data.signedUrl,
        type: file.file_type,
        name: file.name,
      });
    } catch (error) {
      toast.error(
        `Could not open file: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in.");
      return;
    }
    try {
      await newRequest.post(
        "/files/folders",
        { name: newFolderName, parentFolderId: currentFolderId },
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      setShowNewFolderModal(false);
      setNewFolderName("");
      toast.success(`Folder "${newFolderName}" created.`);
      fetchContents(currentFolderId, searchTerm);
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const toastId = toast.loading(
        `Uploading ${acceptedFiles.length} file(s)...`
      );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to upload.", { id: toastId });
        setUploading(false);
        return;
      }

      const uploadPromises = acceptedFiles.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) formData.append("folderId", currentFolderId);
        return newRequest.post("/files/upload", formData, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      });

      try {
        await Promise.all(uploadPromises);
        toast.success("Upload complete!", { id: toastId });
        fetchContents(currentFolderId, searchTerm);
      } catch (error) {
        toast.error("Upload failed.", { id: toastId });
      } finally {
        setUploading(false);
      }
    },
    [currentFolderId, fetchContents, searchTerm]
  );

  const handleNewFolderClick = () => {
    setNewFolderName("Untitled folder");
    setShowNewFolderModal(true);
  };

  const handleItemClick = (item) => {
    if (searchTerm) setSearchTerm("");
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
      setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    } else {
      handleFileDownload(item);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (searchTerm) setSearchTerm("");
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onNewFolderClick={handleNewFolderClick}
          onUploadClick={open}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        <Breadcrumbs
          crumbs={breadcrumbs}
          onCrumbClick={handleBreadcrumbClick}
        />
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : items.length > 0 ? (
            <div {...getRootProps()} className="h-full">
              <input {...getInputProps()} />
              {viewMode === "grid" ? (
                <FileGrid
                  items={items}
                  onItemClick={handleItemClick}
                  onRenameSubmit={handleRename}
                  onDeleteClick={setItemToDelete}
                  onShareClick={setItemToShare}
                />
              ) : (
                <FileListComponent
                  items={items}
                  onItemClick={handleItemClick}
                  onRenameSubmit={handleRename}
                  onDeleteClick={setItemToDelete}
                  onShareClick={setItemToShare}
                />
              )}
            </div>
          ) : (
            <EmptyStateDropzone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              uploading={uploading}
              onUploadClick={open}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <NewFolderModal
        show={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        onSubmit={handleCreateFolder}
      />
      {itemToDelete && (
        <ConfirmDeleteModal
          item={itemToDelete}
          onClose={() => setItemToDelete(null)}
          onDelete={handleSoftDelete}
        />
      )}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
      {itemToShare && (
        <ShareModal item={itemToShare} onClose={() => setItemToShare(null)} />
      )}
    </div>
  );
}
