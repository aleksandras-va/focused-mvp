'use client';

import { ImagePlusIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  ACCEPTED_IMAGE_TYPES,
  compressToWebP,
  isHeicFile,
  MAX_PHOTOS,
  PHOTO_SIZES,
  toDecodableImage,
} from '@/lib/photos';
import type { PhotoUpload } from '@/services/photo/photo.types';

type UploadingPhoto = {
  localId: number;
  previewUrl: string | null;
  storageKey: string | null;
  status: 'uploading' | 'done' | 'error';
};

type PhotoUploaderProps = {
  uploadAction: () => Promise<PhotoUpload | { error: string }>;
  onChange: (storageKeys: string[]) => void;
  onCoverChange: (url: string | null) => void;
  initialPhotos: { storageKey: string; url: string }[];
};

export function PhotoUploader({
  uploadAction,
  onChange,
  onCoverChange,
  initialPhotos,
}: PhotoUploaderProps) {
  const t = useTranslations('sell.photoUploader');
  const [photos, setPhotos] = useState<UploadingPhoto[]>(() =>
    initialPhotos.map((photo, index) => ({
      localId: index,
      previewUrl: photo.url,
      storageKey: photo.storageKey,
      status: 'done' as const,
    })),
  );
  const nextLocalId = useRef(photos.length);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(
      photos
        .filter((photo) => photo.status === 'done' && photo.storageKey)
        .map((photo) => photo.storageKey as string),
    );
    onCoverChange(photos.find((photo) => photo.status !== 'error')?.previewUrl ?? null);
  }, [photos, onChange, onCoverChange]);

  function patchPhoto(localId: number, patch: Partial<UploadingPhoto>) {
    setPhotos((current) =>
      current.map((photo) => (photo.localId === localId ? { ...photo, ...patch } : photo)),
    );
  }

  async function uploadPhoto(file: File, localId: number, hasPreview: boolean) {
    try {
      const image = await toDecodableImage(file);

      if (!hasPreview) patchPhoto(localId, { previewUrl: URL.createObjectURL(image) });

      const [large, card] = await Promise.all([
        compressToWebP(image, PHOTO_SIZES.large),
        compressToWebP(image, PHOTO_SIZES.card),
      ]);

      const upload = await uploadAction();
      if ('error' in upload) throw new Error(upload.error);

      const puts = await Promise.all([
        fetch(upload.uploadUrls.large, { method: 'PUT', body: large }),
        fetch(upload.uploadUrls.card, { method: 'PUT', body: card }),
      ]);
      if (puts.some((response) => !response.ok)) throw new Error('Upload failed.');

      patchPhoto(localId, { status: 'done', storageKey: upload.storageKey });
    } catch {
      patchPhoto(localId, { status: 'error' });
    }
  }

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setMessage(null);

    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      if (ACCEPTED_IMAGE_TYPES.includes(file.type) || isHeicFile(file)) accepted.push(file);
    }

    if (accepted.length < files.length) {
      setMessage(t('unsupported'));
    }
    if (photos.length + accepted.length > MAX_PHOTOS) {
      setMessage(t('tooMany', { max: MAX_PHOTOS }));
      return;
    }

    for (const file of accepted) {
      const localId = nextLocalId.current++;
      const previewUrl = isHeicFile(file) ? null : URL.createObjectURL(file);
      setPhotos((current) => [
        ...current,
        {
          localId,
          previewUrl,
          storageKey: null,
          status: 'uploading',
        },
      ]);
      uploadPhoto(file, localId, previewUrl !== null);
    }
  }

  function removePhoto(localId: number) {
    const removed = photos.find((photo) => photo.localId === localId);

    if (removed?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(removed.previewUrl);

    setPhotos((current) => current.filter((photo) => photo.localId !== localId));
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed border-input bg-muted/40 p-6 text-sm text-foreground/75 transition-colors hover:bg-muted"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-background shadow-sm">
          <ImagePlusIcon className="size-5 text-primary" />
        </span>
        {t('drop', { max: MAX_PHOTOS })}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {message ? <p className="text-sm text-destructive">{message}</p> : null}

      {photos.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
          {photos.map((photo, index) => (
            <div key={photo.localId} className="group relative aspect-4/3">
              {photo.previewUrl ? (
                // biome-ignore lint/performance/noImgElement: previews are local object URLs
                <img
                  src={photo.previewUrl}
                  alt=""
                  className={`size-full rounded-xl border object-cover ${photo.status === 'uploading' ? 'opacity-50' : ''} ${photo.status === 'error' ? 'opacity-30' : ''}`}
                />
              ) : (
                <div className="size-full rounded-xl border bg-muted" />
              )}
              {photo.status === 'uploading' ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner aria-hidden className="size-6 text-foreground/70" />
                </span>
              ) : null}
              {index === 0 && photo.status === 'done' ? (
                <Badge className="absolute top-2 left-2 bg-white/90 text-foreground">
                  {t('cover')}
                </Badge>
              ) : null}
              {photo.status === 'error' ? (
                <span className="absolute inset-x-1 bottom-1 rounded bg-destructive px-1 text-center text-xs text-white">
                  {t('failed')}
                </span>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label={t('remove')}
                className="absolute top-1.5 right-1.5 shadow-sm"
                onClick={() => removePhoto(photo.localId)}
              >
                <XIcon />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
