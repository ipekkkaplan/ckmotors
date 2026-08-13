# Kuba & RKS Motor Bayisi — Web Sitesi

Node.js + Express + SQLite + **TypeScript** ile hazırlanmış motor bayisi sitesi.

## Proje yapısı

- `src/` — TypeScript kaynak kodu. **Değişiklik yapmanız gerektiğinde buradaki
  dosyaları düzenleyin** (`server.ts`, `db.ts`, `tipler.ts`).
- `dist/` — Derlenmiş JavaScript çıktısı. Otomatik oluşturulur, elle
  düzenlemeyin; her `npm start` öncesi yeniden üretilir.
- `public/` — Statik dosyalar (HTML, CSS, yüklenen resimler).
- `bayi.db` — SQLite veritabanı, ilk çalıştırmada otomatik oluşur.

## Kurulum

1. [Node.js](https://nodejs.org) kurulu olmalı (LTS sürüm, 22.5+).
2. Bu klasörde terminal açıp çalıştırın:

```
npm install
npm start
```

`npm start`, arka planda önce TypeScript kodunu derler (`prestart` adımı
`tsc` çalıştırır) sonra `dist/server.js`'i başlatır — ayrı bir derleme
komutu çalıştırmanıza gerek yok.

3. Tarayıcıda açın: **http://localhost:3000**

Geliştirme sırasında kodu kaydettikçe otomatik yeniden derlemesini isterseniz
ayrı bir terminalde `npm run dev` çalıştırabilirsiniz (yalnızca derler, sunucuyu
yeniden başlatmaz — değişiklik sonrası sunucuyu Ctrl+C ile durdurup `npm start`
ile yeniden başlatmanız gerekir).

## Sayfalar

- `/` — Vitrin: motor kartları, Kuba/RKS filtresi (fiyat gösterilmiyor)
- `/motor/1` — Motor detay sayfası (özellik tablosu, fiyat gösterilmiyor)
- `/admin` — Yönetim paneli (motor ekle/düzenle/sil, resim yükle)

## Admin şifresi

Varsayılan: `bayi2026`. Değiştirmek için `src/server.ts` içindeki `bayi2026`
değerini değiştirin veya `ADMIN_SIFRE=yenisifre npm start` ile başlatın.

## Şu anda sitede olan 17 model

Verdiğiniz isimlere göre eklendi (marka ataması ve teknik özellikler üretici
sitelerinden (kubamotor.com.tr, rksmotor.com.tr) teyit edildi):

- Kuba: Bluebird 50, Brilliant 125, Arome 125, Bewely 125, Terra 125, Cita 50,
  CG50, Sniper 50, Ege 50, GS 125 FI, XF 110 FI, Rocca 100 FL, TK03
- RKS: Bolero 50, 125R, DES125, Rodos 50

Motor hacmi, güç, tork, fren, ağırlık, yakıt deposu gibi teknik bilgiler
dolduruldu. **Fiyatlar sitede gösterilmiyor** (isteğiniz üzerine kaldırıldı) —
admin panelindeki fiyat alanı sadece sizin dahili takibiniz içindir, isterseniz
boş bırakabilirsiniz. Resimler henüz yok; `/admin` panelinden yükleyebilirsiniz.

## Resim ve detay ekleme/düzenleme

`/admin` sayfasından giriş yapıp "Düzenle" ile mevcut bir motora resim ekleyin
veya bilgilerini güncelleyin. Resim (jpg/png/webp, maks 5MB) yükleyin. Veriler
`bayi.db` dosyasında (SQLite), resimler `public/uploads/` klasöründe saklanır.

## Notlar

- Yayına almadan önce admin şifresini ve `src/server.ts` içindeki
  `SESSION_SECRET` değerini mutlaka değiştirin.
- Proje artık TypeScript ile yazılıyor: tip hataları `npm start` sırasında
  derleme aşamasında (kod çalışmadan önce) yakalanır, bu da hatalı veri
  şekillerinin (örn. eksik alan, yanlış tip) production'a sızmasını önler.

---

## Canlıya Alma — ckmotors.com.tr

Bu bölüm, siteyi `localhost:3000` yerine `https://www.ckmotors.com.tr`
adresinden sıfırdan yayına almanız için adım adım bir rehberdir. Sıfırdan
başlıyorsanız (ne domain ne hosting var) sırasıyla izleyin.

### 1. Alan adını satın alın

`.com.tr` uzantılı domainler, `.com`'dan farklı olarak yalnızca T.C. kimlik
numarası veya vergi numarası ile satın alınabilir (bireysel ya da şirket adına
tescil edilir). Bir kayıt şirketinden (örn. Natro, Turhost, İsimtescil,
GoDaddy TR) `ckmotors.com.tr` adresini arayıp uygunsa satın alın. Ödeme ve
hesap oluşturma adımlarını kendiniz tamamlamanız gerekir — bu adımı sizin
yerinize yapamam.

### 2. VPS satın alın

Node.js/TypeScript uygulaması çalıştıracağınız için Node desteği net olan bir
VPS (sanal özel sunucu) seçin. Küçük bir bayi sitesi için en ucuz/orta
paketler yeterlidir:

- **Hetzner Cloud** (CX22, ~€4-5/ay) — en uygun fiyat/performans, İngilizce arayüz
- **DigitalOcean** (Basic Droplet, ~$6/ay) — kolay arayüz, çok kaynak/rehber var
- **Turhost / Natro VPS** — TL faturalama, Türkçe destek isteyenler için

İşletim sistemi olarak **Ubuntu 22.04 LTS** seçin. Sunucu oluşturduktan sonra
size bir IP adresi (örn. `123.45.67.89`) ve SSH ile bağlanma bilgisi verilir.

### 3. Sunucuya bağlanıp gerekli yazılımları kurun

Terminalden (Windows'ta PowerShell veya PuTTY ile) sunucuya bağlanın:

```
ssh root@SUNUCU_IP_ADRESI
```

Ardından sırasıyla çalıştırın:

```bash
# Sistem güncellemesi
apt update && apt upgrade -y

# Node.js 22 kurulumu
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# pm2 (süreç yöneticisi) ve nginx (ters proxy)
npm install -g pm2
apt install -y nginx

# Node sürümünü doğrulayın (22.5+ olmalı)
node --version
```

### 4. Projeyi sunucuya taşıyın

Kendi bilgisayarınızdaki proje klasörünü sunucuya kopyalayın (Windows'ta
PowerShell'den, proje klasörünüzün olduğu yerde çalıştırın — `scp` yerine
FileZilla/WinSCP gibi bir SFTP programı da kullanabilirsiniz):

```
scp -r kuba-rks-bayi root@SUNUCU_IP_ADRESI:/var/www/ckmotors
```

`node_modules`, `dist` ve `bayi.db` dosyalarını kopyalamanıza gerek yok —
sunucuda sıfırdan kurulacak. Sunucuda:

```bash
cd /var/www/ckmotors
npm install
npm run build
```

### 5. Ortam değişkenlerini ayarlayıp pm2 ile başlatın

Gerçek şifre/anahtar değerlerini asla `ecosystem.config.example.js` şablonuna
yazmayın (bu dosya ileride bir git deposuna gidebilir) — bunun yerine
sunucuda kendi özel kopyanızı oluşturun:

```bash
cp ecosystem.config.example.js ecosystem.config.js
nano ecosystem.config.js
```

İçindeki `ADMIN_SIFRE` ile `SESSION_SECRET` yer tutucularını gerçek, güçlü
değerlerle değiştirin. Rastgele bir `SESSION_SECRET` üretmek için:

```bash
openssl rand -hex 32
```

**Bu iki değeri ayarlamadan sunucu üretim modunda hiç açılmaz** — kasıtlı
olarak böyle tasarlandı, bkz. aşağıdaki "Güvenlik" bölümü.

Sonra uygulamayı pm2 ile başlatın:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # sunucu yeniden başladığında otomatik açılması için (çıkan komutu çalıştırın)
```

`pm2 logs ckmotors` ile canlı logları, `pm2 restart ckmotors` ile yeniden
başlatmayı, `pm2 status` ile çalışma durumunu görebilirsiniz.

### 6. Nginx ters proxy kurun

Proje içindeki `deploy/nginx-ckmotors.conf` dosyasını kullanın:

```bash
cp /var/www/ckmotors/deploy/nginx-ckmotors.conf /etc/nginx/sites-available/ckmotors
ln -s /etc/nginx/sites-available/ckmotors /etc/nginx/sites-enabled/
nginx -t          # yapılandırma hatasız mı kontrol eder
systemctl reload nginx
```

### 7. DNS ayarları

Domain'i satın aldığınız firmanın yönetim panelinde (DNS ayarları bölümü),
şu iki **A kaydını** ekleyin — ikisi de sunucunuzun IP adresini göstermeli:

| Tür | Ad (Host) | Değer |
|-----|-----------|-------|
| A   | `@`       | SUNUCU_IP_ADRESI |
| A   | `www`     | SUNUCU_IP_ADRESI |

DNS değişikliklerinin dünya genelinde yayılması genelde birkaç dakika ile
birkaç saat sürebilir. `ckmotors.com.tr` tarayıcıda sunucunuzu göstermeye
başladığında bir sonraki adıma geçin.

### 8. SSL sertifikası (HTTPS) kurun

DNS yayıldıktan sonra, ücretsiz Let's Encrypt sertifikası için:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d ckmotors.com.tr -d www.ckmotors.com.tr
```

Certbot, nginx yapılandırmanızı otomatik güncelleyip HTTP→HTTPS
yönlendirmesini de ekler. Sertifika 90 günde bir otomatik yenilenir
(certbot bunu kendi kurar, ek işlem gerekmez).

Artık site **https://www.ckmotors.com.tr** adresinden yayında.

### 9. Yedekleme

`bayi.db` (tüm motor verileri) ve `public/uploads/` (yüklenen resimler)
sunucunuzda kalıcıdır ama düzenli yedeklemeniz önerilir:

```bash
# Örnek: haftalık yedek betiği
tar -czf /root/yedekler/ckmotors-$(date +%F).tar.gz \
  /var/www/ckmotors/bayi.db /var/www/ckmotors/public/uploads
```

Bunu `crontab -e` ile haftalık otomatik çalışacak şekilde zamanlayabilirsiniz.

### Güncelleme yaparken (kod değişikliği sonrası)

```bash
cd /var/www/ckmotors
# değişen dosyaları scp ile tekrar kopyalayın, sonra:
npm run build
pm2 restart ckmotors
```

---

## Güvenlik

Yayına almadan önce yapılan denetimde bulunan zafiyetler ve düzeltmeleri:

### Bulunup düzeltilenler

1. **Açıkta kalan varsayılan şifre/anahtar** — Kod içinde `ADMIN_SIFRE`
   (`bayi2026`) ve `SESSION_SECRET` için varsayılan değerler vardı. Bu kodu
   gören/erişen herkes, siz gerçek değerleri ayarlamayı unutursanız canlı
   siteye admin olarak girebilirdi. **Düzeltme:** Sunucu artık
   `NODE_ENV=production` iken bu iki değişken tanımlı değilse hiç
   başlamıyor, hata verip duruyor (test edildi — bkz. aşağıda).
2. **Herkese açık API'de gizli fiyat bilgisi sızıyordu** — Sitede fiyat
   gösterilmiyor olsa da `/api/motorlar` uç noktası veritabanındaki `fiyat`
   alanını ham haliyle döndürüyordu; tarayıcı geliştirici araçlarından veya
   doğrudan `curl` ile bu bilgiye erişilebiliyordu. **Düzeltme:** `fiyat`
   alanı artık yalnızca admin oturumu açıkken API yanıtına dahil ediliyor
   (test edildi).
3. **Admin girişine karşı kaba kuvvet (brute-force) koruması yoktu** —
   Sınırsız sayıda şifre denenebiliyordu. **Düzeltme:** Hem uygulama
   seviyesinde (15 dakikada 10 deneme) hem de nginx seviyesinde
   (saniyede 1 istek) hız sınırı eklendi (test edildi — 11. deneme 429
   döndü).
4. **Şifre karşılaştırması zamanlamaya karşı korumasızdı** — `===` ile
   karşılaştırma, teorik olarak yanıt süresinden şifre tahmini yapılmasına
   izin verir. **Düzeltme:** `crypto.timingSafeEqual` ile sabit zamanlı
   karşılaştırmaya geçildi.
5. **Güvenlik başlıkları eksikti** — `X-Frame-Options`,
   `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` gibi
   temel korumalar yoktu; sunucu ayrıca `X-Powered-By: Express` ile
   teknoloji yığınını ifşa ediyordu. **Düzeltme:** `helmet` paketi eklendi
   (test edildi).
6. **Resim yükleme filtresi yalnızca dosya uzantısına bakıyordu** —
   `.jpg` uzantılı ama aslında görsel olmayan bir dosya yüklenebilirdi.
   **Düzeltme:** Uzantıya ek olarak tarayıcının bildirdiği içerik tipi
   (MIME) de kontrol ediliyor; ayrıca yüklenen dosya adlarına tahmin
   edilmesi güç rastgele bir ek getirildi (test edildi).
7. **Genel istek/DDoS koruması yoktu** — Hem uygulama seviyesinde
   (dakikada IP başına 120 istek) hem nginx seviyesinde (saniyede 15
   istek, patlama payı 30) hız sınırlaması eklendi. Bu, Node sürecine
   ulaşmadan önce nginx'te istekleri eleyerek ek bir savunma katmanı
   sağlar.
8. **Gizli anahtarların yanlışlıkla paylaşılması riski** — `ecosystem.config.js`
   (pm2 yapılandırması) gerçek şifre/anahtarları düz metin tutuyordu ve bu
   dosya kolayca bir git deposuna eklenebilirdi. **Düzeltme:** Dosya artık
   `ecosystem.config.example.js` adıyla yalnızca yer tutucu değerler içeren
   bir şablon olarak geliyor; gerçek değerler yalnızca sunucuda oluşturulan
   `ecosystem.config.js` içinde kalıyor ve `.gitignore` bu dosyayı hariç
   tutuyor.
9. **`bayi.db`, `node_modules`, `.env` gibi dosyalar için `.gitignore`
   yoktu** — ileride bir git deposu kullanılırsa veritabanı veya bağımlılık
   klasörünün yanlışlıkla commit edilme riski vardı. **Düzeltme:**
   `.gitignore` eklendi.

### Denetlenip risksiz bulunanlar

- **SQL enjeksiyonu**: Tüm sorgular parametreli (`db.prepare(...).run(...)`)
  çalıştırılıyor, kullanıcı girdisi hiçbir zaman doğrudan SQL metnine
  eklenmiyor.
- **Bağımlılık zafiyetleri**: `npm audit` → **0 zafiyet** (test edildi).
- **Hata mesajlarında iç sistem bilgisi sızıntısı**: Merkezi bir hata
  yakalayıcı eklendi; beklenmeyen hatalarda istemciye yalnızca genel bir
  mesaj dönüyor, teknik detay/stack trace yalnızca sunucu logunda kalıyor.
- **CSRF**: Oturum çerezi `SameSite=Lax` ile ayarlı; bu, tarayıcıların
  başka bir siteden gönderilen POST/PUT/DELETE isteklerinde çerezi
  göndermesini büyük ölçüde engeller.

### Bilinen, düşük öncelikli bir ödünleşim

- Oturumlar bellek içinde (Express'in varsayılan `MemoryStore`) tutuluyor;
  Node.js bunu üretimde "önerilmez" diye uyarıyor. Bu proje tek bir pm2
  sürecinde (`instances: 1`) çalıştığı ve oturumlar yalnızca gerçek admin
  girişlerinde (zaten hız sınırlı) oluştuğu için pratikte risk düşük. İleride
  ölçeklenme ihtiyacı doğarsa (birden fazla süreç/sunucu) kalıcı bir oturum
  deposuna (örn. `connect-sqlite3` veya Redis) geçilmesi önerilir.

### Kapsam dışı bırakılanlar (neden)

- **Gerçek zamanlı/hacimli DDoS koruması**: Uygulama ve nginx seviyesindeki
  hız sınırlamaları kaba kuvvet ve küçük ölçekli kötüye kullanımı engeller,
  ama binlerce IP'den gelen büyük hacimli bir DDoS saldırısını tek bir VPS
  asla tam olarak durduramaz. Bunun gerçek çözümü, domain'i **Cloudflare**
  gibi ücretsiz bir CDN/proxy'nin arkasına almaktır (turuncu bulut modu) —
  bu, sunucunuzun gerçek IP'sini gizler ve hacimli saldırıları sizin
  sunucunuza ulaşmadan filtreler. Bunu domain DNS ayarlarını Cloudflare'e
  yönlendirerek kendiniz kurabilirsiniz; isterseniz bu kurulumda da
  adım adım eşlik edebilirim.
- **Dosya içeriğinin "magic byte" ile doğrulanması**: Şu an dosya uzantısı
  + tarayıcının bildirdiği MIME tipi kontrol ediliyor. Çok daha katı bir
  savunma, dosyanın ilk baytlarını okuyup gerçekten bir PNG/JPEG olduğunu
  doğrulamaktır — bu projenin ölçeği için gerekli görülmedi, ama
  isterseniz eklenebilir.
