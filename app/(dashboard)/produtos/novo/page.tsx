'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { createProduto, uploadImagem } from '@/lib/produtos';
import { getCategorias } from '@/lib/categorias';
import { Categoria } from '@/types';
import { IoSparkles, IoCheckmark, IoClose } from 'react-icons/io5';

const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  precoOriginal: z.number().optional(),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  emPromocao: z.boolean(),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagemFiles, setImagemFiles] = useState<File[]>([]);
  const [imagemPreviews, setImagemPreviews] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [showAiPreview, setShowAiPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      emPromocao: false,
    },
  });

  const emPromocao = watch('emPromocao');
  const nome = watch('nome');
  const categoria = watch('categoria');
  const preco = watch('preco');

  useEffect(() => {
    loadCategorias();
  }, []);

  // Quando ativar promoção, transferir preço atual para preço original
  useEffect(() => {
    if (emPromocao && preco && !watch('precoOriginal')) {
      setValue('precoOriginal', preco);
      setValue('preco', 0);
    }
  }, [emPromocao]);

  const loadCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleGenerateDescription = async () => {
    if (!nome || nome.length < 3) {
      alert('Digite o nome do produto primeiro');
      return;
    }

    setAiLoading(true);
    setShowAiPreview(false);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          categoria: categoria || 'produto',
        }),
      });

      const data = await response.json();

      if (data.description) {
        setAiDescription(data.description);
        setShowAiPreview(true);
      } else {
        alert('Erro ao gerar descrição');
      }
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      alert('Erro ao gerar descrição com IA');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAiDescription = () => {
    setValue('descricao', aiDescription);
    setShowAiPreview(false);
    setAiDescription('');
  };

  const handleRejectAiDescription = () => {
    setShowAiPreview(false);
    setAiDescription('');
  };

  const handleFilesSelected = (files: File[]) => {
    setImagemFiles((prev) => [...prev, ...files]);

    // Criar previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagemFiles((prev) => prev.filter((_, i) => i !== index));
    setImagemPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProdutoFormData) => {
    if (imagemFiles.length === 0) {
      alert('Adicione pelo menos uma imagem');
      return;
    }

    setLoading(true);

    try {
      // Upload de imagens
      const imagemUrls: string[] = [];
      for (const file of imagemFiles) {
        const timestamp = Date.now();
        const url = await uploadImagem(file, `produtos/${timestamp}_${file.name}`);
        imagemUrls.push(url);
      }

      // Criar produto
      await createProduto({
        ...data,
        imagens: imagemUrls,
        createdAt: new Date(),
      });

      router.push('/produtos');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Novo Produto" />
      <div className="pt-16 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Adicionar Novo Produto
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Descrição <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || !nome}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <IoSparkles className={aiLoading ? 'animate-spin' : ''} />
                    {aiLoading ? 'Gerando...' : 'Gerar com IA'}
                  </button>
                </div>

                {showAiPreview && aiDescription && (
                  <div className="mb-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                        <IoSparkles /> Sugestão da IA
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAcceptAiDescription}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Usar esta descrição"
                        >
                          <IoCheckmark size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={handleRejectAiDescription}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Descartar"
                        >
                          <IoClose size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{aiDescription}</p>
                  </div>
                )}

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
                <p className="text-xs text-gray-500 mt-1">
                  💡 Dica: Preencha o nome e categoria, depois clique em "Gerar com IA" para criar uma descrição automática
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Imagens</h2>

              <FileUploader
                label="Adicionar Imagens"
                accept="image/*"
                multiple
                onFilesSelected={handleFilesSelected}
              />

              <ImagePreview
                images={imagemPreviews}
                onRemove={handleRemoveImage}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Salvar Produto
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
