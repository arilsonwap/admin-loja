'use client';

import { useState, useRef, useCallback } from 'react';
import { IoCloudUpload } from 'react-icons/io5';

interface FileUploaderProps {
  label?: string;
  accept?: `${string}/${string}`;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  error?: string;
  disabled?: boolean;
}

export default function FileUploader({
  label = 'Upload de arquivos',
  accept = 'image/*',
  multiple = false,
  onFilesSelected,
  error,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeExec = (fn: () => void) => {
    if (!disabled) fn();
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      safeExec(() => setIsDragging(true));
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    safeExec(() => setIsDragging(false));
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      safeExec(() => setIsDragging(false));

      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    },
    [disabled, onFilesSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      safeExec(() => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        onFilesSelected(files);
      });
    },
    [disabled, onFilesSelected]
  );

  const handleClick = useCallback(() => {
    safeExec(() => inputRef.current?.click());
  }, [disabled]);

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && handleClick()
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all select-none
          ${disabled
            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
            : isDragging
            ? 'border-blue-500 bg-blue-50 shadow-sm scale-[1.02]'
            : error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:scale-[1.01]'
          }
        `}
      >
        <IoCloudUpload
          className={`mx-auto text-4xl mb-2 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`}
        />

        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {disabled
            ? 'Upload desabilitado'
            : `Arraste e solte ${multiple ? 'os arquivos' : 'o arquivo'} aqui ou clique para selecionar`}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
