'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/nextjs';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/create-timetable', label: 'Create Timetable' },
  { href: '/my-timetables', label: 'My Timetables' },
  { href: '/analytics', label: 'Analytics' },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            Samay Sahayak
          </Link>
          <SignedIn>
            <ul className="flex items-center gap-4 ml-6">
              {navLinks.slice(1).map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-base font-medium px-3 py-1 rounded transition-colors duration-150 ${
                      pathname === link.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SignedIn>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-base font-medium px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 font-medium">
                Welcome, {user?.firstName || user?.username || 'User'}!
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
} 