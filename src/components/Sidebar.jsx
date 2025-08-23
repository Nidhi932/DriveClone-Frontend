import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ onLogout, isOpen, setIsOpen }) {
  const location = useLocation();

  const sidebarClasses = `
    bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
    md:w-64 md:translate-x-0 md:relative md:z-0
    fixed top-0 left-0 h-full z-40 w-64 
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">DriveClone</h1>
          <p className="text-sm text-gray-500 mt-1">File Storage</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
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
            My Files
          </Link>

          <Link
            to="/shared"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/shared"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
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
            Shared with me
          </Link>

          <Link
            to="/trash"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/trash"
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
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
            Trash
          </Link>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
