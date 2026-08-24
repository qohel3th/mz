"use client";

import { Chip, type ChipProps } from "@/components/ui/Chip";
import { useT } from "@/lib/i18n/useT";
import type { Domain } from "@/lib/domain/types";

export function DomainChip({ domain, ...rest }: Omit<ChipProps, "children"> & { domain: Domain }) {
  const { t } = useT();
  return <Chip {...rest}>{t(`domains.${domain}`)}</Chip>;
}

export function useDomainLabels(): Record<Domain, string> {
  const { t } = useT();
  return {
    body: t("domains.body"),
    mind: t("domains.mind"),
    spirit: t("domains.spirit"),
    relationships: t("domains.relationships"),
    finance: t("domains.finance"),
    purpose: t("domains.purpose"),
  };
}
