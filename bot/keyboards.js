/** Tombol reply keyboard full lebar + warna (Bot API: primary/success/danger) */

function btn(text, style) {
  const button = { text };
  if (style) button.style = style;
  return button;
}

function replyKeyboard(rows, placeholder = 'Pilih tombol di bawah...') {
  return {
    keyboard: rows,
    resize_keyboard: true,
    is_persistent: true,
    one_time_keyboard: false,
    input_field_placeholder: placeholder,
  };
}

function inlineKeyboard(rows) {
  return { inline_keyboard: rows };
}

const LABELS = {
  DAFTAR: '🎓 Daftar Beasiswa',
  DEMO_LOLOS: '✅ Demo Lolos (Skenario 1)',
  DEMO_TIDAK: '❌ Demo Tidak Lolos (Skenario 2)',
  SYARAT: '📋 Syarat Beasiswa',
  BANTUAN: 'ℹ️ Bantuan',
  MENU: '🏠 Menu Utama',
  CEK_HASIL: '🔍 Cek Kelayakan',
  KETIK_BEBAS: '✍️ Ketik Pesan Bebas',
  IPK_CUSTOM: '✏️ Ketik IPK Sendiri',
  PENDAPATAN_CUSTOM: '✏️ Ketik Pendapatan Sendiri',
  BATAL: '↩️ Batal',
};

const mainMenuKeyboard = () =>
  replyKeyboard(
    [
      [btn(LABELS.DAFTAR, 'primary')],
      [btn(LABELS.DEMO_LOLOS, 'success')],
      [btn(LABELS.DEMO_TIDAK, 'danger')],
      [btn(LABELS.SYARAT, 'primary'), btn(LABELS.BANTUAN, 'primary')],
      [btn(LABELS.KETIK_BEBAS, 'primary')],
    ],
    'Gunakan tombol menu di bawah'
  );

const ipkKeyboard = () =>
  replyKeyboard(
    [
      [btn('IPK 3.10', 'danger'), btn('IPK 3.30', 'primary')],
      [btn('IPK 3.40', 'success'), btn('IPK 3.52', 'success')],
      [btn('IPK 3.60', 'primary')],
      [btn(LABELS.IPK_CUSTOM, 'primary')],
      [btn(LABELS.BATAL, 'danger'), btn(LABELS.MENU, 'primary')],
    ],
    'Pilih IPK atau ketik sendiri'
  );

const pendapatanKeyboard = () =>
  replyKeyboard(
    [
      [btn('Rp 2.500.000', 'success'), btn('Rp 3.000.000', 'primary')],
      [btn('Rp 4.500.000', 'success'), btn('Rp 5.000.000', 'primary')],
      [btn('Rp 6.000.000', 'danger')],
      [btn(LABELS.PENDAPATAN_CUSTOM, 'primary')],
      [btn(LABELS.BATAL, 'danger'), btn(LABELS.MENU, 'primary')],
    ],
    'Pilih pendapatan orang tua/bulan'
  );

function inlineBtn(text, callbackData, style) {
  const button = { text, callback_data: callbackData };
  if (style) button.style = style;
  return button;
}

const resultKeyboard = () =>
  inlineKeyboard([
    [
      inlineBtn('🔄 Daftar Lagi', 'daftar_lagi', 'primary'),
      inlineBtn('🏠 Menu Utama', 'menu_utama', 'success'),
    ],
  ]);

const removeKeyboard = () => ({ remove_keyboard: true });

module.exports = {
  LABELS,
  btn,
  inlineBtn,
  replyKeyboard,
  inlineKeyboard,
  mainMenuKeyboard,
  ipkKeyboard,
  pendapatanKeyboard,
  resultKeyboard,
  removeKeyboard,
};
