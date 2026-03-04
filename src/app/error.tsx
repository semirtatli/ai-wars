'use client';

/**
 * Global error boundary.
 * Catches runtime errors in any route segment.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">Something went wrong</h2>
        <p className="mb-4 text-sm text-zinc-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
