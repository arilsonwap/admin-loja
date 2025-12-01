'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { getCategorias, deleteCategoria } from '@/lib/categorias';
import { Categoria } from '@/types';

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }, []);

  const removerCategoria = async (id: string) => {
    try {
      await deleteCategoria(id);
      startTransition(() => loadCategorias());
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      setError('Erro ao deletar categoria.');
    }
  };

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  return {
    categorias,
    loading,
    error,
    removerCategoria,
    reload: loadCategorias,
    isPending,
  };
}

