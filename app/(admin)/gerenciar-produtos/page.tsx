'use client';

import StatsCard from '@/components/StatsCard';
import ProductList from '@/components/ProductList';

// Dados de exemplo (mesmos do Dashboard)
const mockProducts = [
  { id: 1, name: 'Notebook Dell', price: 3500.00, category: 'Eletrônicos', stock: 15, isNew: true },
  { id: 2, name: 'Mouse Logitech', price: 89.90, category: 'Periféricos', stock: 50, isPromo: true },
  { id: 3, name: 'Teclado Mecânico', price: 299.00, category: 'Periféricos', stock: 30 },
  { id: 4, name: 'Monitor LG 27"', price: 1200.00, category: 'Eletrônicos', stock: 8, isNew: true },
  { id: 5, name: 'Webcam HD', price: 250.00, category: 'Periféricos', stock: 20, isPromo: true },
  { id: 6, name: 'Headset Gamer', price: 350.00, category: 'Periféricos', stock: 25 },
  { id: 7, name: 'SSD 500GB', price: 450.00, category: 'Armazenamento', stock: 40, isNew: true },
  { id: 8, name: 'Mousepad RGB', price: 120.00, category: 'Acessórios', stock: 60, isPromo: true },
];

const promoProducts = mockProducts.filter(p => p.isPromo);
const newProducts = mockProducts.filter(p => p.isNew);

export default function GerenciarProdutos() {
  const handleEdit = (id: number) => {
    console.log('Editar produto:', id);
  };

  const handleDelete = (id: number) => {
    console.log('Excluir produto:', id);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Gerenciar Produtos</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Adicionar Produto
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatsCard
          title="Produtos em Promoção"
          count={promoProducts.length}
          icon="🔥"
          color="orange"
        />
        <StatsCard
          title="Produtos Novos"
          count={newProducts.length}
          icon="✨"
          color="green"
        />
      </div>

      {/* Lista de todos os produtos */}
      <ProductList
        products={mockProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
