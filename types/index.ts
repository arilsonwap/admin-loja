export interface Produto {
  id?: string;
  nome: string;
  preco: number;
  precoOriginal?: number;
  categoria: string;
  descricao: string;
  imagens: string[];
  emPromocao: boolean;
  createdAt: Date;
}

export interface Categoria {
  id?: string;
  nome: string;
  icone: string;
  ordem: number;
}

export interface Banner {
  id?: string;
  imagem: string;
  ativo: boolean;
  ordem: number;
}

export interface Usuario {
  id: string;
  email: string;
  nome?: string;
}
