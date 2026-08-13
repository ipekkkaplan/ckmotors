/import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import session from 'express-session';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import db from './db';
import { ALANLAR, type Motor } from './tipler';

declare module 'express-session' {
  interface SessionData {
    admin?: boolean;
  }
}

const URETIM_ORTAMI = process.env.NODE_ENV === 'production';

if (URETIM_ORTAMI) {
  const eksikler = ['ADMIN_SIFRE', 'SESSION_SECRET'].filter(k => !process.env[k]);
  if (eksikler.length) {
    console.error(`HATA: Üretim ortamında şu ortam değişkenleri zorunludur: ${eksikler.join(', ')}.`);
    process.exit(1);
  }
}

const ADMIN_SIFRE = process.env.ADMIN_SIFRE || 'bayi2026';
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const publicDizini = path.join(__dirname, '..', 'public');

if (URETIM_ORTAMI) app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.static(publicDizini));
app.use(session({
  name: 'ckmotors.sid',
  secret: process.env.SESSION_SECRET || 'kuba-rks-gizli-anahtar',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000,
    secure: URETIM_ORTAMI,
    sameSite: 'lax',
  },
}));

// Cloudinary Yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: 'ckmotors-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const apiSiniri = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { hata: 'Çok fazla istek gönderildi, lütfen biraz sonra tekrar deneyin.' },
});
app.use('/api', apiSiniri);

const girisSiniri = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { hata: 'Çok fazla başarısız giriş denemesi. 15 dakika sonra tekrar deneyin.' },
});

function sifreDogruMu(girilen: string, gercek: string): boolean {
  const a = Buffer.from(girilen);
  const b = Buffer.from(gercek);
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function disaAcikMotor(motor: Motor, girisliMi: boolean): Omit<Motor, 'fiyat'> | Motor {
  if (girisliMi) return motor;
  const { fiyat: _fiyat, ...geriKalan } = motor;
  return geriKalan;
}

// ---- Herkese Açık API ----

app.get('/api/motorlar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const marka = typeof req.query.marka === 'string' ? req.query.marka : undefined;
    const result = marka && ['Kuba', 'RKS'].includes(marka)
      ? await db.execute({ sql: 'SELECT * FROM motorlar WHERE marka = ? ORDER BY created_at DESC', args: [marka] })
      : await db.execute('SELECT * FROM motorlar ORDER BY created_at DESC');

    const rows = result.rows as unknown as Motor[];
    const girisliMi = !!req.session?.admin;
    res.json(rows.map(m => disaAcikMotor(m, girisliMi)));
  } catch (err) {
    next(err);
  }
});

app.get('/api/motorlar/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM motorlar WHERE id = ?', args: [req.params.id] });
    const motor = result.rows[0] as unknown as Motor | undefined;
    if (!motor) return res.status(404).json({ hata: 'Motor bulunamadı' });
    res.json(disaAcikMotor(motor, !!req.session?.admin));
  } catch (err) {
    next(err);
  }
});

// ---- Admin API ----

function adminGerekli(req: Request, res: Response, next: NextFunction) {
  if (req.session?.admin) return next();
  res.status(401).json({ hata: 'Giriş gerekli' });
}

app.post('/api/admin/giris', girisSiniri, (req: Request, res: Response) => {
  const girilenSifre = typeof req.body?.sifre === 'string' ? req.body.sifre : '';
  if (sifreDogruMu(girilenSifre, ADMIN_SIFRE)) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ hata: 'Şifre yanlış' });
});

app.post('/api/admin/cikis', (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/durum', (req: Request, res: Response) => {
  res.json({ girisli: !!req.session?.admin });
});

// Motor ekle
app.post('/api/admin/motorlar', adminGerekli, upload.single('resim'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = req.body as Record<string, string | undefined>;
    if (!b.marka || !b.model) {
      return res.status(400).json({ hata: 'Marka ve model zorunlu' });
    }
    const resim = req.file ? req.file.path : null; // Cloudinary URL
    const degerler = ALANLAR.map(a => (a === 'fiyat' ? (b.fiyat ? parseFloat(b.fiyat) : 0) : (b[a] || null)));
    
    const result = await db.execute({
      sql: `INSERT INTO motorlar (${ALANLAR.join(', ')}, resim, stok) VALUES (${ALANLAR.map(() => '?').join(', ')}, ?, ?)`,
      args: [...(degerler as (string | number | null)[]), resim, b.stok === '0' ? 0 : 1]
    });

    res.json({ ok: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    next(err);
  }
});

// Motor güncelle
app.put('/api/admin/motorlar/:id', adminGerekli, upload.single('resim'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultEski = await db.execute({ sql: 'SELECT * FROM motorlar WHERE id = ?', args: [req.params.id] });
    const eski = resultEski.rows[0] as unknown as Motor | undefined;
    if (!eski) return res.status(404).json({ hata: 'Motor bulunamadı' });

    const b = req.body as Record<string, string | undefined>;
    let resim = eski.resim;
    if (req.file) {
      resim = req.file.path; // Cloudinary URL
    }

    const eskiKayit = eski as unknown as Record<string, unknown>;
    const degerler = ALANLAR.map(a => (a === 'fiyat' ? (b.fiyat ? parseFloat(b.fiyat) : eski.fiyat) : (b[a] ?? eskiKayit[a])));
    
    await db.execute({
      sql: `UPDATE motorlar SET ${ALANLAR.map(a => `${a} = ?`).join(', ')}, resim = ?, stok = ? WHERE id = ?`,
      args: [...(degerler as (string | number | null)[]), resim, b.stok !== undefined ? (b.stok === '0' ? 0 : 1) : eski.stok, req.params.id]
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Motor sil
app.delete('/api/admin/motorlar/:id', adminGerekli, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM motorlar WHERE id = ?', args: [req.params.id] });
    const motor = result.rows[0] as unknown as Motor | undefined;
    if (!motor) return res.status(404).json({ hata: 'Motor bulunamadı' });

    await db.execute({ sql: 'DELETE FROM motorlar WHERE id = ?', args: [req.params.id] });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ hata: 'Bulunamadı' });
});

app.get('/', (_req: Request, res: Response) => res.sendFile(path.join(publicDizini, 'index.html')));
app.get('/motor/:id', (_req: Request, res: Response) => res.sendFile(path.join(publicDizini, 'motor.html')));
app.get('/admin', (_req: Request, res: Response) => res.sendFile(path.join(publicDizini, 'admin.html')));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Beklenmeyen hata:', err);
  res.status(500).json({ hata: 'Sunucu hatası' });
});

if (!URETIM_ORTAMI) {
  app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  });
}

export default app;