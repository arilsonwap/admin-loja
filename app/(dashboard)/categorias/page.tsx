'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'react-icons/io5';

import Header from '@/components/Header';
import Table from '@/components/Table';
import PageHeader from '@/components/PageHeader';
import ConfirmModal from '@/components/ConfirmModal';

import { useCategorias } from '@/hooks/useCategorias';
import { Categoria } from '@/types';
import { IoAdd, IoCreate, IoTrash } from 'react-icons/io5';

export default function CategoriasPage() {
  const router = useRouter();
  const { categorias, loading, removerCategoria } = useCategorias();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const ICON_MAP = useMemo(() => Icons, []);

  const columns = useMemo(
    () => [
      {
        key: 'icone',
        label: 'Ícone',
        render: (categoria: Categoria) => {
          const IconComponent = ICON_MAP[categoria.icone as keyof typeof Icons];
          return IconComponent ? (
            <IconComponent size={24} className="text-blue-600" />
          ) : (
            <span className="text-gray-300">—</span>
          );
        },
      },
      { key: 'nome', label: 'Nome' },
      { key: 'ordem', label: 'Ordem' },
      {
        key: 'acoes',
        label: 'Ações',
        render: (categoria: Categoria) => (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/categorias/${categoria.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Editar"
            >
              <IoCreate size={20} />
            </button>

            <button
              onClick={() => setDeleteId(categoria.id!)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Deletar"
            >
              <IoTrash size={20} />
            </button>
          </div>
        ),
      },
    ],
    [router, ICON_MAP]
  );

  return (
    <>
      <Header title="Categorias" />

      <div className="pt-16 p-8">
        <PageHeader
          title="Gerenciar Categorias"
          count={categorias.length}
          buttonLabel="Nova Categoria"
          buttonIcon={IoAdd}
          onButtonClick={() => router.push('/categorias/novo')}
        />

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={categorias}
            keyExtractor={(categoria) => categoria.id!}
          />
        )}
      </div>

      {/* Modal de confirmação */}
      <ConfirmModal
        open={!!deleteId}
        message="Tem certeza que deseja deletar esta categoria?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          removerCategoria(deleteId!);
          setDeleteId(null);
        }}
      />
    </>
  );
}
