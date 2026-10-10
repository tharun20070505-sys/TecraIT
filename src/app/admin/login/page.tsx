"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleAutoFill = () => {
    setEmail("admin@tecra.sriet.ac.in");
    setPassword("TecraAdminSecurePass2026!");
    setError(null);
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      // Successful login
      router.push(redirectTarget);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to authenticate";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#070B18]">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-blue/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Bar Navigation Back */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sand/70 hover:text-gold transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Department Home</span>
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-emerald uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald" />
          Auth Node v2.6
        </span>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-[#0B132B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Department Crest & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-royal-blue/30 via-midnight to-gold/20 border border-gold/30 mb-3 shadow-lg">
            <ShieldCheck className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-sand tracking-tight">
            TECRA Admin Portal
          </h1>
          <p className="text-xs text-sand/60 mt-1">
            Department of Information Technology, SRIET
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Credentials Auto-Fill Quick Action for Reviewers */}
        <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sand/80">
            <KeyRound className="w-4 h-4 text-gold shrink-0" />
            <span className="text-[11px]">Authorized Seed Credentials</span>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-2.5 py-1 text-[11px] font-semibold text-gold bg-gold/10 hover:bg-gold/20 rounded-lg border border-gold/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            {autoFilled ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald" />
                <span>Filled</span>
              </>
            ) : (
              <span>Fill Credentials</span>
            )}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1.5">
              Administrative Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sand/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tecra.sriet.ac.in"
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/15 focus:border-gold/60 focus:ring-1 focus:ring-gold/60 rounded-xl text-sand text-sm placeholder:text-sand/30 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-sand/80">
                Security Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sand/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 bg-black/30 border border-white/15 focus:border-gold/60 focus:ring-1 focus:ring-gold/60 rounded-xl text-sand text-sm placeholder:text-sand/30 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sand/40 hover:text-sand/80 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-gold via-[#e6b866] to-gold hover:from-[#e6b866] hover:to-gold text-midnight font-bold text-sm rounded-xl shadow-lg shadow-gold/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-midnight" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-[11px] text-sand/50 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold/80" />
            <span>Encrypted Web Crypto HMAC-SHA256 Session</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070B18] text-sand">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-gold" />
            <span className="text-xs font-mono text-sand/60">
              Loading security portal...
            </span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
