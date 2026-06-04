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
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    });
  }

  if (responseRate !== null && responseRate >= 0) {
    const level = responseRate >= 90 ? "green" : responseRate >= 60 ? "yellow" : "gray";
    badges.push({
      icon: Clock,
      label: `${lt ? "Atsako" : "Responds"} ${responseRate}%`,
      color: level === "green"
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : level === "yellow"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-[#20201f]/65 bg-[#eeece3] border-[#e5e2db]",
    });
  }

  if (totalReviews > 0 && avgRating) {
    badges.push({
      icon: Star,
      label: `${avgRating} (${totalReviews} ${lt ? "atsiliepimai" : "reviews"})`,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    });
  }

  badges.push({
    icon: ShieldCheck,
    label: lt ? "El. paštas patvirtintas" : "Email verified",
    color: "text-[#20201f]/70 bg-[#eeece3] border-[#e5e2db]",
  });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map(({ icon: Icon, label, color }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
          <Icon size={11} />
          {label}
        </span>
      ))}
    </div>
  );
}
