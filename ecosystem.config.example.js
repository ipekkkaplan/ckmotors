// pm2 süreç yöneticisi yapılandırma ŞABLONU.
//
// Kullanım (sunucuda, proje kök dizininde):
//   cp ecosystem.config.example.js ecosystem.config.js
//   nano ecosystem.config.js   # ADMIN_SIFRE ve SESSION_SECRET'i gercek degerlerle doldurun
//   pm2 start ecosystem.config.js
//
// ÖNEMLİ: Doldurduğunuz ecosystem.config.js dosyasını asla bir git deposuna
// commit etmeyin — .gitignore bu dosyayı zaten hariç tutuyor. Gerçek şifre
// ve oturum anahtarı yalnızca sunucuda, bu dosyanın kendi içinde kalmalı.
//
// Rastgele bir SESSION_SECRET üretmek için:
//   openssl rand -hex 32
module.exports = {
  apps: [
    {
      name: 'ckmotors',
      script: 'dist/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ADMIN_SIFRE: 'BURAYA_GUCLU_BIR_SIFRE_YAZIN',
        SESSION_SECRET: 'BURAYA_UZUN_RASTGELE_BIR_ANAHTAR_YAZIN',
      },
      max_memory_restart: '300M',
    },
  ],
};
