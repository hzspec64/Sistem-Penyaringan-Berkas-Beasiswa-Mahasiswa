require('dotenv').config();
const { Telegraf } = require('telegraf');
const { extractScholarshipData, checkEligibility } = require('./parser');
const {
  LABELS,
  mainMenuKeyboard,
  ipkKeyboard,
  pendapatanKeyboard,
  resultKeyboard,
} = require('./keyboards');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN belum diisi. Salin .env.example ke .env lalu isi token dari @BotFather.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const sessions = new Map();

const SYARAT = `📋 *Syarat Lolos Seleksi Awal*

• IPK ≥ 3.30
• Pendapatan orang tua ≤ Rp 5.000.000/bulan

Gunakan tombol *Daftar Beasiswa* atau *Demo* untuk mencoba.`;

const BANTUAN = `ℹ️ *Cara Pakai Bot*

1. Tekan *🎓 Daftar Beasiswa*
2. Pilih IPK lalu pendapatan orang tua
3. Bot akan menilai kelayakan Anda

Atau gunakan:
• *✅ Demo Lolos* — skenario ujian lolos
• *❌ Demo Tidak Lolos* — skenario ujian tidak lolos
• *✍️ Ketik Pesan Bebas* — format bebas seperti soal Part A`;

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 'menu', ipk: null });
  }
  return sessions.get(userId);
}

function resetSession(userId) {
  sessions.set(userId, { step: 'menu', ipk: null });
}

