import React from "react";

export default function Breadcrumbs({ crumbs, onCrumbClick }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm">
        {crumbs.map((crumb, index) => (
          <div key={crumb.id || "root"} className="flex items-center">
            <button
              onClick={() => onCrumbClick(index)}
              className={`text-sm font-medium transition-colors ${
                index === crumbs.length - 1
                  ? "text-gray-900 cursor-default"
                  : "text-blue-600 hover:text-blue-800 hover:underline"
              }`}
            >
              {crumb.name}
            </button>
            {index < crumbs.length - 1 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
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
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
