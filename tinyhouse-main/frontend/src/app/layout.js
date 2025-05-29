"use client"; // İstemci bileşeni

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import { metadata } from "./metadata"; // metadata'yı buradan alıyoruz

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Navbar'ı gizlemek istediğimiz sayfalar
  const hideNavbarPages = ["/host", "/admin", "/owner2/dashboard", "/owner2/add-house", "/owner2/edit-house"]; // owner2 sayfalarında navbar yok
  // Footer'ı gizlemek istediğimiz sayfalar
  const hideFooterPages = ["/admin"];

  return (
    <html lang="en">
      <body>
        {/* Navbar sadece belirli sayfalarda gösterilecek */}
        {!hideNavbarPages.includes(pathname) && <Navbar />}

        <main>{children}</main>

        {/* Footer sadece belirli sayfalarda gösterilecek */}
        {!hideFooterPages.includes(pathname) && <Footer />}
      </body>
    </html>
  );
}
