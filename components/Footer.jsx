import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 pt-20 pb-10 bg-white dark:bg-secondary-dark border-t border-black/5 dark:border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Slogan */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-black bg-accent-gradient bg-clip-text text-transparent italic mb-6">
              AnimeOut
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed text-sm mb-8 font-medium">
              Platform streaming anime terlengkap dan tercepat di Indonesia. Nikmati kualitas HD tanpa gangguan iklan untuk pengalaman menonton terbaik kamu.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-gray-900 dark:text-white">Navigasi</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">Home</Link>
              </li>
              <li>
                <Link href="/schedule" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">Schedule</Link>
              </li>
              <li>
                <Link href="/bookmarks" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">Bookmarks</Link>
              </li>
              <li>
                <Link href="/history" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">History</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-gray-900 dark:text-white">Informasi</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">Tentang Kami</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">DMCA</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-accent transition-colors font-semibold tracking-wider">Hubungi Kami</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-black/5 dark:border-white/5 gap-6 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            &copy; 2025 AnimeOut. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> by <span className="text-accent">Anonimuus</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
