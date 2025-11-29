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
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Produto } from '@/types';

const COLLECTION_NAME = 'produtos';

// Listar todos os produtos
export async function getProdutos(): Promise<Produto[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Produto;
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    throw error;
  }
}

// Obter produto por ID
export async function getProduto(id: string): Promise<Produto | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Produto;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    throw error;
  }
}

// Criar produto
export async function createProduto(produto: Omit<Produto, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...produto,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
}

// Atualizar produto
export async function updateProduto(id: string, produto: Partial<Produto>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, produto);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
}

// Deletar produto
export async function deleteProduto(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
}

// Upload de imagem
export async function uploadImagem(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}

// Deletar imagem
export async function deleteImagem(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    throw error;
  }
}
