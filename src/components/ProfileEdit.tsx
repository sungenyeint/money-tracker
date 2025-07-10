"use client";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { updatePassword } from "firebase/auth";
import React from "react";

interface ProfileEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

const schema = yup.object().shape({
    displayName: yup.string().required("Display name is required"),
    password: yup
        .string()
        .notRequired()
        .when({
            is: (val: string | undefined) => val && val.length > 0,
            then: (schema) => schema.min(6, "Password must be at least 6 characters"),
        }),
    confirmPassword: yup.string().when("password", {
        is: (val: string) => val && val.length > 0,
        then: (schema) => schema.required("Please confirm your password").oneOf([yup.ref("password")], "Passwords must match"),
        otherwise: (schema) => schema.notRequired(),
    }),
});

export default function ProfileEdit({ isOpen, onClose, onSave }: ProfileEditProps) {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            displayName: user?.displayName || "",
            password: "",
            confirmPassword: "",
        },
    });

    // Update displayName in form if user changes
    // (for when modal is opened/closed with different users)
    React.useEffect(() => {
        setValue("displayName", user?.displayName || "");
    }, [user, setValue]);

    if (!isOpen) return null;
    if (!user) return null;

    const onSubmit = async (data: { displayName: string; password?: string | null; confirmPassword?: string | null }) => {
        setLoading(true);
        setMessage(null);
        try {
            // Update display name if changed
            if (data.displayName !== user.displayName) {
                await updateProfile({ displayName: data.displayName });
            }
            // Update password if provided
            if (data.password && data.password.length > 0) {
                await updatePassword(user, data.password);
            }
            setMessage("Profile updated successfully.");
            reset({ displayName: data.displayName, password: "", confirmPassword: "" });
            if (onSave) onSave();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Failed to update profile.");
            }
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
                <form onSubmit={handleSubmit(onSubmit)} className="px-3 py-4 space-y-4" autoComplete="off">
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
                            {...register("displayName")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.displayName && <p className="text-red-600 text-sm mt-1">{errors.displayName.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">New Password</label>
                        <input
                            type="password"
                            placeholder="New password"
                            {...register("password")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            {...register("confirmPassword")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
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
