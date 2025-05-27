"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function ListingsPage() {
  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <Home className="text-yellow-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">İlanlar</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 text-lg">
          Sistemdeki ilanların listesini buradan kontrol edebilirsin.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="p-4 bg-gray-100 rounded-xl shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-gray-800 font-semibold">Tiny House #{i + 1}</p>
              <p className="text-gray-500 text-sm">
                Konum: İstanbul • 2 yatak • 1 banyo
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
