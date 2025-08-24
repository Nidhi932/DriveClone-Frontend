import React, { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import newRequest from "../utils/newRequest";

export default function ShareModal({ item, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [publicLink, setPublicLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  if (!item) return null;

  const handleShareWithUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const itemType = item.type;

    try {
      const response = await newRequest.post(
        `/files/share`,
        { itemId: item.id, itemType, email, role },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      toast.success(response.data.message);
      setEmail("");
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPublicLink = async () => {
    setLinkLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const itemType = item.type;

    if (itemType === "folder") {
      toast.error("Public links are not yet supported for folders.");
      setLinkLoading(false);
      return;
    }

    try {
      const response = await newRequest.get(`/files/${item.id}/public-link`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setPublicLink(response.data.publicUrl);
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLinkLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Share</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <svg
                className="w-6 h-6"
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

          <div className="space-y-6">
            {/* Share with people */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Share with people
              </h3>
              <form onSubmit={handleShareWithUser} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <div className="flex gap-3">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-300"
                    disabled={loading}
                  >
                    {loading ? "Sharing..." : "Share"}
                  </button>
                </div>
              </form>
            </div>

            {/* Public link */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Get shareable link
              </h3>
              {publicLink ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicLink}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy link"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGetPublicLink}
                  disabled={linkLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline disabled:text-gray-400"
                >
                  {linkLoading ? "Creating link..." : "Create public link"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
