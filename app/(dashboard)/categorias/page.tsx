'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Button from '@/components/Button';
import { getCategorias, deleteCategoria } from '@/lib/categorias';
import { Categoria } from '@/types';
import { IoAdd, IoTrash, IoCreate } from 'react-icons/io5';
import * as Icons from 'react-icons/io5';

export default function CategoriasPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return;

    try {
      await deleteCategoria(id);
      await loadCategorias();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria');
    }
  };

  const columns = [
    {
      key: 'icone',
      label: 'Ícone',
      render: (categoria: Categoria) => {
        const IconComponent = (Icons as any)[categoria.icone];
        return IconComponent ? (
          <IconComponent size={24} className="text-blue-600" />
        ) : (
          <span className="text-gray-400">-</span>
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
            onClick={() => handleDelete(categoria.id!)}
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
      <Header title="Categorias" />
      <div className="pt-16 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciar Categorias
            </h1>
            <p className="text-gray-600">
              {categorias.length} categoria(s) cadastrada(s)
            </p>
          </div>
          <Button onClick={() => router.push('/categorias/novo')}>
            <span className="flex items-center gap-2">
              <IoAdd size={20} />
              Nova Categoria
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
            data={categorias}
            keyExtractor={(categoria) => categoria.id!}
          />
        )}
      </div>
    </>
  );
}
