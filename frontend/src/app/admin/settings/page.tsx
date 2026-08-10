"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminSettingsPage() {
  const [name, setName] = useState("Admin Barbershop");
  const [email, setEmail] = useState("admin@aibarber.com");
  const [saved, setSaved] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                className="w-full rounded-[12px] border border-input bg-background pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showOldPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className="w-full rounded-[12px] border border-input bg-background pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showNewPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-[12px] border border-input bg-background pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>
        <button className="rounded-[14px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          Ubah Password
        </button>
      </div>
    </div>
  );
}
