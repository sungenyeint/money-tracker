'use client';

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Something went wrong!</h2>
            <pre className="text-red-600 my-4 whitespace-pre-wrap break-words">
            {error.message}
            </pre>
            <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
            Try again
            </button>
        </div>
    );
}
