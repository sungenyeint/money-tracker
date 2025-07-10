"use client";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

interface ProfileEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

export default function ProfileEdit({ isOpen, onClose, onSave }: ProfileEditProps) {
    const { user, updateProfile } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [password, setPassword] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    if (!isOpen) return null;
    if (!user) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (password) {
                await updateProfile({ displayName, password});
            } else {
                await updateProfile({ displayName });
            }
            setMessage("Profile updated successfully.");
            if (onSave) onSave();
        } catch (err: unknown) {
            console.log(err instanceof Error ? err.message : 'Unknown error');
            setMessage("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm px-2 py-2">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 sm:p-0 overflow-y-auto max-h-screen">
                <div className="flex items-center justify-between border-b px-3 py-3">
                    <h2 className="text-lg font-bold text-gray-800">Edit Profile</h2>
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSave} className="px-3 py-4 space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                        <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="password"
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {message && (
                        <div className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-150 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