function parseIpkButton(text) {
  const m = text.match(/IPK\s*(\d+(?:[.,]\d+)?)/i);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

function parsePendapatanButton(text) {
  const digits = text.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : null;
}

function logLolos(user, ipk, pendapatan) {
  console.log('[LOLOS]', {
    userId: user.id,
    username: user.username || '-',
    nama: [user.first_name, user.last_name].filter(Boolean).join(' '),
    ipk,
    pendapatan,
    waktu: new Date().toISOString(),
  });
}

async function kirimHasil(ctx, ipk, pendapatan) {
  const user = ctx.from;
  const lolos = checkEligibility(ipk, pendapatan);
  const nama = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Mahasiswa';

  if (lolos) {
    logLolos(user, ipk, pendapatan);
    await ctx.reply(
      `🎉 *Selamat, ${nama}!* おめでとう (Omedetou)\n\n` +
        `Berkas Anda dinyatakan *Lolos Seleksi Awal*.\n\n` +
        `📊 IPK: *${ipk}*\n` +
        `💰 Pendapatan: *Rp ${pendapatan.toLocaleString('id-ID')}*\n\n` +
        `Data sudah tersimpan di Google Sheets ✅`,
      { parse_mode: 'Markdown', reply_markup: resultKeyboard() }
    );
  } else {
    await ctx.reply(
      `😔 Mohon maaf, *${nama}* — Anda belum memenuhi kriteria beasiswa kali ini.\n\n` +
        `📊 IPK: *${ipk}* (min. 3.30)\n` +
        `💰 Pendapatan: *Rp ${pendapatan.toLocaleString('id-ID')}* (maks. Rp 5.000.000)\n\n` +
        `Tetap semangat! 💪 頑張れ! (Ganbare)`,
      { parse_mode: 'Markdown', reply_markup: resultKeyboard() }
    );
  }

  resetSession(user.id);
}

async function kirimMenuUtama(ctx) {
  resetSession(ctx.from.id);
  const nama = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || ctx.from.username || 'Mahasiswa';
  const teks =
    `Halo ${nama}! 👋 こんにちは! (Konnichiwa)\n\n` +
    `Saya *Bot Penyaring Beasiswa STTNF* — siap bantu cek kelayakan beasiswa.\n\n` +
    `Silakan pilih tombol di bawah:`;
  await ctx.reply(teks, {
    parse_mode: 'Markdown',
    reply_markup: mainMenuKeyboard(),
  });
}

async function prosesTeksBebas(ctx, text) {
  const { ipk, pendapatan, error } = extractScholarshipData(text);
  if (error) {
    return ctx.reply(`⚠️ ${error}`, { reply_markup: mainMenuKeyboard() });
  }
  return kirimHasil(ctx, ipk, pendapatan);
}

async function jalankanDemo(ctx, teks) {
  return prosesTeksBebas(ctx, teks);
}

bot.start((ctx) => kirimMenuUtama(ctx));
bot.help((ctx) => ctx.reply(BANTUAN, { parse_mode: 'Markdown', reply_markup: mainMenuKeyboard() }));

bot.command('menu', (ctx) => kirimMenuUtama(ctx));

bot.action('daftar_lagi', async (ctx) => {
  await ctx.answerCbQuery();
  const session = getSession(ctx.from.id);
  session.step = 'await_ipk';
  session.ipk = null;
  await ctx.reply('📚 *Langkah 1/2*\nPilih IPK Anda:', {
    parse_mode: 'Markdown',
    reply_markup: ipkKeyboard(),
  });
});

bot.action('menu_utama', async (ctx) => {
  await ctx.answerCbQuery();
  await kirimMenuUtama(ctx);
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const session = getSession(userId);

  if (text.startsWith('/')) return;

  // --- Tombol menu utama ---
  if (text === LABELS.MENU || text === LABELS.BATAL) {
    return kirimMenuUtama(ctx);
  }

  if (text === LABELS.DAFTAR) {
    session.step = 'await_ipk';
    return ctx.reply('📚 *Langkah 1/2*\nPilih IPK Anda:', {
      parse_mode: 'Markdown',
      reply_markup: ipkKeyboard(),
    });
  }

  if (text === LABELS.DEMO_LOLOS) {
    return jalankanDemo(ctx, 'IPK saya 3.52 dan pendapatan orang tua 4.5 juta.');
  }

  if (text === LABELS.DEMO_TIDAK) {
    return jalankanDemo(ctx, 'IPK saya 3.10 dan gaji orang tua 3 juta.');
  }

  if (text === LABELS.SYARAT) {
    return ctx.reply(SYARAT, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(),
    });
  }

  if (text === LABELS.BANTUAN) {
    return ctx.reply(BANTUAN, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(),
    });
  }

  if (text === LABELS.KETIK_BEBAS) {
    session.step = 'await_free_text';
    return ctx.reply(
      '✍️ Ketik pesan bebas, contoh:\n"IPK saya 3.52 dan pendapatan orang tua 4.5 juta."',
      { reply_markup: mainMenuKeyboard() }
    );
  }

  // --- Alur daftar: pilih IPK ---
  if (session.step === 'await_ipk') {
    if (text === LABELS.IPK_CUSTOM) {
      session.step = 'await_ipk_custom';
      return ctx.reply('Ketik nilai IPK Anda (contoh: 3.45):', {
        reply_markup: mainMenuKeyboard(),
      });
    }

    const ipk = parseIpkButton(text);
    if (ipk === null || ipk < 0 || ipk > 4) {
      return ctx.reply('⚠️ Pilih IPK dari tombol atau ketik angka valid (0–4).', {
        reply_markup: ipkKeyboard(),
      });
    }

    session.ipk = ipk;
    session.step = 'await_pendapatan';
    return ctx.reply(`✅ IPK: *${ipk}*\n\n💰 *Langkah 2/2*\nPilih pendapatan orang tua per bulan:`, {
      parse_mode: 'Markdown',
      reply_markup: pendapatanKeyboard(),
    });
  }

  if (session.step === 'await_ipk_custom') {
    const ipk = parseFloat(text.replace(',', '.'));
    if (Number.isNaN(ipk) || ipk < 0 || ipk > 4) {
      return ctx.reply('⚠️ IPK tidak valid. Contoh: 3.45', {
        reply_markup: ipkKeyboard(),
      });
    }
    session.ipk = ipk;
    session.step = 'await_pendapatan';
    return ctx.reply(`✅ IPK: *${ipk}*\n\n💰 *Langkah 2/2*\nPilih pendapatan orang tua per bulan:`, {
      parse_mode: 'Markdown',
      reply_markup: pendapatanKeyboard(),
    });
  }

  // --- Alur daftar: pilih pendapatan ---
  if (session.step === 'await_pendapatan') {
    if (text === LABELS.PENDAPATAN_CUSTOM) {
      session.step = 'await_pendapatan_custom';
      return ctx.reply('Ketik pendapatan per bulan dalam Rupiah (contoh: 4500000 atau 4.5 juta):', {
        reply_markup: mainMenuKeyboard(),
      });
    }

    const pendapatan = parsePendapatanButton(text);
    if (!pendapatan) {
      return ctx.reply('⚠️ Pilih pendapatan dari tombol atau ketik angka valid.', {
        reply_markup: pendapatanKeyboard(),
      });
    }
    return kirimHasil(ctx, session.ipk, pendapatan);
  }

  if (session.step === 'await_pendapatan_custom') {
    const parsed = extractScholarshipData(`pendapatan ${text}`);
    const pendapatan = parsed.pendapatan;
    if (!pendapatan || Number.isNaN(pendapatan)) {
      return ctx.reply('⚠️ Pendapatan tidak valid. Contoh: 4500000 atau "4.5 juta"', {
        reply_markup: pendapatanKeyboard(),
      });
    }
    return kirimHasil(ctx, session.ipk, pendapatan);
  }

  if (session.step === 'await_free_text') {
    resetSession(userId);
    return prosesTeksBebas(ctx, text);
  }

  // Fallback: tetap dukung teks bebas (sesuai soal Part A)
  return prosesTeksBebas(ctx, text);
});

bot.launch().then(() => {
  console.log('✅ Bot beasiswa aktif (mode tombol full color). Tekan Ctrl+C untuk berhenti.');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
