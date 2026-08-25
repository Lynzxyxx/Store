import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) redirect("/");

  return (
    <div className="py-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <span className="text-xs text-black/40 dark:text-white/40">Masuk sebagai {session.username}</span>
      </div>
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
