'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { createCategoria } from '@/lib/categorias';

const categoriaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  icone: z.string().min(1, 'Selecione um ícone'),
  ordem: z.number().min(0, 'Ordem deve ser um número positivo'),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

const iconesDisponiveis = [
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
];

export default function NovaCategoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      ordem: 0,
    },
  });

  const onSubmit = async (data: CategoriaFormData) => {
    setLoading(true);

    try {
      await createCategoria(data);
      router.push('/categorias');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Nova Categoria" />
      <div className="pt-16 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Adicionar Nova Categoria
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
              <Button type="submit" loading={loading}>
                Salvar Categoria
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
