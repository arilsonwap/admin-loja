'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import FileUploader from '@/components/FileUploader';
import ImagePreview from '@/components/ImagePreview';
import { getBanner, updateBanner, uploadBannerImagem } from '@/lib/banners';

const bannerSchema = z.object({
  ordem: z.number().min(0, 'Ordem deve ser um número positivo'),
  ativo: z.boolean(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export default function EditarBannerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagemAtual, setImagemAtual] = useState<string>('');
  const [novaImagemFile, setNovaImagemFile] = useState<File | null>(null);
  const [novaImagemPreview, setNovaImagemPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
  });

  useEffect(() => {
    loadBanner();
  }, [id]);

  const loadBanner = async () => {
    try {
      const banner = await getBanner(id);

      if (!banner) {
        alert('Banner não encontrado');
        router.push('/banners');
        return;
      }

      setImagemAtual(banner.imagem);
      setValue('ordem', banner.ordem);
      setValue('ativo', banner.ativo);
    } catch (error) {
      console.error('Erro ao carregar banner:', error);
      alert('Erro ao carregar banner');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setNovaImagemFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setNovaImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNewImage = () => {
    setNovaImagemFile(null);
    setNovaImagemPreview('');
  };

  const onSubmit = async (data: BannerFormData) => {
    setSaving(true);

    try {
      let imagemUrl = imagemAtual;

      // Se houver nova imagem, fazer upload
      if (novaImagemFile) {
        imagemUrl = await uploadBannerImagem(novaImagemFile, id);
      }

      // Atualizar banner
      await updateBanner(id, {
        imagem: imagemUrl,
        ordem: data.ordem,
        ativo: data.ativo,
      });

      router.push('/banners');
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      alert('Erro ao atualizar banner');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Editar Banner" />
        <div className="pt-16 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar Banner" />
      <div className="pt-16 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Editar Banner
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Imagem Atual
              </h2>

              {imagemAtual && (
                <div className="relative w-full h-48">
                  <img
                    src={imagemAtual}
                    alt="Banner atual"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Alterar Imagem
              </h2>

              <FileUploader
                label="Selecione uma nova imagem (opcional)"
                accept="image/*"
                multiple={false}
                onFilesSelected={handleFileSelected}
              />

              {novaImagemPreview && (
                <ImagePreview
                  images={[novaImagemPreview]}
                  onRemove={handleRemoveNewImage}
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
              <Button type="submit" loading={saving}>
                Salvar Alterações
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
