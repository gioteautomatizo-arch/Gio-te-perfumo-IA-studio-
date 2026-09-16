import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Perfume } from '../types';
import { PERFUMES_DATABASE } from '../data/perfumes';

export type CatalogRecordKind = 'override' | 'custom';

export interface CatalogBusinessFields {
  priceMXN?: number;
  promoActive?: boolean;
  promoPriceMXN?: number | null;
  promoLabel?: string;
  stockStatus?: Perfume['stockStatus'];
  stockQuantity?: number;
  bottleVolumeML?: number;
  availableML?: number;
  decant5mlEnabled?: boolean;
  decant5mlPriceMXN?: number | null;
  reservationDepositMXN?: number | null;
  image?: string;
}

export interface CatalogRecord extends CatalogBusinessFields {
  id: string;
  kind: CatalogRecordKind;
  perfume?: Perfume;
}

export interface EffectivePerfume extends Perfume {
  promoActive?: boolean;
  promoPriceMXN?: number | null;
  promoLabel?: string;
  effectivePriceMXN?: number;
  catalogSource?: 'static' | 'custom';
}

const perfumesCollection = collection(db, 'perfumes');

const finiteNonNegative = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;

const positiveOrNull = (value: unknown): number | null | undefined => {
  if (value === null) return null;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
};

const normalizeBusinessFields = (value: CatalogBusinessFields): CatalogBusinessFields => {
  const normalized: CatalogBusinessFields = {};

  if (typeof value.priceMXN === 'number' && Number.isFinite(value.priceMXN)) {
    normalized.priceMXN = value.priceMXN;
  }
  if (typeof value.promoActive === 'boolean') normalized.promoActive = value.promoActive;

  const promoPrice = positiveOrNull(value.promoPriceMXN);
  if (promoPrice !== undefined) normalized.promoPriceMXN = promoPrice;

  if (typeof value.promoLabel === 'string') normalized.promoLabel = value.promoLabel.trim();
  if (value.stockStatus) normalized.stockStatus = value.stockStatus;

  const stockQuantity = finiteNonNegative(value.stockQuantity);
  if (stockQuantity !== undefined) normalized.stockQuantity = stockQuantity;

  const bottleVolumeML = finiteNonNegative(value.bottleVolumeML);
  if (bottleVolumeML !== undefined) normalized.bottleVolumeML = bottleVolumeML;

  const availableML = finiteNonNegative(value.availableML);
  if (availableML !== undefined) normalized.availableML = availableML;

  if (typeof value.decant5mlEnabled === 'boolean') normalized.decant5mlEnabled = value.decant5mlEnabled;

  const decantPrice = positiveOrNull(value.decant5mlPriceMXN);
  if (decantPrice !== undefined) normalized.decant5mlPriceMXN = decantPrice;

  const deposit = positiveOrNull(value.reservationDepositMXN);
  if (deposit !== undefined) normalized.reservationDepositMXN = deposit;

  if (typeof value.image === 'string' && value.image.trim()) normalized.image = value.image;

  return normalized;
};

/**
 * Firestore rejects any payload that contains `undefined`.
 * Only recurse through plain objects/arrays so Firebase sentinel values such as
 * serverTimestamp() remain intact.
 */
function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined)
      .map(item => removeUndefined(item)) as T;
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const clean: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (nestedValue === undefined) continue;
      clean[key] = removeUndefined(nestedValue);
    }
    return clean as T;
  }

  return value;
}

