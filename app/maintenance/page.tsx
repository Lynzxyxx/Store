export default function MaintenancePage() {
  return (
    <div className="min-h-[70vh] grid place-items-center text-center px-4">
      <div>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold text-2xl mb-6 animate-fadeIn">
          R
        </div>
        <h1 className="text-2xl font-semibold mb-2">Sedang Pemeliharaan</h1>
        <p className="text-black/60 dark:text-white/60 max-w-md mx-auto">
          RYUU-STORE sedang dalam proses pemeliharaan sistem untuk meningkatkan layanan. Silakan kembali
          beberapa saat lagi.
        </p>
        <a
          href="https://wa.me/6283169147017"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          Hubungi CS via WhatsApp
        </a>
      </div>
    </div>
  );
}
