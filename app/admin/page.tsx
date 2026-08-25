import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  expired: "bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
};

export default async function AdminDashboard() {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = orders ?? [];
  const totalOmzet = list.filter((o) => o.status === "success").reduce((sum, o) => sum + Number(o.amount), 0);
  const totalTrx = list.length;
  const pending = list.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="card rounded-xl p-4">
          <p className="text-xs text-black/40 dark:text-white/40 mb-1">Total Omzet (sukses)</p>
          <p className="font-bold text-base">{formatRupiah(totalOmzet)}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-xs text-black/40 dark:text-white/40 mb-1">Total Transaksi</p>
          <p className="font-bold text-base">{totalTrx}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="text-xs text-black/40 dark:text-white/40 mb-1">Pending</p>
          <p className="font-bold text-base">{pending}</p>
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Trx ID</th>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o: any) => (
                <tr key={o.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-4 py-3 font-mono">{o.trx_id}</td>
                  <td className="px-4 py-3">{o.products?.name ?? "-"}</td>
                  <td className="px-4 py-3">{o.target}</td>
                  <td className="px-4 py-3">{formatRupiah(Number(o.amount))}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black/40 dark:text-white/40">
                    {new Date(o.created_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-black/40 dark:text-white/40">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
