"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Format email tidak valid";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const serverMsg = errorObj.response?.data?.message || "Gagal mengirim link reset password. Silakan coba lagi.";
      const fieldErrors = errorObj.response?.data?.errors;
      if (fieldErrors?.email?.[0]) {
        setErrors({ email: fieldErrors.email[0] });
      } else {
        setErrors({ general: serverMsg });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-card rounded-[20px] border border-border shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            AI Barbershop
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset
            password.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center">
              <Mail className="size-5 text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Link reset password telah dikirim ke{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Silakan cek inbox Anda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed font-medium">
                {errors.general}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-[14px] border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow disabled:opacity-50"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-[14px] bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span>{loading ? "Mengirim..." : "Kirim Link Reset"}</span>
            </button>
          </form>
        )}

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
