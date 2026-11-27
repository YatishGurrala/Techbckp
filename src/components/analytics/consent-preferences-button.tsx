"use client";

import { isValidGaMeasurementId } from "@/lib/client-analytics";
import { openConsentPreferences } from "@/lib/consent";

type ConsentPreferencesButtonProps = {
  className?: string;
};

export function ConsentPreferencesButton({ className }: ConsentPreferencesButtonProps) {
  if (!isValidGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openConsentPreferences()}
      className={className}
    >
      Analytics Preferences
    </button>
  );
}