export function mergeCatalogRecords(records: CatalogRecord[]): EffectivePerfume[] {
  const byId = new Map(records.map(record => [record.id, record]));

  const staticPerfumes = PERFUMES_DATABASE.map(base => {
    const record = byId.get(base.id);
    const fields = normalizeBusinessFields(record || {});
    const merged: EffectivePerfume = {
      ...base,
      ...(typeof fields.priceMXN === 'number' ? { priceMXN: fields.priceMXN } : {}),
      ...(fields.stockStatus ? { stockStatus: fields.stockStatus } : {}),
      ...(typeof fields.stockQuantity === 'number' ? { stockQuantity: fields.stockQuantity } : {}),
      ...(typeof fields.bottleVolumeML === 'number' ? { bottleVolumeML: fields.bottleVolumeML } : {}),
      ...(typeof fields.availableML === 'number' ? { availableML: fields.availableML } : {}),
      ...(typeof fields.decant5mlEnabled === 'boolean' ? { decant5mlEnabled: fields.decant5mlEnabled } : {}),
      ...(fields.decant5mlPriceMXN !== undefined ? { decant5mlPriceMXN: fields.decant5mlPriceMXN } : {}),
      ...(fields.reservationDepositMXN !== undefined ? { reservationDepositMXN: fields.reservationDepositMXN } : {}),
      ...(fields.image ? { image: fields.image } : {}),
      promoActive: typeof fields.promoActive === 'boolean' ? fields.promoActive : Boolean(base.promoActive),
      promoPriceMXN: fields.promoPriceMXN !== undefined ? fields.promoPriceMXN : base.promoPriceMXN,
      promoLabel: fields.promoLabel !== undefined ? fields.promoLabel : base.promoLabel,
      catalogSource: 'static',
    };

    merged.effectivePriceMXN =
      merged.promoActive && typeof merged.promoPriceMXN === 'number'
        ? merged.promoPriceMXN
        : merged.priceMXN;

    return merged;
  });

  const customPerfumes = records
    .filter(record => record.kind === 'custom' && record.perfume)
    .map(record => {
      const base = record.perfume as Perfume;
      const fields = normalizeBusinessFields(record);
      const merged: EffectivePerfume = {
        ...base,
        ...(typeof fields.priceMXN === 'number' ? { priceMXN: fields.priceMXN } : {}),
        ...(fields.stockStatus ? { stockStatus: fields.stockStatus } : {}),
        ...(typeof fields.stockQuantity === 'number' ? { stockQuantity: fields.stockQuantity } : {}),
        ...(typeof fields.bottleVolumeML === 'number' ? { bottleVolumeML: fields.bottleVolumeML } : {}),
        ...(typeof fields.availableML === 'number' ? { availableML: fields.availableML } : {}),
        ...(typeof fields.decant5mlEnabled === 'boolean' ? { decant5mlEnabled: fields.decant5mlEnabled } : {}),
        ...(fields.decant5mlPriceMXN !== undefined ? { decant5mlPriceMXN: fields.decant5mlPriceMXN } : {}),
        ...(fields.reservationDepositMXN !== undefined ? { reservationDepositMXN: fields.reservationDepositMXN } : {}),
        ...(fields.image ? { image: fields.image } : {}),
        promoActive: typeof fields.promoActive === 'boolean' ? fields.promoActive : Boolean(base.promoActive),
        promoPriceMXN: fields.promoPriceMXN !== undefined ? fields.promoPriceMXN : base.promoPriceMXN,
        promoLabel: fields.promoLabel !== undefined ? fields.promoLabel : base.promoLabel,
        catalogSource: 'custom',
      };
      merged.effectivePriceMXN =
        merged.promoActive && typeof merged.promoPriceMXN === 'number'
          ? merged.promoPriceMXN
          : merged.priceMXN;
      return merged;
    });

  return [...staticPerfumes, ...customPerfumes];
}

export function subscribeCatalog(
  onData: (perfumes: EffectivePerfume[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    perfumesCollection,
    snapshot => {
      const records = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<CatalogRecord, 'id'>),
      }));
      onData(mergeCatalogRecords(records));
    },
    error => {
      console.error('Catalog subscription error:', error);
      onError?.(error);
      // Never break the public catalog if Firestore is temporarily unavailable.
      onData(mergeCatalogRecords([]));
    }
  );
}

export async function saveBusinessFields(
  perfumeId: string,
  fields: CatalogBusinessFields
) {
  const clean = normalizeBusinessFields(fields);
  const payload = removeUndefined({
    id: perfumeId,
    kind: 'override' as const,
    ...clean,
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'perfumes', perfumeId), payload, { merge: true });
}

export async function saveCustomPerfume(
  perfume: Perfume,
  fields: CatalogBusinessFields = {}
) {
  const clean = normalizeBusinessFields(fields);
  const payload = removeUndefined({
    id: perfume.id,
    kind: 'custom' as const,
    perfume,
    priceMXN: perfume.priceMXN,
    stockStatus: perfume.stockStatus,
    image: perfume.image,
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'perfumes', perfume.id), payload, { merge: true });
}

export async function removeCustomPerfume(perfumeId: string) {
  await deleteDoc(doc(db, 'perfumes', perfumeId));
}

export function getStaticPerfume(perfumeId: string) {
  return PERFUMES_DATABASE.find(perfume => perfume.id === perfumeId);
}
