import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { getSiteContent } from "@/lib/content-store";
import logoPondok from "@/assets/logo-pesantren.png";

/**
 * Logo resmi Pondok Pesantren Kesugihan Asasunnajaah Cilacap.
 * Bawaan: src/assets/logo-pesantren.png (latar transparan).
 * Bisa diganti dari dashboard admin (/dashboard → menu "Logo Pondok").
 */
export function LogoMark({ className }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    staleTime: 60_000,
  });
  const src = data?.logo || logoPondok;
  return (
    <img
      src={src}
      alt="Lambang Pondok Pesantren Kesugihan Asasunnajaah Cilacap"
      width={411}
      height={606}
      className={cn("w-auto select-none", className)}
      draggable={false}
    />
  );
}
