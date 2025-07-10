import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmail(email, password);
            } else {
                await registerWithEmail(email, password);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-3 text-center text-gray-800">Money Tracker</h1>
                <p className="text-xl font-bold mb-6 text-center text-gray-800">{isLogin ? 'Login' : 'Sign Up'}</p>
                <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-2 rounded transition-colors duration-200"
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-200" />
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <div className="flex-grow h-px bg-gray-200" />
                </div>
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded transition-colors duration-200 shadow-sm"
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 48 48" className="inline-block"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.13 17.56 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.93 23.93 0 0 0 0 24c0 3.93.94 7.65 2.69 10.89l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.59l-7.19-5.6c-2.01 1.35-4.6 2.15-7.95 2.15-6.44 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/></g></svg>
                    {loading ? 'Please wait...' : 'Sign in with Google'}
                </button>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full mt-4 text-blue-600 hover:underline text-sm"
                >
                    {isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Login'}
                </button>
                {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
            </div>
        </div>
    );
}
