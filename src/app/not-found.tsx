import Link from 'next/link';

/**
 * 404 page — shown when a route doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-4xl font-bold text-white">404</h2>
        <p className="mb-4 text-sm text-zinc-400">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
