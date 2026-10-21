import { useTranslations } from 'next-intl';
import type { CatalogModelWithOffers } from '@/services/model-catalog/model-catalog.types';

export function ModelSpecs({ model }: { model: CatalogModelWithOffers }) {
  const t = useTranslations('modelPage');
  const tEnums = useTranslations('enums');
  const { camera, lens, mount } = model;
  const specs = [
    camera ? { label: t('specs.bodyType'), value: tEnums(`bodyType.${camera.bodyType}`) } : null,
    camera?.sensorFormat
      ? { label: t('specs.sensorFormat'), value: tEnums(`sensorFormat.${camera.sensorFormat}`) }
      : null,
    camera?.megapixels
      ? {
          label: t('specs.megapixels'),
          value: t('specs.megapixelsValue', { value: camera.megapixels }),
        }
      : null,
    lens
      ? {
          label: t('specs.focalLength'),
          value: t('specs.focalLengthValue', {
            min: lens.focalMinMm,
            max: lens.focalMaxMm,
            isZoom: lens.isZoom ? 'yes' : 'no',
          }),
        }
      : null,
    lens
      ? {
          label: t('specs.maxAperture'),
          value: t('specs.maxApertureValue', { value: lens.maxAperture }),
        }
      : null,
    mount ? { label: t('specs.mount'), value: mount.name } : null,
    lens?.hasStabilization
      ? { label: t('specs.stabilization'), value: t('specs.stabilizationValue') }
      : null,
    lens?.filterThreadMm
      ? {
          label: t('specs.filterThread'),
          value: t('specs.filterThreadValue', { value: lens.filterThreadMm }),
        }
      : null,
    model.releaseYear ? { label: t('specs.releaseYear'), value: String(model.releaseYear) } : null,
  ].filter((spec) => spec !== null);

  if (specs.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">{t('specsTitle')}</h2>
      <dl className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex flex-col gap-0.5 rounded-xl bg-muted/70 px-3.5 py-3"
          >
            <dt className="text-xs text-muted-foreground">{spec.label}</dt>
            <dd className="font-semibold">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
