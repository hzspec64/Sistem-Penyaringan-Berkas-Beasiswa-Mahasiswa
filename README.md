# Sistem Penyaringan Berkas Beasiswa Mahasiswa

Proyek UAS **KMIE22002SI — Kecerdasan Artifisial** berupa sistem penyaringan kelayakan beasiswa dengan **Bot Telegram (n8n)** dan **simulasi web (`index.html`)**.

## Kriteria Lolos

| Syarat | Nilai |
|--------|-------|
| IPK minimal | **≥ 3.30** |
| Pendapatan orang tua/bulan | **≤ Rp 5.000.000** |

Kedua syarat harus terpenuhi agar dinyatakan **Lolos Seleksi Awal**.

---

## Struktur Proyek

```
├── index.html                  # Part B — kalkulator simulasi beasiswa (web)
├── n8n-workflow-beasiswa.json  # Part A — workflow n8n (import ke n8n Cloud)
├── bot/                        # Bot Telegraf lokal (opsional, alternatif n8n)
│   ├── index.js
│   ├── keyboards.js
│   └── parser.js
├── package.json
├── .env.example
└── README.md
```

---

## Part A — Bot Telegram + n8n (45%)

### Alur workflow

```
Telegram Trigger → Router Menu → AI Agent → Parse & Cek Kelayakan
                                      → If Lolos?
                                         ├─ Ya  → Google Sheets → Balas Lolos
                                         └─ Tidak → Balas Tidak Lolos
```

### Fitur bot

- Menu `/start` dengan **tombol berwarna** (primary / success / danger)
- Tombol **Demo Lolos** & **Demo Tidak Lolos** untuk skenario UAS
- Ekstraksi IPK & pendapatan dari teks bebas via **AI Agent**
- Data pendaftar lolos otomatis masuk **Google Sheets**
- Balasan Telegram menampilkan detail IPK & pendapatan

### Setup n8n

1. Buat bot di [@BotFather](https://t.me/BotFather), simpan token.
2. Import `n8n-workflow-beasiswa.json` ke [n8n Cloud](https://n8n.io).
3. Hubungkan credential:
   - **Telegram Bot API**
   - **OpenAI Chat Model** (ke port *Chat Model* pada AI Agent)
   - **Google Sheets OAuth2**
4. Di node **Google Sheets**, isi Spreadsheet ID & mapping kolom:

   | Kolom | Expression |
   |-------|------------|
   | Nama | `{{ $json.nama }}` |
   | IPK | `{{ $json.ipk }}` |
   | Pendapatan | `{{ $json.pendapatan }}` |
   | Status | `Lolos Seleksi Awal` |
   | Waktu | `{{ $now.toFormat('dd/MM/yyyy HH:mm') }}` |

   > Pastikan mode **Expression (fx)** aktif agar tidak muncul `#ERROR!` di Sheets.

5. **Active ON** workflow — jangan jalankan bot lokal (`npm start`) bersamaan (satu token = satu trigger).

### Skenario uji

| Input | Hasil |
|-------|-------|
| `IPK saya 3.52 dan pendapatan orang tua 4.5 juta` | Lolos + tersimpan di Sheets |
| `IPK saya 3.10 dan gaji orang tua 3 juta` | Tidak lolos + tidak masuk Sheets |

---

## Part B — Simulasi Web `index.html` (45%)

Halaman web mandiri untuk simulasi kelayakan beasiswa.

### Cara menjalankan

Buka file `index.html` langsung di browser (double-click atau drag ke Chrome/Edge).

### Logika JavaScript

```javascript
if (ipk >= 3.3 && pendapatan <= 5000000) {
  // Hijau — Layak mendaftar via Telegram
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

## Bot Lokal Telegraf (Opsional)

Folder `bot/` berisi implementasi Node.js dengan [Telegraf](https://telegraf.js.org/) — **tidak wajib** jika sudah memakai n8n.

```bash
cp .env.example .env
# isi BOT_TOKEN dari BotFather

npm install
npm start
```

> **Penting:** Matikan workflow n8n (Active OFF) sebelum menjalankan bot lokal.

---

## Pengumpulan UAS

Siapkan arsip `nim_nama_uas_AI.zip` berisi:

- `index.html`
- Export workflow n8n (`n8n-workflow-beasiswa.json`)
- Link bot Telegram (`t.me/...`)
- Link video demo (≤ 3 menit)

### Checklist demo video

- [ ] Bot — skenario lolos + data masuk Sheets
- [ ] Bot — skenario tidak lolos
- [ ] `index.html` — hasil hijau & merah

---

## Teknologi

- [n8n](https://n8n.io) — otomasi workflow
- [Telegram Bot API](https://core.telegram.org/bots/api)
- OpenAI — ekstraksi data via AI Agent
- Google Sheets — penyimpanan pendaftar lolos
- HTML / CSS / JavaScript — simulasi web
- Node.js + Telegraf — bot lokal (opsional)

---

## Lisensi

MIT — proyek akademik UAS STTNF.
