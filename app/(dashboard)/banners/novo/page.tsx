'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Header from '@/components/Header';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import FileUploader from '@/components/FileUploader';
import ImagePreview from '@/components/ImagePreview';

import {
  createBanner,
  updateBanner,
  uploadBannerImagem,
  deleteBanner,
} from '@/lib/banners';

import { useToast } from '@/components/Toast';

// Schema com validações mais completas
const bannerSchema = z.object({
  ordem: z
    .number({ invalid_type_error: 'Digite um número válido' })
    .int('A ordem deve ser um número inteiro')
    .min(0, 'Ordem mínima é 0')
    .max(999, 'Valor máximo é 999'),
  ativo: z.boolean(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export default function NovoBannerPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { ordem: 0, ativo: true },
  });

  const handleFileSelected = useCallback((files: File[]) => {
    if (!files.length) return;

    const file = files[0];
    setImagemFile(file);

    // Preview instantâneo
    const url = URL.createObjectURL(file);
    setImagemPreview(url);
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);

    setImagemFile(null);
    setImagemPreview('');
  }, [imagemPreview]);

  const onSubmit = useCallback(
    async (data: BannerFormData) => {
      if (!imagemFile) {
        showToast('Selecione uma imagem para o banner', 'warning');
        return;
      }

      setLoading(true);

      let bannerId = '';

      try {
        // 1. Cria um documento temporário para gerar ID
        bannerId = await createBanner({
          imagem: '',
          ordem: data.ordem,
          ativo: data.ativo,
        });

        // 2. Upload da imagem
        const imagemUrl = await uploadBannerImagem(imagemFile, bannerId);

        // 3. Atualiza o documento com a imagem
        await updateBanner(bannerId, {
          imagem: imagemUrl,
          ordem: data.ordem,
          ativo: data.ativo,
        });

        showToast('Banner criado com sucesso!', 'success');
        router.push('/banners');
      } catch (error) {
        console.error('Erro ao criar banner:', error);

        // rollback → remove banner criado antes do erro
        if (bannerId) {
          await deleteBanner(bannerId);
        }

        showToast('Erro ao criar banner', 'error');
      } finally {
        setLoading(false);
      }
    },
    [imagemFile, imagemPreview, showToast, router]
  );

  return (
    <>
      <Header title="Novo Banner" />

      <div className="pt-16 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Adicionar Novo Banner
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section: Upload */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Imagem do Banner
              </h2>

              <FileUploader
                label="Selecione a imagem do banner"
                accept="image/*"
                multiple={false}
                onFilesSelected={handleFileSelected}
                disabled={loading}
              />

              {imagemPreview && (
                <ImagePreview
                  images={[imagemPreview]}
                  onRemove={handleRemoveImage}
                />
              )}

              <p className="text-sm text-gray-600">
                Recomendado: 1920x600px (formato landscape)
              </p>
            </div>

            {/* Section: Configs */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Configurações
              </h2>

              <Input
                label="Ordem de Exibição"
                type="number"
                placeholder="0"
                error={errors.ordem?.message}
                required
                disabled={loading}
                {...register('ordem', { valueAsNumber: true })}
              />

              <Toggle
                label="Banner ativo"
                disabled={loading}
                {...register('ativo')}
              />

              <p className="text-sm text-gray-600">
                Banners com menor ordem aparecem primeiro.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Salvar Banner
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
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
