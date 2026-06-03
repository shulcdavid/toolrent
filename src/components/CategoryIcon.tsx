import {
  Wrench, Leaf, HardHat, Droplets, Car, Package,
  Ruler, Paintbrush, Recycle,
  Hammer, Settings, Wind, Gauge, Axe,
  Pin, Flame, Home,
  Shield, Gem,
} from "lucide-react";

/* ── Custom SVG icons not available in lucide ── */

function FaucetIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {/* Pipe coming in from left */}
      <line x1="2" y1="10" x2="9" y2="10" />
      {/* Valve handle (vertical bar + horizontal bar) */}
      <line x1="7" y1="7" x2="7" y2="10" />
      <line x1="5" y1="7" x2="9" y2="7" />
      {/* Elbow body */}
      <path d="M9 10 Q14 10 14 15" />
      {/* Spout */}
      <line x1="14" y1="15" x2="14" y2="18" />
      {/* Spout tip */}
      <line x1="12" y1="18" x2="16" y2="18" />
      {/* Water drops */}
      <line x1="13" y1="20" x2="13" y2="22" />
      <line x1="15" y1="20" x2="15" y2="22" />
    </svg>
  );
}

function AnvilIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {/* Flat top working surface */}
      <rect x="3" y="6" width="18" height="5" rx="1" />
      {/* Horn pointing left */}
      <path d="M3 8 Q1 8 1 9.5 Q1 11 3 11" />
      {/* Body narrowing to base */}
      <path d="M7 11 L6 16 L18 16 L17 11" />
      {/* Base feet */}
      <line x1="6" y1="16" x2="5" y2="19" />
      <line x1="18" y1="16" x2="19" y2="19" />
      <line x1="4" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function CaliperIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {/* Main beam */}
      <line x1="3" y1="5" x2="21" y2="5" />
      {/* Scale marks on beam */}
      <line x1="7" y1="5" x2="7" y2="7" />
      <line x1="11" y1="5" x2="11" y2="7" />
      <line x1="15" y1="5" x2="15" y2="7" />
      {/* Fixed outer jaw (left) */}
      <line x1="3" y1="5" x2="3" y2="15" />
      <line x1="3" y1="15" x2="7" y2="15" />
      {/* Sliding outer jaw (right) */}
      <line x1="13" y1="5" x2="13" y2="15" />
      <line x1="13" y1="15" x2="17" y2="15" />
      {/* Fixed inner jaw */}
      <line x1="3" y1="9" x2="6" y2="9" />
      {/* Sliding inner jaw */}
      <line x1="13" y1="9" x2="10" y2="9" />
      {/* Depth probe */}
      <line x1="21" y1="5" x2="21" y2="12" />
    </svg>
  );
}

const lucideIcons: Record<string, React.ElementType> = {
  power: Wrench,
  garden: Leaf,
  construction: HardHat,
  measuring: Ruler,
  painting: Paintbrush,
  cleaning: Droplets,
  automotive: Car,
  leftovers: Recycle,
  other: Package,
  hand: Hammer,
  mechanical: Settings,
  pneumatic: Wind,
  hydraulic: Gauge,
  woodworking: Axe,
  fastening: Pin,
  welding: Flame,
  roofing: Home,
  safety: Shield,
  jewelry: Gem,
};

const customIcons: Record<string, React.FC<{ size: number; className?: string }>> = {
  plumbing: FaucetIcon,
  metalworking: AnvilIcon,
  precision: CaliperIcon,
};

interface Props {
  category: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 22, className }: Props) {
  const Custom = customIcons[category];
  if (Custom) return <Custom size={size} className={className} />;
  const Icon = lucideIcons[category] ?? Package;
  return <Icon size={size} className={className} />;
}
