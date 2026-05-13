import { ShieldCheck, Phone, Clock, Star } from "lucide-react";

interface Props {
  hasPhone: boolean;
  responseRate: number | null;
  avgRating: string | null;
  totalReviews: number;
  lang: string;
}

export function TrustBadges({ hasPhone, responseRate, avgRating, totalReviews, lang }: Props) {
  const lt = lang === "lt";
  const badges = [];

  if (hasPhone) {
    badges.push({
      icon: Phone,
      label: lt ? "Telefonas patvirtintas" : "Phone verified",
      color: "text-green-600 bg-green-50 border-green-200",
    });
  }

  if (responseRate !== null && responseRate >= 0) {
    const level = responseRate >= 90 ? "green" : responseRate >= 60 ? "yellow" : "gray";
    badges.push({
      icon: Clock,
      label: `${lt ? "Atsako" : "Responds"} ${responseRate}%`,
      color: level === "green"
        ? "text-green-600 bg-green-50 border-green-200"
        : level === "yellow"
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-gray-500 bg-gray-50 border-gray-200",
    });
  }

  if (totalReviews > 0 && avgRating) {
    badges.push({
      icon: Star,
      label: `${avgRating} (${totalReviews} ${lt ? "atsiliepimai" : "reviews"})`,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    });
  }

  badges.push({
    icon: ShieldCheck,
    label: lt ? "El. paštas patvirtintas" : "Email verified",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map(({ icon: Icon, label, color }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
          <Icon size={12} />
          {label}
        </span>
      ))}
    </div>
  );
}
