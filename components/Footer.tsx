import { WhatsApp } from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 py-8 mt-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-black/50 dark:text-white/50">
        <p>© {new Date().getFullYear()} RYUU-STORE. Semua hak dilindungi.</p>
        <a
          href="https://wa.me/6283169147017"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium hover:underline"
        >
          <WhatsApp size={16} />
          CS WhatsApp: 083169147017
        </a>
      </div>
    </footer>
  );
}
