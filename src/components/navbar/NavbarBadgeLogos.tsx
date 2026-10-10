import Image from "next/image";
import type { NavbarBadgeLogo } from "@/types";

interface NavbarBadgeLogosProps {
  logos: NavbarBadgeLogo[];
}

/**
 * Renders admin-uploaded badge logos in the left panel.
 * Shows nothing when the logos array is empty — no default accreditation
 * badges are ever rendered without admin action.
 */
export function NavbarBadgeLogos({ logos }: NavbarBadgeLogosProps) {
  const sorted = [...logos].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center h-full">
      {sorted.map((logo, idx) => (
        <div
          key={logo.id}
          className="flex items-center justify-center px-2.5 h-10"
          style={idx > 0 ? { borderLeft: "1px solid #BDBDBD" } : undefined}
          title={logo.alt}
        >
          <div className="relative h-8 w-8 flex items-center justify-center overflow-hidden">
            <Image
              src={logo.url}
              alt={logo.alt || "Badge logo"}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
