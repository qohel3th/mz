"use client";

import { useT } from "@/lib/i18n/useT";

/** Deliberately empty screen — title only. */
export function MapView() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-gild text-2xl">{t("map.title")}</h1>
      <p className="text-sm text-fg-faint">{t("map.soon")}</p>
    </div>
  );
}
