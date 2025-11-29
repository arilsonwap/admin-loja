'use client';

import { useState, useEffect, useMemo, useCallback, useRef, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
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
import { useToast } from '@/components/Toast';
import { usePrevious } from '@/hooks/usePrevious';

// Configurações de validação de imagens
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_IMAGES = 10;

// Interface para gerenciar estado de imagens
interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

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
  const { showToast } = useToast();
  const baseId = useId(); // IDs únicos para SSR
  const abortControllerRef = useRef<AbortController | null>(null); // Cancelamento de requisições

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      emPromocao: false,
    },
  });

  // Usar useWatch para observar múltiplos campos de forma eficiente
  const [emPromocao, nome, categoria, preco, precoOriginal] = useWatch({
    control,
    name: ['emPromocao', 'nome', 'categoria', 'preco', 'precoOriginal'],
  }) as [boolean, string, string, number, number | undefined];

  // Hook customizado para rastrear valor anterior
  const prevEmPromocao = usePrevious(emPromocao);

  useEffect(() => {
    loadCategorias();
  }, []);

  // Transferir preço para "Preço Original" quando ativar/desativar promoção
  useEffect(() => {
    // Quando ATIVA a promoção: transfere preço atual para preço original
    if (emPromocao && !prevEmPromocao && preco && !precoOriginal) {
      setValue('precoOriginal', preco);
      setValue('preco', 0);
    }

    // Quando DESATIVA a promoção: volta preço original para preço normal
    if (!emPromocao && prevEmPromocao && precoOriginal) {
      setValue('preco', precoOriginal);
      setValue('precoOriginal', undefined);
    }
  }, [emPromocao, prevEmPromocao, preco, precoOriginal, setValue]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (nome || categoria || preco || precoOriginal || images.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nome, categoria, preco, precoOriginal, images.length]);

  // Confirmação de saída
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !loading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, loading]);

  // Cleanup: cancelar requisições pendentes ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      showToast('Não foi possível carregar as categorias. Tente recarregar a página.', 'error');
    }
  };

  // Validação de arquivos com tipagem explícita
  type ValidateFilesResult = { valid: File[]; errors: string[] };
  const validateFiles = useCallback((files: File[]): ValidateFilesResult => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (images.length + files.length > MAX_IMAGES) {
      errors.push(`Você pode adicionar no máximo ${MAX_IMAGES} imagens.`);
      return { valid: validFiles, errors };
    }

    files.forEach((file) => {
      // Validar tipo
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Tipo não permitido. Use JPG, PNG ou WEBP.`);
        return;
      }

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Arquivo muito grande. Máximo 5MB.`);
        return;
      }

      validFiles.push(file);
    });

    return { valid: validFiles, errors };
  }, [images.length]);

  // Handler de seleção de arquivos com tipagem explícita
  type FilesSelectedHandler = (files: File[]) => void;
  const handleFilesSelected = useCallback<FilesSelectedHandler>((files) => {
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      showToast(errors.join('\n'), 'error');
    }

    if (valid.length === 0) return;

    const newImages: ImageFile[] = [];

    valid.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageFile: ImageFile = {
          file,
          preview: reader.result as string,
          id: `${baseId}-${Date.now()}-${index}`, // SSR-safe unique ID
        };
        newImages.push(imageFile);

        if (newImages.length === valid.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [validateFiles, showToast, baseId]);

  // Handler de remoção de imagem com tipagem explícita
  type RemoveImageHandler = (index: number) => void;
  const handleRemoveImage = useCallback<RemoveImageHandler>((index) => {
    setImages((prev) => {
      const newImages = [...prev];
      // Limpar URL do preview para evitar memory leak
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // Geração de descrição com IA usando AbortController para cancelamento
  const handleGenerateDescription = async () => {
    if (!nome || nome.length < 3) {
      showToast('Digite o nome do produto primeiro (mínimo 3 caracteres)', 'warning');
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal, // Adicionar signal para cancelamento
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.description) {
        setAiDescription(data.description);
        setShowAiPreview(true);
      } else {
        throw new Error('Descrição não recebida');
      }
    } catch (error: any) {
      // Ignorar erro se foi cancelamento intencional
      if (error.name === 'AbortError') {
        console.log('Requisição de IA cancelada pelo usuário');
        return;
      }
      console.error('Erro ao gerar descrição:', error);
      showToast('Não foi possível gerar a descrição. Tente novamente.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Callbacks de AI description com tipagem explícita
  type AiDescriptionCallback = () => void;

  const handleAcceptAiDescription = useCallback<AiDescriptionCallback>(() => {
    setValue('descricao', aiDescription);
    setShowAiPreview(false);
    setAiDescription('');
  }, [aiDescription, setValue]);

  const handleRejectAiDescription = useCallback<AiDescriptionCallback>(() => {
    setShowAiPreview(false);
    setAiDescription('');
  }, []);

  const onSubmit = async (data: ProdutoFormData) => {
    if (images.length === 0) {
      showToast('Adicione pelo menos uma imagem do produto.', 'warning');
      return;
    }

    setLoading(true);

    try {
      // Upload de imagens com controle de erros individual
      const imagemUrls: string[] = [];
      const uploadErrors: string[] = [];

      for (let i = 0; i < images.length; i++) {
        try {
          const timestamp = Date.now();
          const sanitizedName = images[i].file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const url = await uploadImagem(
            images[i].file,
            `produtos/${timestamp}_${sanitizedName}`
          );
          imagemUrls.push(url);
        } catch (error) {
          console.error(`Erro ao fazer upload da imagem ${i + 1}:`, error);
          uploadErrors.push(`Imagem ${i + 1}: falha no upload`);
        }
      }

      if (imagemUrls.length === 0) {
        throw new Error('Nenhuma imagem foi enviada com sucesso. Tente novamente.');
      }

      if (uploadErrors.length > 0) {
        showToast(
          `Algumas imagens falharam: ${uploadErrors.join(', ')}. Continuando com ${imagemUrls.length} imagem(ns).`,
          'warning'
        );
      }

      // Criar produto
      await createProduto({
        ...data,
        imagens: imagemUrls,
        createdAt: new Date(),
      });

      setHasUnsavedChanges(false);
      showToast('Produto criado com sucesso!', 'success');
      router.push('/produtos');
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      const errorMsg =
        error.message || 'Erro ao criar produto. Verifique sua conexão e tente novamente.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Memoizar previews de imagens
  const imagePreviews = useMemo(() => images.map((img) => img.preview), [images]);

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
                    💰 O cliente verá: <span className="line-through">De: R$ {precoOriginal || '0,00'}</span> → <span className="font-bold text-green-600">Por: R$ {preco || '0,00'}</span>
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Imagens</h2>
                <span className="text-xs text-gray-500">
                  {images.length}/{MAX_IMAGES} imagens
                </span>
              </div>

              <FileUploader
                label="Adicionar Imagens"
                accept="image/*"
                multiple
                onFilesSelected={handleFilesSelected}
              />

              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                <p className="font-medium mb-1">📋 Requisitos de imagem:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Formatos: JPG, PNG ou WEBP</li>
                  <li>Tamanho máximo: 5MB por imagem</li>
                  <li>Limite: {MAX_IMAGES} imagens por produto</li>
                </ul>
              </div>

              <ImagePreview
                images={imagePreviews}
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