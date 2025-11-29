'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoHome, IoGrid, IoList, IoImage, IoLogOut } from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: IoHome },
  { href: '/produtos', label: 'Produtos', icon: IoGrid },
  { href: '/categorias', label: 'Categorias', icon: IoList },
  { href: '/banners', label: 'Banners', icon: IoImage },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Admin Loja</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <IoLogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
