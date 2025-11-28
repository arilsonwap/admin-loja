'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { getCategoria, updateCategoria } from '@/lib/categorias';

const categoriaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  icone: z.string().min(1, 'Selecione um ícone'),
  ordem: z.number().min(0, 'Ordem deve ser um número positivo'),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

const iconesDisponiveis = [
  { value: 'IoHardwareChip', label: 'Eletrônico (IoHardwareChip)' },
  { value: 'IoShirt', label: 'Camiseta (IoShirt)' },
  { value: 'IoWatch', label: 'Relógio (IoWatch)' },
  { value: 'IoPhonePortrait', label: 'Celular (IoPhonePortrait)' },
  { value: 'IoLaptop', label: 'Laptop (IoLaptop)' },
  { value: 'IoHeadset', label: 'Fone (IoHeadset)' },
  { value: 'IoGameController', label: 'Game (IoGameController)' },
  { value: 'IoBasketball', label: 'Esportes (IoBasketball)' },
  { value: 'IoBook', label: 'Livros (IoBook)' },
  { value: 'IoHome', label: 'Casa (IoHome)' },
  { value: 'IoBag', label: 'Bolsa (IoBag)' },
  { value: 'IoGlasses', label: 'Óculos (IoGlasses)' },
  { value: 'IoFootball', label: 'Futebol (IoFootball)' },
  { value: 'IoGift', label: 'Brinquedo (IoGift)' },
  { value: 'IoRestaurant', label: 'Cozinha (IoRestaurant)' },
];

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
  });

  useEffect(() => {
    loadCategoria();
  }, [id]);

  const loadCategoria = async () => {
    try {
      const categoria = await getCategoria(id);

      if (!categoria) {
        alert('Categoria não encontrada');
        router.push('/categorias');
        return;
      }

      setValue('nome', categoria.nome);
      setValue('icone', categoria.icone);
      setValue('ordem', categoria.ordem);
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      alert('Erro ao carregar categoria');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoriaFormData) => {
    setSaving(true);

    try {
      await updateCategoria(id, data);
      router.push('/categorias');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Editar Categoria" />
        <div className="pt-16 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar Categoria" />
      <div className="pt-16 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Editar Categoria
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <Input
                label="Nome da Categoria"
                placeholder="Ex: Eletrônicos"
                error={errors.nome?.message}
                required
                {...register('nome')}
              />

              <Select
                label="Ícone"
                options={iconesDisponiveis}
                error={errors.icone?.message}
                required
                {...register('icone')}
              />

              <Input
                label="Ordem de Exibição"
                type="number"
                placeholder="0"
                error={errors.ordem?.message}
                required
                {...register('ordem', { valueAsNumber: true })}
              />

              <p className="text-sm text-gray-600">
                A ordem define a posição de exibição da categoria. Categorias
                com menor ordem aparecem primeiro.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={saving}>
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/categorias')}
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
