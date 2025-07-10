import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import ProfileEdit from "./ProfileEdit";

export default function Header() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClick);
        } else {
            document.removeEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    return (
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 px-4 py-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow gap-4 md:gap-0">
            <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="logo" width={60} height={34} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                        Money Tracker
                    </h1>
                    <p className="text-sm text-gray-500">
                        Take control of your finances
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end w-full md:w-auto">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((open) => !open)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition"
                        aria-haspopup="true"
                        aria-expanded={menuOpen}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                        </div>
                        <span className="font-medium text-gray-800">{user?.displayName || user?.email}</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button
                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700"
                                onClick={() => { setMenuOpen(false); setProfileModalOpen(true); }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Profile Edit
                            </button>
                            <button
                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                                onClick={() => { setMenuOpen(false); if (confirm("Are you sure you want to logout?")) { logout(); } }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                <ProfileEdit isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
            </div>
        </header>
    )
}


