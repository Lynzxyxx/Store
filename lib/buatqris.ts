import "server-only";

const BASE_URL = process.env.BUATQRIS_BASE_URL || "https://api.buatqris.site";
const ACCOUNT = process.env.BUATQRIS_ACCOUNT as string;
const SECRET = process.env.BUATQRIS_SECRET as string;

export type CreateQrisResult = {
  ok: boolean;
  ref?: string;
  qrisString?: string;
  qrImageUrl?: string;
  raw?: unknown;
  error?: string;
};

export type QrisStatusResult = {
  ok: boolean;
  status?: "pending" | "paid" | "expired" | "failed";
  raw?: unknown;
  error?: string;
};

/**
 * Membuat QRIS dinamis untuk satu transaksi.
 * Catatan: struktur endpoint mengikuti dokumentasi resmi buatqris.site.
 * Jika response API berbeda field, sesuaikan mapping di bawah — semua field
 * dari upstream tetap dikembalikan lewat `raw` supaya mudah di-debug.
 */
export async function createQris(params: {
  amount: number;
  trxId: string;
  note?: string;
}): Promise<CreateQrisResult> {
  if (!ACCOUNT || !SECRET) {
    return { ok: false, error: "BUATQRIS_ACCOUNT / BUATQRIS_SECRET belum di-set di environment." };
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/qris/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET}`,
        "X-Account-Id": ACCOUNT
      },
      body: JSON.stringify({
        account: ACCOUNT,
        amount: params.amount,
        reference_id: params.trxId,
        note: params.note ?? `Order ${params.trxId}`
      }),
      cache: "no-store"
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      return {
        ok: false,
        error: (data && (data.message || data.error)) || `QRIS create gagal (HTTP ${res.status})`,
        raw: data
      };
    }

    return {
      ok: true,
      ref: data.ref_id || data.reference_id || data.id || params.trxId,
      qrisString: data.qris_string || data.qrString || data.payload,
      qrImageUrl: data.qr_image_url || data.image_url,
      raw: data
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Gagal menghubungi buatqris.site" };
  }
}

export async function getQrisStatus(ref: string): Promise<QrisStatusResult> {
  if (!ACCOUNT || !SECRET) {
    return { ok: false, error: "BUATQRIS_ACCOUNT / BUATQRIS_SECRET belum di-set di environment." };
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/qris/status/${encodeURIComponent(ref)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "X-Account-Id": ACCOUNT
      },
      cache: "no-store"
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      return { ok: false, error: `Cek status gagal (HTTP ${res.status})`, raw: data };
    }

    const rawStatus = String(data.status || data.transaction_status || "pending").toLowerCase();
    const status: QrisStatusResult["status"] = ["paid", "success", "settlement"].includes(rawStatus)
      ? "paid"
      : ["expired", "expire"].includes(rawStatus)
      ? "expired"
      : ["failed", "failure", "cancel", "cancelled"].includes(rawStatus)
      ? "failed"
      : "pending";

    return { ok: true, status, raw: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Gagal menghubungi buatqris.site" };
  }
}

/** Verifikasi signature webhook (jika buatqris.site mengirim header signature). */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return process.env.NODE_ENV !== "production"; // di dev, izinkan tanpa signature
  const crypto = require("crypto") as typeof import("crypto");
  const expected = crypto.createHmac("sha256", SECRET || "").update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
