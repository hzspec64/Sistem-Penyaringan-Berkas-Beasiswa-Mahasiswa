const IPK_MIN = 3.3;
const PENDAPATAN_MAX = 5_000_000;

/**
 * Mengekstrak IPK dan pendapatan dari teks bebas (mirip peran AI Agent di n8n).
 */
function extractScholarshipData(text) {
  const normalized = text.toLowerCase().replace(/,/g, '.');

  const ipkMatch =
    normalized.match(/ipk\s*(?:saya|ku|ku)?\s*(?:adalah|:)?\s*(\d+(?:[.,]\d+)?)/i) ||
    normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:ipk)/i);

  let pendapatan = null;

  // "4.5 juta", "4,5 juta", "4500000", "4.500.000"
  const jutaMatch = normalized.match(
    /(?:pendapatan|gaji|penghasilan)(?:\s+orang\s+tua)?[^0-9]*(\d+(?:[.,]\d+)?)\s*juta/i
  );
  if (jutaMatch) {
    pendapatan = parseFloat(jutaMatch[1].replace(',', '.')) * 1_000_000;
  }

  if (pendapatan === null) {
    const rpMatch = normalized.match(
      /(?:pendapatan|gaji|penghasilan)(?:\s+orang\s+tua)?[^0-9]*(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+)/i
    );
    if (rpMatch) {
      pendapatan = parseInt(rpMatch[1].replace(/[.,]/g, ''), 10);
    }
  }

  if (pendapatan === null) {
    const afterIpk = normalized.match(/ipk[^0-9]*\d+(?:[.,]\d+)?[^0-9]+(\d+(?:[.,]\d+)?)\s*juta/i);
    if (afterIpk) {
      pendapatan = parseFloat(afterIpk[1].replace(',', '.')) * 1_000_000;
    }
  }

  const ipk = ipkMatch ? parseFloat(ipkMatch[1].replace(',', '.')) : null;

  if (ipk === null || Number.isNaN(ipk)) {
    return { ipk: null, pendapatan: null, error: 'IPK tidak terdeteksi dari pesan Anda.' };
  }

  if (pendapatan === null || Number.isNaN(pendapatan)) {
    return {
      ipk: null,
      pendapatan: null,
      error: 'Pendapatan orang tua tidak terdeteksi dari pesan Anda.',
    };
  }

  if (ipk < 0 || ipk > 4) {
    return { ipk: null, pendapatan: null, error: 'Nilai IPK tidak valid (harus 0–4).' };
  }

  return { ipk, pendapatan, error: null };
}

function checkEligibility(ipk, pendapatan) {
  return ipk >= IPK_MIN && pendapatan <= PENDAPATAN_MAX;
}

module.exports = { extractScholarshipData, checkEligibility, IPK_MIN, PENDAPATAN_MAX };
