import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Categoria } from '@/types';

const COLLECTION_NAME = 'categorias';

// Listar todas as categorias
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('ordem', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Categoria));
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    throw error;
  }
}

// Obter categoria por ID
export async function getCategoria(id: string): Promise<Categoria | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Categoria;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    throw error;
  }
}

// Criar categoria
export async function createCategoria(categoria: Omit<Categoria, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), categoria);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
}

// Atualizar categoria
export async function updateCategoria(id: string, categoria: Partial<Categoria>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, categoria);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
}

// Deletar categoria
export async function deleteCategoria(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
}
