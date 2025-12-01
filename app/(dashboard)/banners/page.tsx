'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Tem certeza que deseja deletar este banner?')) return;

      try {
        setDeleting(id);
        await deleteBanner(id);
        await loadBanners();
      } catch (error) {
        console.error('Erro ao deletar banner:', error);
        alert('Erro ao deletar banner');
      } finally {
        setDeleting(null);
      }
    },
    [loadBanners]
  );

  const columns = useMemo(
    () => [
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
              className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              disabled={deleting === banner.id}
              title="Deletar"
            >
              {deleting === banner.id ? (
                <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoTrash size={20} />
              )}
            </button>
          </div>
        ),
      },
    ],
    [router, handleDelete, deleting]
  );

  return (
    <>
      <Header title="Banners" />
      <div className="pt-16 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Banners</h1>
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
        ) : banners.length === 0 ? (
          <p className="text-gray-500 text-center py-24">Nenhum banner cadastrado.</p>
        ) : (
          <Table columns={columns} data={banners} keyExtractor={(b) => b.id!} />
        )}
      </div>
    </>
  );
}
