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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Banner } from '@/types';

const COLLECTION_NAME = 'banners';

// Listar todos os banners
export async function getBanners(): Promise<Banner[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('ordem', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Banner));
  } catch (error) {
    console.error('Erro ao listar banners:', error);
    throw error;
  }
}

// Obter banner por ID
export async function getBanner(id: string): Promise<Banner | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Banner;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter banner:', error);
    throw error;
  }
}

// Criar banner
export async function createBanner(banner: Omit<Banner, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), banner);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    throw error;
  }
}

// Atualizar banner
export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, banner);
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    throw error;
  }
}

// Deletar banner
export async function deleteBanner(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar banner:', error);
    throw error;
  }
}

// Upload de imagem de banner
export async function uploadBannerImagem(file: File, bannerId: string): Promise<string> {
  try {
    const storageRef = ref(storage, `banners/${bannerId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem do banner:', error);
    throw error;
  }
}

// Deletar imagem de banner
export async function deleteBannerImagem(bannerId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `banners/${bannerId}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem do banner:', error);
    throw error;
  }
}
