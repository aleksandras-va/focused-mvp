'use client';

import { ImagePlusIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ACCEPTED_IMAGE_TYPES, compressToWebP, MAX_PHOTOS, PHOTO_SIZES } from '@/lib/photos';
import type { PhotoUpload } from '@/services/photo/photo.types';

type UploadingPhoto = {
  localId: number;
  previewUrl: string;
  storageKey: string | null;
  status: 'uploading' | 'done' | 'error';
};

type PhotoUploaderProps = {
  uploadAction: () => Promise<PhotoUpload | { error: string }>;
  onChange: (storageKeys: string[]) => void;
  initialPhotos: { storageKey: string; url: string }[];
};

export function PhotoUploader({ uploadAction, onChange, initialPhotos }: PhotoUploaderProps) {
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
  }, [photos, onChange]);

  function patchPhoto(localId: number, patch: Partial<UploadingPhoto>) {
    setPhotos((current) =>
      current.map((photo) => (photo.localId === localId ? { ...photo, ...patch } : photo)),
    );
  }

  async function uploadPhoto(file: File, localId: number) {
    try {
      const [large, card] = await Promise.all([
        compressToWebP(file, PHOTO_SIZES.large),
        compressToWebP(file, PHOTO_SIZES.card),
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
      const extension = file.name.toLowerCase().split('.').pop() ?? '';
      const looksHeic = ['heic', 'heif'].includes(extension);
      if (ACCEPTED_IMAGE_TYPES.includes(file.type) || looksHeic) accepted.push(file);
    }

    if (accepted.length < files.length) {
      setMessage('Only JPEG, PNG, WebP and HEIC photos are supported — RAW files are not.');
    }
    if (photos.length + accepted.length > MAX_PHOTOS) {
      setMessage(`You can add up to ${MAX_PHOTOS} photos — pick your best ones.`);
      return;
    }

    for (const file of accepted) {
      const localId = nextLocalId.current++;
      setPhotos((current) => [
        ...current,
        {
          localId,
          previewUrl: URL.createObjectURL(file),
          storageKey: null,
          status: 'uploading',
        },
      ]);
      uploadPhoto(file, localId);
    }
  }

  function removePhoto(localId: number) {
    const removed = photos.find((photo) => photo.localId === localId);

    if (removed?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(removed.previewUrl);

    setPhotos((current) => current.filter((photo) => photo.localId !== localId));
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground transition-colors hover:bg-muted"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-background shadow-sm">
          <ImagePlusIcon className="size-5" />
        </span>
        Drag photos here or click to choose (up to {MAX_PHOTOS})
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
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.localId} className="group relative aspect-square">
              {/* biome-ignore lint/performance/noImgElement: previews are local object URLs */}
              <img
                src={photo.previewUrl}
                alt=""
                className={`size-full rounded-xl border object-cover ${photo.status === 'uploading' ? 'opacity-50' : ''} ${photo.status === 'error' ? 'opacity-30' : ''}`}
              />
              {index === 0 && photo.status === 'done' ? (
                <Badge className="absolute bottom-1 left-1">Cover</Badge>
              ) : null}
              {photo.status === 'error' ? (
                <span className="absolute inset-x-1 bottom-1 rounded bg-destructive px-1 text-center text-xs text-white">
                  Failed
                </span>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Remove photo"
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
