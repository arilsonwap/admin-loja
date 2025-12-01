'use client';

import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface Props {
  title: string;
  count?: number;
  buttonLabel?: string;
  buttonIcon?: IconType;
  onButtonClick?: () => void;
}

export default function PageHeader({
  title,
  count,
  buttonLabel,
  buttonIcon: Icon,
  onButtonClick,
}: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {count !== undefined && (
          <p className="text-gray-600">
            {count} {count === 1 ? 'categoria' : 'categorias'}
          </p>
        )}
      </div>

      {onButtonClick && (
        <button
          onClick={onButtonClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          {Icon && <Icon size={20} />}
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

