"use client";
import React from "react";
import Link from "next/link";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="py-8 px-4 flex flex-wrap justify-around text-sm"
      style={{ backgroundColor: "#b4b4b4", color: "#260B01" }}
    >
      {/* Destek */}
      <div>
        <h3 className="font-bold underline mb-2">Destek</h3>
        <ul className="space-y-1">
          <li>
            <Link href="#" style={{ color: "#260B01" }}>
              Yardım Merkezi
            </Link>
          </li>
          <li>
            <Link href="#" style={{ color: "#260B01" }}>
              SSS
            </Link>
          </li>
        </ul>
      </div>

      {/* İletişim */}
      <div>
        <h3 className="font-bold underline mb-2">İletişim</h3>
        <p>Telefon: 0123 456 7890</p>
        <p>Email: info@example.com</p>
      </div>

      {/* Sosyal Medya */}
      <div>
        <h3 className="font-bold underline mb-2">Bizi Takip Edin</h3>
        <div className="flex gap-4 text-xl">
          <Link href="https://instagram.com" target="_blank">
            <FaInstagram
              style={{ color: "#260B01" }}
              className="hover:opacity-75"
            />
          </Link>
          <Link href="https://twitter.com" target="_blank">
            <FaTwitter
              style={{ color: "#260B01" }}
              className="hover:opacity-75"
            />
          </Link>
          <Link href="https://facebook.com" target="_blank">
            <FaFacebook
              style={{ color: "#260B01" }}
              className="hover:opacity-75"
            />
          </Link>
        </div>
      </div>

      {/* Mail Atın */}
      <div>
        <h3 className="font-bold underline mb-2">Mail Atın</h3>
        <Link
          href="mailto:beyza@example.com"
          className="underline hover:opacity-75"
          style={{ color: "#260B01" }}
        >
          Bize e-posta gönderin
        </Link>
      </div>

      {/* Telif */}
      <div className="w-full text-center mt-6">
        <p>© 2025 Tiny House. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
};

export default Footer;
