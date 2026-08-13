import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { ALANLAR, SPEC_ALANLAR, type MotorTohumu } from './tipler';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Turso İstemcisi
export const db = createClient({
  url: url || 'file:bayi.db',
  authToken: authToken,
});

export async function initDb() {
  // 1. Tabloyu oluştur
  await db.execute(`
    CREATE TABLE IF NOT EXISTS motorlar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marka TEXT NOT NULL,
      model TEXT NOT NULL,
      fiyat REAL NOT NULL,
      motor_hacmi TEXT,
      motor_tipi TEXT,
      vites TEXT,
      guc TEXT,
      tork TEXT,
      yakit_tipi TEXT,
      sogutma TEXT,
      fren TEXT,
      lastik TEXT,
      uzunluk TEXT,
      genislik TEXT,
      yukseklik TEXT,
      dingil_mesafesi TEXT,
      agirlik TEXT,
      azami_yuk TEXT,
      yakit_deposu TEXT,
      max_hiz TEXT,
      renkler TEXT,
      aciklama TEXT,
      resim TEXT,
      stok INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 2. Eksik kolon kontrolü ve güncelleme
  const tableInfo = await db.execute('PRAGMA table_info(motorlar)');
  const mevcutKolonlar = tableInfo.rows.map(k => k.name as string);
  const yeniKolonlar: Record<string, string> = {
    vites: 'TEXT', tork: 'TEXT', yakit_tipi: 'TEXT', sogutma: 'TEXT', lastik: 'TEXT',
    uzunluk: 'TEXT', genislik: 'TEXT', yukseklik: 'TEXT', dingil_mesafesi: 'TEXT', azami_yuk: 'TEXT',
  };

  for (const [kolon, tip] of Object.entries(yeniKolonlar)) {
    if (!mevcutKolonlar.includes(kolon)) {
      await db.execute(`ALTER TABLE motorlar ADD COLUMN ${kolon} ${tip}`);
    }
  }

  // 3. Örnek modelleri temizle
  await db.execute({
    sql: `DELETE FROM motorlar WHERE model IN (?, ?)`,
    args: ['Örnek Model 1', 'Örnek Model 2']
  });

  // 4. 17 Modeli Turso Veritabanına Tohumla (Seed)
  const motorlar: MotorTohumu[] = [
    {
      marka: 'Kuba', model: 'Bluebird 50', fiyat: 0,
      motor_hacmi: '50 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'CVT (Otomatik)',
      guc: '3.21 HP @ 7500 rpm', tork: '3.30 Nm @ 5500 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '3.50-10″ / 3.50-10″',
      uzunluk: '1760 mm', genislik: '680 mm', yukseklik: '1095 mm', dingil_mesafesi: '1300 mm',
      agirlik: '96 kg', azami_yuk: '246 kg', yakit_deposu: '5.5 L',
      renkler: 'Siyah, Gri, Mavi', aciklama: 'Şehir içi kullanım için ekonomik ve pratik 50cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'RKS', model: 'Bolero 50', fiyat: 0,
      motor_hacmi: '49.6 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Otomatik',
      guc: '2.68 HP @ 6750 rpm', tork: '3.00 Nm @ 6000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '3.50-10″ / 3.50-10″',
      uzunluk: '1765 mm', genislik: '680 mm', yukseklik: '1070 mm', dingil_mesafesi: '1230 mm',
      agirlik: '80 kg', azami_yuk: '230 kg', yakit_deposu: '5 L',
      renkler: 'Kırmızı, Gri, Sarı', aciklama: 'Yüksek tork, düşük yakıt tüketimi sunan pratik 50cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Brilliant 125', fiyat: 0,
      motor_hacmi: '125 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'CVT',
      guc: '8.05 HP @ 7500 rpm', tork: '8.20 Nm @ 6000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '120-70-12″',
      uzunluk: '1895 mm', genislik: '670 mm', yukseklik: '1180 mm', dingil_mesafesi: '1360 mm',
      agirlik: '101 kg', azami_yuk: '251 kg', yakit_deposu: '5 L',
      renkler: 'Beyaz, Gri, Yeşil', aciklama: 'LED aydınlatma, modern tasarımlı 125cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Arome 125', fiyat: 93480,
      motor_hacmi: '125 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Otomatik CVT',
      guc: '8.85 HP @ 7500 rpm', tork: '9.50 Nm @ 5500 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / CBS', lastik: '100/80-14″ / 120/70-14″',
      uzunluk: '2003 mm', genislik: '710 mm', yukseklik: '1244 mm', dingil_mesafesi: '1344 mm',
      agirlik: '123 kg', azami_yuk: '273 kg', yakit_deposu: '8 L',
      renkler: 'Kar Beyazı, Nardo Gri', aciklama: 'Geniş sele ve bagaj alanına sahip konforlu 125cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Bewely 125', fiyat: 0,
      motor_hacmi: '125 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Otomatik CVT',
      guc: '9.25 HP @ 7000 rpm', tork: '9.50 Nm @ 6000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '90/90-12″ / 3.50-10″',
      uzunluk: '1880 mm', genislik: '650 mm', yukseklik: '1145 mm', dingil_mesafesi: '1300 mm',
      agirlik: '97 kg', azami_yuk: '247 kg', yakit_deposu: '6.5 L',
      renkler: 'Beyaz, Kırmızı, Gri', aciklama: 'Kompakt yapılı, çift kişilik sele ve bagaj alanına sahip 125cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Terra 125', fiyat: 95940,
      motor_hacmi: '125 cc', motor_tipi: '4 Zamanlı, Tek Silindir, EFI', vites: '5 Vites',
      guc: '9.52 HP @ 7500 rpm', tork: '9.80 Nm @ 6500 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana (CBS)', lastik: '2.75-18″ / 90/90-18″',
      uzunluk: '2030 mm', genislik: '750 mm', yukseklik: '1070 mm', dingil_mesafesi: '1365 mm',
      agirlik: '110 kg', azami_yuk: '250 kg', yakit_deposu: '14 L',
      renkler: 'Kırmızı, Mavi, Yeşil', aciklama: 'Agresif tasarımlı, uzun menzilli farlara sahip 125cc motosiklet. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'RKS', model: '125R', fiyat: 0,
      motor_hacmi: '125 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: '5 Vites',
      guc: '9.52 HP @ 8500 rpm', tork: '8.00 Nm @ 7000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana (CBS)', lastik: '2.75-18″ / 90/90-18″',
      uzunluk: '2040 mm', genislik: '730 mm', yukseklik: '1330 mm', dingil_mesafesi: '1330 mm',
      agirlik: '128 kg', azami_yuk: '240 kg', yakit_deposu: '16 L',
      renkler: 'Siyah, Kırmızı, Mavi', aciklama: 'Ayarlanabilir süspansiyonlu, full dijital gösterge panelli 125cc motosiklet. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Cita 50', fiyat: 65023,
      motor_hacmi: '50 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: '5 Vites',
      guc: '3.75 HP @ 9500 rpm', tork: '3.20 Nm @ 8000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '2.25-17″',
      uzunluk: '1960 mm', genislik: '750 mm', yukseklik: '1130 mm', dingil_mesafesi: '1250 mm',
      agirlik: '110 kg', azami_yuk: '260 kg', yakit_deposu: '8.5 L',
      renkler: 'Beyaz, Gri, Kırmızı, Siyah', aciklama: 'Klasik tasarımlı, jant ve tel detaylarıyla dikkat çeken 50cc motosiklet. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'CG50', fiyat: 65987,
      motor_hacmi: '50 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: '5 Vites',
      guc: '3.75 HP @ 9500 rpm', tork: '3.20 Nm @ 8000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '2.50-18″ / 2.75-18″',
      uzunluk: '1960 mm', genislik: '750 mm', yukseklik: '1130 mm', dingil_mesafesi: '1250 mm',
      agirlik: '110 kg', azami_yuk: '260 kg', yakit_deposu: '9 L',
      renkler: 'Siyah, Kırmızı, Mavi', aciklama: 'Klasik görünümlü, konforlu 50cc motosiklet. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'RKS', model: 'DES125', fiyat: 97908,
      motor_hacmi: '124.6 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Otomatik CVT',
      guc: '9.25 HP @ 7500 rpm', tork: '10.00 Nm @ 5500 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Disk (CBS)', lastik: '90/90-12″ / 100/80-12″',
      uzunluk: '2060 mm', genislik: '755 mm', yukseklik: '1105 mm', dingil_mesafesi: '1370 mm',
      agirlik: '124 kg', azami_yuk: '250 kg', yakit_deposu: '7 L',
      renkler: 'Beyaz, Kırmızı, Mavi', aciklama: 'LCD gösterge panelli, şehir içi ve şehir dışı kullanıma uygun 125cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Sniper 50', fiyat: 66951,
      motor_hacmi: '49 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Yarı Otomatik',
      guc: '2.95 HP @ 8000 rpm', tork: '2.60 Nm @ 5000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '2.50-17″',
      uzunluk: '1890 mm', genislik: '675 mm', yukseklik: '1090 mm', dingil_mesafesi: '1230 mm',
      agirlik: '95 kg', azami_yuk: '245 kg', yakit_deposu: '3 L',
      renkler: 'Siyah, Sarı, Turuncu, Yeşil', aciklama: 'Ayarlanabilir ön/arka süspansiyonlu, sade tasarımlı cub model. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Ege 50', fiyat: 53436,
      motor_hacmi: '49 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: '4 Vites',
      guc: '2.69 HP @ 5300 rpm', tork: '3.80 Nm @ 5000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Kampana / Kampana', lastik: '2.50-17″ / 2.75-17″',
      uzunluk: '1920 mm', genislik: '700 mm', yukseklik: '1050 mm', dingil_mesafesi: '1235 mm',
      agirlik: '92 kg', azami_yuk: '242 kg', yakit_deposu: '4 L',
      renkler: 'Beyaz, Turuncu, Yeşil', aciklama: 'Klasik gösterge panelli, ekonomik cub model. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'RKS', model: 'Rodos 50', fiyat: 73554,
      motor_hacmi: '50 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: '4 Vites',
      guc: '6.70 HP @ 7500 rpm', tork: '7.60 Nm @ 4500 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk (220mm) / Kampana', lastik: '70/90-17″ / 80/90-17″',
      uzunluk: '1995 mm', genislik: '740 mm', yukseklik: '1130 mm', dingil_mesafesi: '1270 mm',
      agirlik: '104 kg', azami_yuk: '249 kg', yakit_deposu: '4 L',
      renkler: 'Kırmızı, Mavi, Yeşil', aciklama: 'Tam dijital gösterge panelli, konforlu cub model. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'GS 125 FI', fiyat: 0,
      motor_hacmi: '124 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Otomatik CVT',
      guc: '9.11 HP @ 7500 rpm', tork: '9.80 Nm @ 6000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana', lastik: '90/90-12″ / 3.50-10″',
      uzunluk: '1850 mm', genislik: '675 mm', yukseklik: '1100 mm', dingil_mesafesi: '1350 mm',
      agirlik: '101 kg', azami_yuk: '251 kg', yakit_deposu: '6.5 L',
      renkler: 'Beyaz, Gri', aciklama: 'B sınıfı ehliyetle kullanılabilen, kurye ve şehir içi kullanım için tasarlanmış 125cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'XF 110 FI', fiyat: 0,
      motor_hacmi: '109 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'Otomatik CVT',
      guc: '8.04 HP @ 7500 rpm', tork: '8.50 Nm @ 6000 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana (CBS)', lastik: '90/90-12″ / 3.50-10″',
      uzunluk: '1900 mm', genislik: '680 mm', yukseklik: '1100 mm', dingil_mesafesi: '1300 mm',
      agirlik: '100 kg', azami_yuk: '240 kg', yakit_deposu: '6.75 L',
      renkler: 'Beyaz, Gri', aciklama: 'Kompakt yapılı, geniş sele altı bagajlı 110cc şehir içi scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'Rocca 100 FL', fiyat: 0,
      motor_hacmi: '99 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: 'CVT',
      guc: '6.17 HP @ 7000 rpm', tork: '6.80 Nm @ 5500 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana (CBS)', lastik: '90/90-12″ / 3.50-10″',
      uzunluk: '1950 mm', genislik: '660 mm', yukseklik: '1230 mm', dingil_mesafesi: '1230 mm',
      agirlik: '100 kg', azami_yuk: '250 kg', yakit_deposu: '6 L',
      renkler: 'Beyaz, Kırmızı, Gri', aciklama: 'Yeni nesil LED aydınlatmalı, klasik gösterge panelli ekonomik 100cc scooter. Resim admin panelinden eklenecek.',
    },
    {
      marka: 'Kuba', model: 'TK03', fiyat: 76568,
      motor_hacmi: '50 cc', motor_tipi: '4 Zamanlı, Tek Silindir', vites: '5 Vites',
      guc: '2.69 HP @ 5300 rpm', tork: '3.80 Nm @ 4800 rpm', yakit_tipi: 'Benzin', sogutma: 'Hava Soğutmalı',
      fren: 'Disk / Kampana (CBS)', lastik: '2.75-18″ / 90/90-18″',
      uzunluk: '2040 mm', genislik: '730 mm', yukseklik: '1110 mm', dingil_mesafesi: '1310 mm',
      agirlik: '110 kg', azami_yuk: '250 kg', yakit_deposu: '16 L',
      renkler: 'Kırmızı, Gri, Yeşil', aciklama: 'B sınıfı ehliyetle kullanılabilen, klasik touring tasarımlı 50cc motosiklet. Resim admin panelinden eklenecek.',
    },
  ];

  for (const m of motorlar) {
    const varMi = await db.execute({
      sql: 'SELECT id FROM motorlar WHERE marka = ? AND model = ?',
      args: [m.marka, m.model]
    });

    if (varMi.rows.length === 0) {
      const degerler = ALANLAR.map(a => (m as Record<string, unknown>)[a] ?? null);
      const placeholders = ALANLAR.map(() => '?').join(', ');
      await db.execute({
        sql: `INSERT INTO motorlar (${ALANLAR.join(', ')}, resim, stok) VALUES (${placeholders}, ?, ?)`,
        args: [...(degerler as (string | number | null)[]), null, 1]
      });
    } else {
      const specDegerler = SPEC_ALANLAR.map(a => (m as Record<string, unknown>)[a] ?? null);
      const setClause = SPEC_ALANLAR.map(a => `${a} = ?`).join(', ');
      await db.execute({
        sql: `UPDATE motorlar SET ${setClause} WHERE marka = ? AND model = ?`,
        args: [...(specDegerler as (string | number | null)[]), m.marka, m.model]
      });
    }
  }

  console.log('Turso veritabanı başarıyla bağlandı ve 17 motor modeli güncellendi.');
}

initDb().catch(console.error);

export default db;