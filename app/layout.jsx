import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "AnimeOut - Nonton Anime Sub Indo Gratis HD",
  description: "Platform streaming anime terlengkap dan tercepat dengan kualitas HD. Nonton anime favorit kamu di AnimeOut.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-primary-light dark:bg-primary-dark text-gray-900 dark:text-white min-h-screen flex flex-col transition-colors duration-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

