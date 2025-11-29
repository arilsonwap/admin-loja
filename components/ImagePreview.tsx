'use client';

import Image from 'next/image';
import { IoClose } from 'react-icons/io5';

interface ImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
}

export default function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group aspect-square">
          <Image
            src={image}
            alt={`Preview ${index + 1}`}
            fill
            className="object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IoClose size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
