'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Button from '@/components/Button';
import { getBanners, deleteBanner } from '@/lib/banners';
import { Banner } from '@/types';
import { IoAdd, IoTrash, IoCreate } from 'react-icons/io5';
import Image from 'next/image';

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este banner?')) return;

    try {
      await deleteBanner(id);
      await loadBanners();
    } catch (error) {
      console.error('Erro ao deletar banner:', error);
      alert('Erro ao deletar banner');
    }
  };

  const columns = [
    {
      key: 'imagem',
      label: 'Preview',
      render: (banner: Banner) => (
        <div className="relative w-32 h-16">
          <Image
            src={banner.imagem}
            alt="Banner"
            fill
            className="object-cover rounded"
          />
        </div>
      ),
    },
    { key: 'ordem', label: 'Ordem' },
    {
      key: 'ativo',
      label: 'Status',
      render: (banner: Banner) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            banner.ativo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {banner.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (banner: Banner) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/banners/${banner.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <IoCreate size={20} />
          </button>
          <button
            onClick={() => handleDelete(banner.id!)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Deletar"
          >
            <IoTrash size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="Banners" />
      <div className="pt-16 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciar Banners
            </h1>
            <p className="text-gray-600">
              {banners.length} banner(s) cadastrado(s)
            </p>
          </div>
          <Button onClick={() => router.push('/banners/novo')}>
            <span className="flex items-center gap-2">
              <IoAdd size={20} />
              Novo Banner
            </span>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={banners}
            keyExtractor={(banner) => banner.id!}
          />
        )}
      </div>
    </>
  );
}
