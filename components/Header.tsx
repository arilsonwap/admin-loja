'use client';

import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
      </div>
    </header>
  );
}
