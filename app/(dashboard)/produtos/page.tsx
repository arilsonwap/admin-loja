'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Button from '@/components/Button';
import { getProdutos, deleteProduto } from '@/lib/produtos';
import { Produto } from '@/types';
import { IoAdd, IoTrash, IoCreate } from 'react-icons/io5';
import Image from 'next/image';

export default function ProdutosPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await deleteProduto(id);
      await loadProdutos();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto');
    }
  };

  const columns = [
    {
      key: 'imagens',
      label: 'Imagem',
      render: (produto: Produto) => (
        <div className="relative w-16 h-16">
          {produto.imagens[0] ? (
            <Image
              src={produto.imagens[0]}
              alt={produto.nome}
              fill
              className="object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">Sem imagem</span>
            </div>
          )}
        </div>
      ),
    },
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria' },
    {
      key: 'preco',
      label: 'Preço',
      render: (produto: Produto) => (
        <span className="font-semibold">
          R$ {produto.preco.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'emPromocao',
      label: 'Promoção',
      render: (produto: Produto) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            produto.emPromocao
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {produto.emPromocao ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (produto: Produto) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/produtos/${produto.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <IoCreate size={20} />
          </button>
          <button
            onClick={() => handleDelete(produto.id!)}
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
      <Header title="Produtos" />
      <div className="pt-16 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciar Produtos
            </h1>
            <p className="text-gray-600">
              {produtos.length} produto(s) cadastrado(s)
            </p>
          </div>
          <Button onClick={() => router.push('/produtos/novo')}>
            <span className="flex items-center gap-2">
              <IoAdd size={20} />
              Novo Produto
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
            data={produtos}
            keyExtractor={(produto) => produto.id!}
          />
        )}
      </div>
    </>
  );
}
