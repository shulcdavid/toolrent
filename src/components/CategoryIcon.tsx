import { Wrench, Leaf, HardHat, Droplets, Car, Package } from "lucide-react";

const icons: Record<string, React.ElementType> = {
  power: Wrench,
  garden: Leaf,
  construction: HardHat,
  cleaning: Droplets,
  automotive: Car,
  other: Package,
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
