import { useState, useEffect, useCallback, useRef } from 'react';
import { getProdutos } from '@/lib/produtos';
import { Produto } from '@/types';

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Previne chamadas duplicadas no React 18 Strict Mode
  const hasLoaded = useRef(false);

  const loadProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProdutos();

      // Validação do retorno da API
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido recebido da API');
      }

      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Não foi possível carregar os produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Função separada para recarregar (ignora bloqueio de carregamento único)
  const refresh = useCallback(async () => {
    await loadProdutos();
  }, [loadProdutos]);

  useEffect(() => {
    // Previne execução duplicada no Strict Mode (React 18)
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    loadProdutos();
  }, [loadProdutos]);

  return { produtos, setProdutos, loading, error, loadProdutos, refresh };
}
