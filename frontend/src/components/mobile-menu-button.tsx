"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Menu, X, Sparkles } from "lucide-react"

const navLinks = [
  { label: "Fitur AI", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Blog & Artikel", href: "#blog" },
  { label: "Statistik", href: "#stats" },
  { label: "Testimoni", href: "#testimonials" },
]

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground cursor-pointer transition-colors z-50 shrink-0"
        aria-label="Buka Menu Navigasi"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md md:hidden flex flex-col justify-between p-6 animate-in fade-in duration-200 border-b border-border">
          <div className="flex flex-col space-y-4 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-semibold text-foreground hover:text-primary py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-border/60">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard/booking"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pesan Sekarang</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
