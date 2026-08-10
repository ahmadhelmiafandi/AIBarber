"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User as UserIcon, Phone, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AxiosError } from "axios";
import { ApiError } from "@/types/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Format email tidak valid";
    if (!phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 8)
      e.password = "Password minimal 8 karakter";
    if (!confirmPassword) e.confirmPassword = "Konfirmasi password wajib diisi";
    else if (password !== confirmPassword)
      e.confirmPassword = "Password tidak cocok";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setServerError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name, email, password, phone });
      router.push("/dashboard/booking");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const respData = axiosError.response?.data;

      if (respData?.errors && typeof respData.errors === "object") {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(respData.errors)) {
          if (Array.isArray(msgs) && msgs[0]) {
            fieldErrors[key] = msgs[0];
          }
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        const firstErr = Object.values(fieldErrors)[0];
        setServerError(firstErr || respData.message || "Gagal mendaftar. Silakan coba lagi.");
      } else if (respData?.message) {
        setServerError(respData.message);
      } else {
        setServerError("Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    {
      key: "name",
      label: "Nama Lengkap",
      type: "text",
      value: name,
      onChange: setName,
      placeholder: "John Doe",
      icon: UserIcon,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      value: email,
      onChange: setEmail,
      placeholder: "nama@email.com",
      icon: Mail,
    },
    {
      key: "phone",
      label: "Nomor Telepon",
      type: "tel",
      value: phone,
      onChange: setPhone,
      placeholder: "08123456789",
      icon: Phone,
    },
    {
      key: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      value: password,
      onChange: setPassword,
      placeholder: "••••••••",
      icon: Lock,
      isPassword: true,
      showState: showPassword,
      toggleShow: () => setShowPassword(!showPassword),
    },
    {
      key: "confirmPassword",
      label: "Konfirmasi Password",
      type: showConfirmPassword ? "text" : "password",
      value: confirmPassword,
      onChange: setConfirmPassword,
      placeholder: "••••••••",
      icon: Lock,
      isPassword: true,
      showState: showConfirmPassword,
      toggleShow: () => setShowConfirmPassword(!showConfirmPassword),
    },
  ] as const;

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-slate-900 rounded-[20px] border border-slate-800 shadow-xl p-8 text-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            MyBarber
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Buat akun baru
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {f.label}
              </label>
              <div className="relative">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full h-11 pl-10 pr-10 rounded-[14px] border border-slate-800 bg-slate-950 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                {"isPassword" in f && f.isPassword && (
                  <button
                    type="button"
                    onClick={f.toggleShow}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={f.showState ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {f.showState ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                )}
              </div>
              {errors[f.key] && (
                <p className="text-red-400 text-xs mt-1">
                  {errors[f.key]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-[14px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Daftar</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="text-amber-400 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
