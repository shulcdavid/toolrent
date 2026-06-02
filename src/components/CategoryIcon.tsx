import {
  Wrench, Leaf, HardHat, Droplets, Car, Package,
  Ruler, Paintbrush, Pipette, Recycle,
  Hammer, Settings, Wind, Gauge, Axe,
  Scissors, Pin, Flame, Home, Crosshair,
  Shield, Gem,
} from "lucide-react";

const icons: Record<string, React.ElementType> = {
  // Original 10
  power: Wrench,
  garden: Leaf,
  construction: HardHat,
  measuring: Ruler,
  painting: Paintbrush,
  cleaning: Droplets,
  plumbing: Pipette,
  automotive: Car,
  leftovers: Recycle,
  other: Package,
  // New 12
  hand: Hammer,
  mechanical: Settings,
  pneumatic: Wind,
  hydraulic: Gauge,
  woodworking: Axe,
  metalworking: Scissors,
  fastening: Pin,
  welding: Flame,
  roofing: Home,
  precision: Crosshair,
  safety: Shield,
  jewelry: Gem,
};

interface Props {
  category: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 22, className }: Props) {
  const Icon = icons[category] ?? Package;
  return <Icon size={size} className={className} />;
}
