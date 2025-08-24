import React, { useState, useRef, useEffect } from "react";
import { FileIcon, formatBytes } from "../utils/helpers.jsx";

const ContextMenu = ({ item, onRename, onDelete, onShare, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-20 py-2"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onShare(item);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <svg
          className="w-4 h-4 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        Share
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRename(item);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <svg
          className="w-4 h-4 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Rename
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(item);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <svg
          className="w-4 h-4 mr-3"
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
        Move to Trash
      </button>
    </div>
  );
};

export default function FileGrid({
  items,
  onItemClick,
  onRenameSubmit,
  onDeleteClick,
  onShareClick,
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const handleRenameClick = (item) => {
    setEditingItem(item.id);
    setName(item.name);
    setActiveMenu(null);
  };

  const handleRename = (e) => {
    e.preventDefault();
    const item = items.find((i) => i.id === editingItem);
    onRenameSubmit(item, name);
    setEditingItem(null);
  };

  useEffect(() => {
    if (editingItem && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingItem]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => editingItem !== item.id && onItemClick(item)}
          className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
        >
          {/* Header with icon and menu */}
          <div className="flex items-start justify-between mb-3 relative">
            <div className="flex-shrink-0">
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

            <button
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === item.id ? null : item.id);
              }}
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {activeMenu === item.id && (
              <ContextMenu
                item={item}
                onRename={handleRenameClick}
                onDelete={onDeleteClick}
                onShare={onShareClick}
                onClose={() => setActiveMenu(null)}
              />
            )}
          </div>

          {/* File name */}
          <div className="min-h-[3rem]">
            {editingItem === item.id ? (
              <form onSubmit={handleRename}>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleRename}
                  className="w-full text-sm font-medium bg-blue-50 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
            ) : (
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5">
                {item.name}
              </h3>
            )}
          </div>

          {/* File size */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">{formatBytes(item.size)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
