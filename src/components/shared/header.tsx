'use client';

import { Swords, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { UserMenu } from '@/components/auth/user-menu';

/**
 * Site header with logo, title, user menu, and theme toggle.
 * Client component for theme switching interactivity.
 */
export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <Swords className="h-7 w-7 text-red-500" />
          <span className="text-xl font-bold tracking-tight text-white">
            AI <span className="text-red-500">Wars</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
