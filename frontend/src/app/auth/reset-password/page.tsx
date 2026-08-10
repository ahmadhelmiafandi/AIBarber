"use client";

import { useState, Suspense, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import apiClient from "@/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!password) e.password = "Password baru wajib diisi";
    else if (password.length < 8) e.password = "Password minimal 8 karakter";

    if (!passwordConfirmation) e.password_confirmation = "Konfirmasi password wajib diisi";
    else if (password !== passwordConfirmation) e.password_confirmation = "Konfirmasi password tidak cocok";

    if (!token) e.general = "Token reset password tidak ditemukan.";
    if (!email) e.general = "Email reset password tidak ditemukan.";

    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login?reset=success");
      }, 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const serverMsg = errorObj.response?.data?.message || "Gagal mereset password. Silakan coba lagi.";
      const fieldErrors = errorObj.response?.data?.errors;
      setErrors({
        password: fieldErrors?.password?.[0] || "",
        password_confirmation: fieldErrors?.password_confirmation?.[0] || "",
        general: fieldErrors?.email?.[0] || serverMsg,
      });
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
            Masukkan password baru Anda untuk melanjutkan.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Password Berhasil Direset!</h2>
            <p className="text-sm text-muted-foreground">
              Password Anda telah diperbarui. Mengalihkan Anda ke halaman login...
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
            >
              Klik di sini jika tidak otomatis dialihkan
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {errors.general}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-10 rounded-[14px] border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-10 rounded-[14px] border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPasswordConfirmation ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-destructive text-xs mt-1">{errors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-[14px] bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span>{loading ? "Mereset..." : "Reset Password"}</span>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
