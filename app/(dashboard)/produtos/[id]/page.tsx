'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import FileUploader from '@/components/FileUploader';
import ImagePreview from '@/components/ImagePreview';
import { getProduto, updateProduto, uploadImagem } from '@/lib/produtos';
import { getCategorias } from '@/lib/categorias';
import { Categoria } from '@/types';
import { useToast } from '@/components/Toast';

const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  precoOriginal: z.number().optional(),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  emPromocao: z.boolean(),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagemUrls, setImagemUrls] = useState<string[]>([]);
  const [novasImagemFiles, setNovasImagemFiles] = useState<File[]>([]);
  const [novasImagemPreviews, setNovasImagemPreviews] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
  });

  const emPromocao = watch('emPromocao');
  const preco = watch('preco');
  const nome = watch('nome');
  const categoria = watch('categoria');

  useEffect(() => {
    loadData();
  }, [id]);

  // Quando ativar promoção, transferir preço atual para preço original
  useEffect(() => {
    if (emPromocao && preco && !watch('precoOriginal')) {
      setValue('precoOriginal', preco);
      setValue('preco', 0);
    }
  }, [emPromocao]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (!loading && (nome || categoria || preco || novasImagemFiles.length > 0)) {
      setHasUnsavedChanges(true);
    }
  }, [nome, categoria, preco, novasImagemFiles.length, loading]);

  // Confirmação de saída
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !saving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saving]);

  const loadData = async () => {
    try {
      const [produto, categoriasData] = await Promise.all([
        getProduto(id),
        getCategorias(),
      ]);

      if (!produto) {
        showToast('Produto não encontrado', 'error');
        router.push('/produtos');
        return;
      }

      setCategorias(categoriasData);
      setImagemUrls(produto.imagens);

      // Preencher formulário
      setValue('nome', produto.nome);
      setValue('preco', produto.preco);
      setValue('precoOriginal', produto.precoOriginal);
      setValue('categoria', produto.categoria);
      setValue('descricao', produto.descricao);
      setValue('emPromocao', produto.emPromocao);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      showToast('Erro ao carregar produto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setNovasImagemFiles((prev) => [...prev, ...files]);

    // Criar previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovasImagemPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    setImagemUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNovasImagemFiles((prev) => prev.filter((_, i) => i !== index));
    setNovasImagemPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProdutoFormData) => {
    setSaving(true);

    try {
      // Upload de novas imagens
      const novasImagemUrls: string[] = [];
      for (const file of novasImagemFiles) {
        const timestamp = Date.now();
        const url = await uploadImagem(file, `produtos/${timestamp}_${file.name}`);
        novasImagemUrls.push(url);
      }

      // Combinar imagens existentes com novas
      const todasImagens = [...imagemUrls, ...novasImagemUrls];

      if (todasImagens.length === 0) {
        showToast('O produto deve ter pelo menos uma imagem', 'warning');
        setSaving(false);
        return;
      }

      // Atualizar produto
      await updateProduto(id, {
        ...data,
        imagens: todasImagens,
      });

      setHasUnsavedChanges(false);
      showToast('Produto atualizado com sucesso!', 'success');
      router.push('/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      showToast('Erro ao atualizar produto', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Editar Produto" />
        <div className="pt-16 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar Produto" />
      <div className="pt-16 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Editar Produto
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Informações Básicas
              </h2>

              <Input
                label="Nome do Produto"
                placeholder="Ex: Camiseta Premium"
                error={errors.nome?.message}
                required
                {...register('nome')}
              />

              <Select
                label="Categoria"
                options={categorias.map((cat) => ({
                  value: cat.nome,
                  label: cat.nome,
                }))}
                error={errors.categoria?.message}
                required
                {...register('categoria')}
              />

              <div className="border-t pt-4">
                <Toggle
                  label="Produto em promoção"
                  {...register('emPromocao')}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {emPromocao
                    ? '✅ Ative para criar uma oferta com preço promocional'
                    : '💡 Ative para mostrar preço original riscado e preço promocional em destaque'}
                </p>
              </div>

              {emPromocao ? (
                <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    🏷️ Configurar Promoção
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Preço Original (De:)"
                      type="number"
                      step="0.01"
                      placeholder="149.90"
                      error={errors.precoOriginal?.message}
                      {...register('precoOriginal', { valueAsNumber: true })}
                    />
                    <Input
                      label="Preço Promocional (Por:)"
                      type="number"
                      step="0.01"
                      placeholder="99.90"
                      error={errors.preco?.message}
                      required
                      {...register('preco', { valueAsNumber: true })}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    💰 O cliente verá: <span className="line-through">De: R$ {watch('precoOriginal') || '0,00'}</span> → <span className="font-bold text-green-600">Por: R$ {watch('preco') || '0,00'}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Input
                    label="Preço do Produto"
                    type="number"
                    step="0.01"
                    placeholder="99.90"
                    error={errors.preco?.message}
                    required
                    {...register('preco', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    💵 Este será o preço de venda do produto
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Descrição detalhada do produto..."
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.descricao ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('descricao')}
                />
                {errors.descricao && (
                  <span className="text-sm text-red-500">{errors.descricao.message}</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Imagens Atuais</h2>

              <ImagePreview
                images={imagemUrls}
                onRemove={handleRemoveExistingImage}
              />

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Adicionar Novas Imagens
              </h2>

              <FileUploader
                label="Adicionar Imagens"
                accept="image/*"
                multiple
                onFilesSelected={handleFilesSelected}
              />

              <ImagePreview
                images={novasImagemPreviews}
                onRemove={handleRemoveNewImage}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={saving}>
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/produtos')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
