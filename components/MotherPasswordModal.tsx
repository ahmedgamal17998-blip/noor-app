"use client";

import { useState } from "react";
import { verifyParentPassword } from "@/lib/auth/parent-password";

export function MotherPasswordModal({
  title = "تأكيد ماما",
  message = "ادخلي كلمة السر علشان نأكد أنك متابعة",
  onSuccess,
  onCancel,
}: {
  title?: string;
  message?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setBusy(true);
    setError(null);
    const ok = await verifyParentPassword(password);
    setBusy(false);
    if (ok) {
      onSuccess();
    } else {
      setError("كلمة السر غلط، حاولي تاني");
      setPassword("");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
      onClick={onCancel}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-sand rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-soft-lg"
      >
        <div className="text-center">
          <div className="text-5xl mb-2">🔐</div>
          <h2 className="text-lg font-bold text-masjid-dark">{title}</h2>
          <p className="text-sm text-masjid-dark/70 mt-1">{message}</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة السر بتاعت ماما"
          className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none text-center text-lg"
          autoFocus
        />
        {error && <p className="text-xs text-wrong text-center">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-sand-dark py-3 rounded-2xl font-semibold text-masjid-dark"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={!password.trim() || busy}
            className="flex-1 bg-masjid text-sand py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            {busy ? "..." : "تأكيد"}
          </button>
        </div>
      </form>
    </div>
  );
}
