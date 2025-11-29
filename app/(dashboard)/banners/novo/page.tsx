'use client';

import { useState } from 'react';
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
import { createBanner, updateBanner, uploadBannerImagem } from '@/lib/banners';
import { useToast } from '@/components/Toast';

const bannerSchema = z.object({
  ordem: z.number().min(0, 'Ordem deve ser um número positivo'),
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
    defaultValues: {
      ordem: 0,
      ativo: true,
    },
  });

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setImagemFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagemFile(null);
    setImagemPreview('');
  };

  const onSubmit = async (data: BannerFormData) => {
    if (!imagemFile) {
      showToast('Selecione uma imagem para o banner', 'warning');
      return;
    }

    setLoading(true);

    try {
      // Criar banner primeiro para obter o ID
      const bannerId = await createBanner({
        imagem: '',
        ordem: data.ordem,
        ativo: data.ativo,
      });

      // Upload da imagem usando o ID do banner
      const imagemUrl = await uploadBannerImagem(imagemFile, bannerId);

      // Atualizar o banner com a URL da imagem (não criar outro!)
      await updateBanner(bannerId, {
        imagem: imagemUrl,
        ordem: data.ordem,
        ativo: data.ativo,
      });

      showToast('Banner criado com sucesso!', 'success');
      router.push('/banners');
    } catch (error) {
      console.error('Erro ao criar banner:', error);
      showToast('Erro ao criar banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Novo Banner" />
      <div className="pt-16 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Adicionar Novo Banner
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Imagem do Banner
              </h2>

              <FileUploader
                label="Selecione a imagem do banner"
                accept="image/*"
                multiple={false}
                onFilesSelected={handleFileSelected}
              />

              {imagemPreview && (
                <ImagePreview
                  images={[imagemPreview]}
                  onRemove={handleRemoveImage}
                />
              )}

              <p className="text-sm text-gray-600">
                Recomendado: Imagem em formato landscape (1920x600px ou similar)
              </p>
            </div>

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
                {...register('ordem', { valueAsNumber: true })}
              />

              <Toggle
                label="Banner ativo"
                {...register('ativo')}
              />

              <p className="text-sm text-gray-600">
                A ordem define a posição de exibição do banner. Banners com
                menor ordem aparecem primeiro.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Salvar Banner
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/banners')}
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
