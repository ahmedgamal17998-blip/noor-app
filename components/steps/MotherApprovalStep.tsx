"use client";

import { useState } from "react";
import type { SurahStep } from "@/lib/db/types";
import { MotherPasswordModal } from "@/components/MotherPasswordModal";
import { feedbackSuccess } from "@/lib/feedback";
import { StepVideo } from "./StepVideo";

export function MotherApprovalStep({
  step,
  icon,
  prompt,
  onComplete,
}: {
  step: SurahStep;
  icon: string;
  prompt: string;
  onComplete: () => void;
}) {
  const [readyForMom, setReadyForMom] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [done, setDone] = useState(false);

  const onApproved = () => {
    feedbackSuccess();
    setShowPasswordModal(false);
    setDone(true);
    onComplete();
  };

  if (done) {
    return (
      <div className="text-center space-y-3 py-8">
        <div className="text-6xl">🎉</div>
        <p className="text-xl font-bold text-success">ما شاء الله!</p>
        <p className="text-sm text-masjid-dark/70">ماما أكدت إنك خلصت الخطوة دي</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-6xl mb-2">{icon}</div>
        <h2 className="text-xl font-bold text-masjid-dark">{step.step_title}</h2>
        {step.step_description && (
          <p className="text-sm text-masjid-dark/60 mt-1">{step.step_description}</p>
        )}
      </div>

      <StepVideo url={step.video_url} />

      <div className="bg-gold/10 rounded-3xl p-5 border border-gold/30">
        <p className="text-masjid-dark leading-relaxed">{prompt}</p>
      </div>

      {!readyForMom ? (
        <button
          onClick={() => setReadyForMom(true)}
          className="w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95"
        >
          خلصت — نادي ماما 📞
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-5 shadow-soft border-2 border-masjid">
            <p className="text-center font-bold text-masjid-dark mb-2">
              👋 يا ماما، اتفرجي على طفلك بيعمل الخطوة دي
            </p>
            <p className="text-center text-sm text-masjid-dark/70">
              لو خلص صح، ادخلي كلمة السر علشان تأكدي ✓
            </p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-gold text-white font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95"
          >
            🔐 ماما تأكد بكلمة السر
          </button>
          <button
            onClick={() => setReadyForMom(false)}
            className="w-full text-xs text-masjid-dark/60 py-2"
          >
            عايز أتدرب أكتر
          </button>
        </div>
      )}

      {showPasswordModal && (
        <MotherPasswordModal
          title="تأكيد ماما"
          message={`اضغطي تأكيد لو ${step.step_title} اتعمل صح`}
          onSuccess={onApproved}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
