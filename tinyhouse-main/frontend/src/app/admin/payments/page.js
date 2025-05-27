"use client";

import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <CreditCard className="text-purple-600 w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-800">Ödemeler</h1>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 text-lg">
          Son yapılan ödemeler burada listelenir.
        </p>

        <div className="mt-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="p-4 bg-gray-100 rounded-xl shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-gray-800 font-semibold">Ödeme #{i + 500}</p>
              <p className="text-gray-500 text-sm">
                ₺{100 + i * 25} • Visa • 15/05/2025
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
