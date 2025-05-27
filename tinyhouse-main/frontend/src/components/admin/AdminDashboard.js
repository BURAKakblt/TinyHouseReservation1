"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { User, CalendarCheck, CreditCard, Home } from "lucide-react";
import { motion } from "framer-motion";

const mockStats = [
  { name: "Users", count: 124 },
  { name: "Reservations", count: 87 },
  { name: "Payments", count: 72 },
  { name: "Listings", count: 34 },
];

const chartData = [
  { name: "Jan", reservations: 10 },
  { name: "Feb", reservations: 15 },
  { name: "Mar", reservations: 30 },
  { name: "Apr", reservations: 25 },
  { name: "May", reservations: 40 },
];

const icons = {
  Users: <User className="text-blue-600" />,
  Reservations: <CalendarCheck className="text-green-600" />,
  Payments: <CreditCard className="text-purple-600" />,
  Listings: <Home className="text-yellow-600" />,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            onClick={() => router.push(`/admin/${item.name.toLowerCase()}`)}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
          >
            <div>
              <p className="text-sm text-gray-500">{item.name}</p>
              <p className="text-xl font-semibold">{item.count}</p>
            </div>
            <div className="text-3xl">{icons[item.name]}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Rezervasyon Trendleri</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="reservations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
