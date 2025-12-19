import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

interface AppShellProps {
  navItems: NavItem[];
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

export function AppShell({
  navItems,
  userName,
  userEmail,
  onLogout,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navWithActive = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: pathname?.startsWith(item.href),
      })),
    [navItems, pathname]
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-40 bg-white border-r border-gray-200 shadow-sm z-40 transform transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-4 flex items-center border-b border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">Goalkeeper Pro</span>            
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>

        <nav className="px-2 py-4 space-y-1 overflow-y-auto h-[calc(100vh-260px)]">
          {navWithActive.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="w-5 h-5 text-gray-500">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 space-y-2">
          <LanguageSwitcher />
          {onLogout && (
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              Cerrar sesión
            </Button>
          )}
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-36">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <button
              className="p-2 rounded-md border border-gray-200 bg-white text-gray-700 lg:hidden"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
