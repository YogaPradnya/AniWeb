import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "streamnime - Anime Streaming",
  description: "Platform streaming anime terlengkap.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#212121] text-white h-screen flex overflow-hidden font-sans">
        {/* Left Sidebar Fixed Width */}
        <Sidebar className="w-[240px] flex-shrink-0 border-r border-white/5 bg-[#262626]" />
        
        {/* Main Content Scrollable */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 scrollbar-hide">
          {children}
        </main>
      </body>
    </html>
  );
}
