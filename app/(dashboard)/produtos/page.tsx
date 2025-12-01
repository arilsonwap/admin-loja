'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Button from '@/components/Button';
import ProductBadge from '@/components/ProductBadge';
import StatusTag from '@/components/StatusTag';
import { deleteProduto } from '@/lib/produtos';
import { Produto } from '@/types';
import { useProdutos } from '@/hooks/useProdutos';
import { IoAdd, IoTrash, IoCreate, IoGrid, IoSparkles, IoFlame, IoSearch } from 'react-icons/io5';
import Image from 'next/image';

type FilterType = 'todos' | 'novos' | 'promocao';

export default function ProdutosPage() {
  const router = useRouter();
  const { produtos, setProdutos, loading, error, loadProdutos } = useProdutos();
  const [filtroAtivo, setFiltroAtivo] = useState<FilterType>('todos');
  const [searchValue, setSearchValue] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setTermoPesquisa(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    setDeletandoId(id);
    try {
      await deleteProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto');
    } finally {
      setDeletandoId(null);
    }
  };

  // Colunas da tabela com useMemo
  const columns = useMemo(() => [
    {
      key: 'imagens',
      label: 'Imagem',
      render: (produto: Produto) => (
        <div className="relative w-16 h-16">
          {produto.imagens[0] ? (
            <>
              <Image
                src={produto.imagens[0]}
                alt={produto.nome}
                fill
                className="object-cover rounded"
              />
              <ProductBadge
                isNovo={produto.isNovo}
                emPromocao={produto.emPromocao}
                className="scale-75 origin-top-left"
              />
            </>
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
        <StatusTag
          active={produto.emPromocao}
          activeColor="bg-red-100 text-red-800"
          inactiveColor="bg-gray-100 text-gray-800"
        >
          {produto.emPromocao ? 'Sim' : 'Não'}
        </StatusTag>
      ),
    },
    {
      key: 'isNovo',
      label: 'Novo',
      render: (produto: Produto) => (
        <StatusTag
          active={produto.isNovo}
          activeColor="bg-blue-100 text-blue-800"
          inactiveColor="bg-gray-100 text-gray-800"
        >
          {produto.isNovo ? 'Sim' : 'Não'}
        </StatusTag>
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
            aria-label="Editar produto"
          >
            <IoCreate size={20} />
          </button>
          <button
            onClick={() => handleDelete(produto.id!)}
            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
            title="Deletar"
            aria-label="Excluir produto"
            disabled={deletandoId === produto.id}
          >
            {deletandoId === produto.id ? (
              <div className="animate-spin h-5 w-5 border-b-2 border-red-600 rounded-full" />
            ) : (
              <IoTrash size={20} />
            )}
          </button>
        </div>
      ),
    },
  ], [router]);

  // Função de filtragem com useCallback
  const filtrarProdutos = useCallback(() => {
    return produtos.filter((produto) => {
      const matchFiltro =
        filtroAtivo === 'todos' ||
        (filtroAtivo === 'novos' && produto.isNovo) ||
        (filtroAtivo === 'promocao' && produto.emPromocao);

      const termo = termoPesquisa.toLowerCase();
      const matchTermo =
        produto.nome.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo);

      return matchFiltro && matchTermo;
    });
  }, [produtos, filtroAtivo, termoPesquisa]);

  // Produtos filtrados com useMemo
  const produtosFiltrados = useMemo(() => filtrarProdutos(), [filtrarProdutos]);

  // Cards de estatísticas com useMemo
  const cards = useMemo(() => [
    {
      title: 'Total',
      value: produtos.length,
      icon: IoGrid,
      color: 'bg-blue-500',
      filtro: 'todos' as FilterType,
    },
    {
      title: 'Novos',
      value: produtos.filter(p => p.isNovo).length,
      icon: IoSparkles,
      color: 'bg-purple-500',
      filtro: 'novos' as FilterType,
    },
    {
      title: 'Em Promoção',
      value: produtos.filter(p => p.emPromocao).length,
      icon: IoFlame,
      color: 'bg-red-500',
      filtro: 'promocao' as FilterType,
    },
  ], [produtos]);

  return (
    <>
      <Header title="Produtos" />
      <div className="pt-16 p-8">
        {/* Barra de Pesquisa */}
        {!loading && (
          <div className="mb-6">
            <div className="relative">
              <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Pesquisar por nome ou categoria..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Pesquisar produtos"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              const isActive = filtroAtivo === card.filtro;
              return (
                <button
                  key={card.title}
                  onClick={() => setFiltroAtivo(card.filtro)}
                  aria-label={`Filtrar por ${card.title.toLowerCase()}`}
                  className={`bg-white rounded-lg shadow p-6 flex items-center gap-4 transition-all
                    hover:scale-[1.02] hover:shadow-xl cursor-pointer ${
                    isActive ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  <div className={`${card.color} p-4 rounded-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-600 text-sm">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciar Produtos
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600">
                Mostrando {produtosFiltrados.length} de {produtos.length} produto(s)
              </p>
              {filtroAtivo !== 'todos' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Filtro: {filtroAtivo === 'novos' ? 'Novos' : 'Em Promoção'}
                </span>
              )}
              {termoPesquisa && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <IoSearch size={12} className="mr-1" />
                  "{termoPesquisa}"
                </span>
              )}
            </div>
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
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-16 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-2">
              Erro ao carregar produtos
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {error}
            </p>
            <Button onClick={loadProdutos}>
              Tentar novamente
            </Button>
          </div>
        ) : produtosFiltrados.length > 0 ? (
          <Table
            columns={columns}
            data={produtosFiltrados}
            keyExtractor={(produto) => produto.id!}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-16 text-center">
            <IoSearch size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              Nenhum produto encontrado com os filtros aplicados.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Tente ajustar sua pesquisa ou limpar os filtros
            </p>
            <Button
              onClick={() => {
                setFiltroAtivo('todos');
                setSearchValue('');
                setTermoPesquisa('');
              }}
              variant="secondary"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
