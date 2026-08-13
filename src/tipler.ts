// Uygulama genelinde paylaşılan tip tanımları ve alan listeleri.
// db.ts ve server.ts bu dosyayı içe aktararak aynı alan listesini kullanır;
// böylece iki dosyada birbirinden bağımsız, çakışma riski taşıyan kopyalar oluşmaz.

export type Marka = 'Kuba' | 'RKS';

/** Veritabanındaki `motorlar` tablosunun tam satır şekli. */
export interface Motor {
  id: number;
  marka: Marka;
  model: string;
  fiyat: number;
  motor_hacmi: string | null;
  motor_tipi: string | null;
  vites: string | null;
  guc: string | null;
  tork: string | null;
  yakit_tipi: string | null;
  sogutma: string | null;
  fren: string | null;
  lastik: string | null;
  uzunluk: string | null;
  genislik: string | null;
  yukseklik: string | null;
  dingil_mesafesi: string | null;
  agirlik: string | null;
  azami_yuk: string | null;
  yakit_deposu: string | null;
  max_hiz: string | null;
  renkler: string | null;
  aciklama: string | null;
  resim: string | null;
  stok: number;
  created_at: string;
}

/** Teknik özellik alanları — yalnızca bunlar admin panelinden güncellenir/görüntülenir. */
export const SPEC_ALANLAR = [
  'motor_hacmi', 'motor_tipi', 'vites', 'guc', 'tork', 'yakit_tipi', 'sogutma',
  'fren', 'lastik', 'uzunluk', 'genislik', 'yukseklik', 'dingil_mesafesi',
  'agirlik', 'azami_yuk', 'yakit_deposu', 'renkler', 'aciklama',
] as const;
export type SpecAlan = (typeof SPEC_ALANLAR)[number];

/** İlk kayıt (INSERT) sırasında yazılan tüm alanlar: marka/model/fiyat + teknik özellikler. */
export const ALANLAR = ['marka', 'model', 'fiyat', ...SPEC_ALANLAR] as const;
export type Alan = (typeof ALANLAR)[number];

/** db.ts içindeki seed verisinin şekli: id/resim/stok/created_at hariç tüm alanlar dolu olmalı. */
export type MotorTohumu = Pick<Motor, Alan>;
