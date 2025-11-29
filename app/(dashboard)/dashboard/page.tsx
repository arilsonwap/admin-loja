'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { IoGrid, IoList, IoImage, IoCash } from 'react-icons/io5';
import { getProdutos } from '@/lib/produtos';
import { getCategorias } from '@/lib/categorias';
import { getBanners } from '@/lib/banners';

interface Stats {
  produtos: number;
  categorias: number;
  banners: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    produtos: 0,
    categorias: 0,
    banners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [produtos, categorias, banners] = await Promise.all([
        getProdutos(),
        getCategorias(),
        getBanners(),
      ]);

      setStats({
        produtos: produtos.length,
        categorias: categorias.length,
        banners: banners.length,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Produtos',
      value: stats.produtos,
      icon: IoGrid,
      color: 'bg-blue-500',
    },
    {
      title: 'Categorias',
      value: stats.categorias,
      icon: IoList,
      color: 'bg-green-500',
    },
    {
      title: 'Banners',
      value: stats.banners,
      icon: IoImage,
      color: 'bg-purple-500',
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="pt-16 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bem-vindo ao Admin Loja
          </h1>
          <p className="text-gray-600">
            Aqui você pode gerenciar todos os aspectos da sua loja online
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
                >
                  <div className={`${card.color} p-4 rounded-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/produtos/novo"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <IoGrid className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm font-medium text-gray-700">
                Adicionar Produto
              </p>
            </a>
            <a
              href="/categorias/novo"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <IoList className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm font-medium text-gray-700">
                Adicionar Categoria
              </p>
            </a>
            <a
              href="/banners/novo"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <IoImage className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm font-medium text-gray-700">
                Adicionar Banner
              </p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
