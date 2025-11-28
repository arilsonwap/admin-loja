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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagemUrls, setImagemUrls] = useState<string[]>([]);
  const [novasImagemFiles, setNovasImagemFiles] = useState<File[]>([]);
  const [novasImagemPreviews, setNovasImagemPreviews] = useState<string[]>([]);

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

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [produto, categoriasData] = await Promise.all([
        getProduto(id),
        getCategorias(),
      ]);

      if (!produto) {
        alert('Produto não encontrado');
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
      alert('Erro ao carregar produto');
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
        alert('O produto deve ter pelo menos uma imagem');
        setSaving(false);
        return;
      }

      // Atualizar produto
      await updateProduto(id, {
        ...data,
        imagens: todasImagens,
      });

      router.push('/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto');
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Preço"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.preco?.message}
                  required
                  {...register('preco', { valueAsNumber: true })}
                />

                <Input
                  label="Preço Original (opcional)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.precoOriginal?.message}
                  {...register('precoOriginal', { valueAsNumber: true })}
                />
              </div>

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

              <Toggle
                label="Produto em promoção"
                {...register('emPromocao')}
              />
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
