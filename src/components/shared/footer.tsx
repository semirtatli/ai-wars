/**
 * Minimal footer with credits and links.
 */
export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950/80 py-4">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500 sm:px-6">
        <p>
          Built with Next.js, Vercel AI SDK & free-tier AI models.{' '}
          <a
            href="https://github.com/semirtatli/ai-wars"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline-offset-4 hover:text-white hover:underline"
          >
            View Source
          </a>
        </p>
      </div>
    </footer>
  );
}
