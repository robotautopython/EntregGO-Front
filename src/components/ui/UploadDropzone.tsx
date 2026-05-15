'use client';

import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';

import { cn } from '@/lib/cn';

interface UploadDropzoneProps {
  label: string;
  hint?: string;
  accept?: string;
  maxSizeMB?: number;
  required?: boolean;
  shape?: 'square' | 'wide' | 'circle';
  onChange?: (file: File | null) => void;
  className?: string;
}

const MIME_DEFAULT = 'image/png, image/jpeg, image/webp';

export function UploadDropzone({
  label,
  hint = 'Use JPG, PNG ou WEBP (até 5 MB)',
  accept = MIME_DEFAULT,
  maxSizeMB = 5,
  required = false,
  shape = 'wide',
  onChange,
  className,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handle = useCallback(
    (file: File | null) => {
      if (preview) URL.revokeObjectURL(preview);

      if (!file) {
        setPreview(null);
        setFileName(null);
        setError(null);
        onChange?.(null);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Arquivo maior que ${maxSizeMB} MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Use uma imagem (JPG, PNG ou WEBP).');
        return;
      }

      setError(null);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFileName(file.name);
      onChange?.(file);
    },
    [maxSizeMB, onChange, preview],
  );

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    handle(file);
  }

  const shapeClass =
    shape === 'circle'
      ? 'aspect-square rounded-full'
      : shape === 'square'
        ? 'aspect-square rounded-lg'
        : 'aspect-[16/9] rounded-lg';

  return (
    <div className={cn('space-y-1.5', className)}>
      <span className="flex items-center gap-1 text-sm font-bold text-asphalt-950">
        {label}
        {required && <span className="text-brand-600">*</span>}
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Selecionar ${label.toLowerCase()}`}
        className={cn(
          'relative flex w-full cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed bg-paper text-asphalt-950/70 transition-all duration-ui ease-ride hover:border-brand-300 hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route-500',
          shapeClass,
          dragging ? 'border-brand-500 bg-brand-50' : 'border-paper-line',
          error && 'border-danger-500/60',
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview, next/image não aplicável */}
            <img
              src={preview}
              alt=""
              className={cn(
                'h-full w-full object-cover',
                shape === 'circle' && 'rounded-full',
              )}
            />
            <button
              type="button"
              aria-label="Remover imagem"
              onClick={(event) => {
                event.stopPropagation();
                handle(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-asphalt-950/85 text-white shadow-ink hover:bg-asphalt-950"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-brand-600 shadow-card">
              {dragging ? (
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
              )}
            </span>
            <p className="text-sm font-bold text-asphalt-950">
              {dragging ? 'Solte aqui' : 'Toque ou arraste a imagem'}
            </p>
            <p className="text-xs text-asphalt-950/60">{hint}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => handle(event.target.files?.[0] ?? null)}
        />
      </div>

      {error ? (
        <p className="text-xs font-semibold text-danger-700">{error}</p>
      ) : fileName ? (
        <p className="truncate text-xs text-asphalt-950/60">{fileName}</p>
      ) : null}
    </div>
  );
}
