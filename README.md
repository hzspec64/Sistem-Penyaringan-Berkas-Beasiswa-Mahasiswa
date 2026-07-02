<div align="center">

<img src="assets/hz64-banner.png" alt="HZ64 Scholarship Assistant Banner" width="100%" style="max-width: 720px; border-radius: 16px;" />

<br><br>

# HZ64 Scholarship Assistant

**Sistem Penyaringan Berkas Beasiswa Mahasiswa**

`KMIE22002SI` · Kecerdasan Artifisial · UAS STTNF

<br>

[![Telegram Bot](https://img.shields.io/badge/Telegram-@hz__64bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/hz_64bot)
[![n8n](https://img.shields.io/badge/Workflow-n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)
[![HTML5](https://img.shields.io/badge/Web-index.html-E34F26?style=for-the-badge&logo=html5&logoColor=white)](index.html)

<br>

*こんにちは! (Konnichiwa)* — Halo! Siap bantu cek kelayakan beasiswamu.

<img src="assets/hz64-mascot.png" alt="HZ64 Mascot" width="140" />

</div>

---

## はじめに · Pengenalan

Proyek ini menggabungkan **Bot Telegram pintar** dan **simulasi web** untuk menyaring mahasiswa yang layak mendaftar beasiswa.

| Komponen | Peran | Bobot UAS |
|----------|-------|-----------|
| **Part A** — Bot Telegram + n8n | Penyaringan otomatis + AI + Google Sheets | 45% |
| **Part B** — `index.html` | Kalkulator simulasi di browser | 45% |
| **Video demo** | Penjelasan singkat sistem | 10% |

---

## 条件 · Syarat Lolos

> Kedua syarat **harus** terpenuhi untuk dinyatakan *Lolos Seleksi Awal*.

| Kriteria | Nilai |
|----------|-------|
| IPK minimal | **≥ 3.30** |
| Pendapatan orang tua / bulan | **≤ Rp 5.000.000** |

---

## 挨拶 · Gaya Bot HZ64

<table>
<tr>
<td width="120"><img src="assets/hz64-mascot.png" alt="Mascot" width="100" /></td>
<td>

Bot membalas dengan sentuhan bahasa Jepang yang ringan dan ramah:

| Momen | Pesan |
|-------|-------|
| `/start` | `Halo @user!` + **こんにちは! (Konnichiwa)** |
| Lolos | `Selamat @user!` + **おめでとう (Omedetou)** |
| Tidak lolos | `Tetap semangat!` + **頑張れ! (Ganbare)** |

</td>
</tr>
</table>

Contoh balasan lolos:

```
🎉 Selamat, Muhammad!
おめでとう (Omedetou)

Berkas Anda dinyatakan Lolos Seleksi Awal.

📊 IPK: 3.52
💰 Pendapatan: Rp 4.500.000

Data sudah tersimpan di Google Sheets ✅
```

---

## 構成 · Struktur Proyek

```
├── assets/
│   ├── hz64-banner.png         # Banner anime kawaii
│   └── hz64-mascot.png         # Mascot waifu assistant
├── index.html                  # Part B — HZ64 Scholarship Assistant (web)
├── n8n-workflow-beasiswa.json  # Part A — workflow n8n
├── bot/                        # Bot Telegraf lokal (opsional)
│   ├── index.js
│   ├── keyboards.js
│   └── parser.js
├── package.json
├── .env.example
└── README.md
```

---

## Part A — Bot Telegram + n8n

### Alur workflow

```
Telegram Trigger
    → Router Menu & Pesan
        → Menu / Syarat / Bantuan
        → AI Agent Ekstraksi
            → Parse & Cek Kelayakan
                → If Lolos?
                    ├─ Ya   → Google Sheets → Telegram Balas Lolos
                    └─ Tidak → Telegram Balas Tidak Lolos
```

### Fitur

- Tombol berwarna **primary / success / danger** (full width)
- **Demo Lolos** & **Demo Tidak Lolos** — skenario siap pakai untuk UAS
- Ekstraksi IPK & pendapatan dari teks bebas via **AI Agent**
- Pendaftar lolos otomatis tersimpan di **Google Sheets**
- Nama lengkap user (first + last name) di balasan bot

### Setup n8n

1. Buat bot di [@BotFather](https://t.me/BotFather) → simpan token.
2. Import `n8n-workflow-beasiswa.json` ke [n8n Cloud](https://n8n.io).
3. Hubungkan credential:
   - **Telegram Bot API**
   - **OpenAI Chat Model** → port *Chat Model* pada AI Agent
   - **Google Sheets OAuth2**
4. Mapping kolom **Google Sheets** (mode Expression / fx):

   | Kolom | Expression |
   |-------|------------|
   | Nama | `$json.nama` |
   | IPK | `$json.ipk` |
   | Pendapatan | `$json.pendapatan` |
   | Status | `Lolos Seleksi Awal` |
   | Waktu | `$now.toFormat('dd/MM/yyyy HH:mm')` |

5. **Active ON** workflow.

> Satu bot = satu trigger aktif. Jangan jalankan `npm start` bersamaan dengan n8n Active.

### Skenario uji

| Input | Hasil |
|-------|-------|
| `IPK saya 3.52 dan pendapatan orang tua 4.5 juta` | Lolos · masuk Sheets |
| `IPK saya 3.10 dan gaji orang tua 3 juta` | Tidak lolos · tidak masuk Sheets |

---

## Part B — Simulasi Web

Buka `index.html` di browser — tidak perlu server.

<div align="center">
  <img src="assets/hz64-banner.png" alt="Preview Web" width="90%" style="max-width: 560px; border-radius: 12px;" />
  <br><br>
  <sub>Animasi sakura · mascot floating · tema pastel anime kawaii</sub>
</div>

### Branding

- Header: **HZ64 Scholarship Assistant**
- Footer: *Powered by HZ64 Scholarship Bot · AI Eligibility Checker*
- Rekomendasi lolos: daftar via **@hz_64bot**

### Logika

```javascript
if (ipk >= 3.3 && pendapatan <= 5000000) {
  // Hijau — Layak mendaftar via Telegram @hz_64bot
} else {
  // Merah — Tidak memenuhi syarat
}
```

### Tes cepat

| IPK | Pendapatan | Hasil |
|-----|------------|-------|
| 3.52 | 4.500.000 | Hijau |
| 3.10 | 3.000.000 | Merah |

---

## Bot Lokal (Opsional)

```bash
cp .env.example .env   # isi BOT_TOKEN
npm install
npm start
```

Matikan workflow n8n (**Active OFF**) sebelum menjalankan bot lokal.

---

## 提出 · Pengumpulan UAS

Arsip: `nim_nama_uas_AI.zip`

- [ ] `index.html`
- [ ] `n8n-workflow-beasiswa.json`
- [ ] Link bot → [t.me/hz_64bot](https://t.me/hz_64bot)
- [ ] Link video demo (≤ 3 menit)

### Checklist video

- [ ] Bot — Demo Lolos + data masuk Sheets
- [ ] Bot — Demo Tidak Lolos
- [ ] Web — hasil hijau & merah

---

## 技術 · Teknologi

| Stack | Fungsi |
|-------|--------|
| [n8n](https://n8n.io) | Otomasi workflow |
| [Telegram Bot API](https://core.telegram.org/bots/api) | Interface chat |
| OpenAI | Ekstraksi data (AI Agent) |
| Google Sheets | Database pendaftar lolos |
| HTML · CSS · JS | Simulasi web |
| Node.js · Telegraf | Bot lokal (opsional) |

---

<div align="center">

<img src="assets/hz64-mascot.png" alt="Mascot" width="100" />

<br>

**Powered by HZ64 Scholarship Bot · AI Eligibility Checker**

*がんばって! (Ganbatte)* — Good luck with your scholarship!

<br>

MIT License · Proyek akademik UAS STTNF

</div>
