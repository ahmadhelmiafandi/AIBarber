"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [name, setName] = useState("Admin Barbershop");
  const [email, setEmail] = useState("admin@aibarber.com");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Pengaturan</h1>

      <div className="rounded-[20px] border border-border bg-card p-8 shadow-[0_8px_30px_rgba(0,0,0,.06)] max-w-2xl space-y-6">
        <h2 className="text-lg font-medium">Profil Admin</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[12px] border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[12px] border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <button
          onClick={() => setSaved(true)}
          className="rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Simpan
        </button>
        {saved && <p className="text-sm text-success">Pengaturan berhasil disimpan</p>}
      </div>

      <div className="rounded-[20px] border border-border bg-card p-8 shadow-[0_8px_30px_rgba(0,0,0,.06)] max-w-2xl space-y-6">
        <h2 className="text-lg font-medium">Ubah Password</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Lama</label>
            <input type="password" className="w-full rounded-[12px] border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru</label>
            <input type="password" className="w-full rounded-[12px] border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Konfirmasi Password</label>
            <input type="password" className="w-full rounded-[12px] border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <button className="rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          Ubah Password
        </button>
      </div>
    </div>
  );
}
