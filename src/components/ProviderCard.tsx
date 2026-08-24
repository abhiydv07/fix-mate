"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, BadgeCheck, Briefcase } from "lucide-react";
import { StarRating } from "./StarRating";

export interface Provider {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  completed_jobs: number;
  experience_years: number;
  bio: string | null;
  verified: boolean;
  location: string | null;
  hourly_rate: number | null;
  specialties: string[];
}

interface ProviderCardProps {
  provider: Provider;
  serviceId?: string;
  compact?: boolean;
}

export function ProviderCard({ provider, serviceId, compact = false }: ProviderCardProps) {
  const initials = provider.name?.charAt(0).toUpperCase() || "P";

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-brand-500/30 transition-all">
        {provider.avatar_url ? (
          <Image src={provider.avatar_url} alt={provider.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">{initials}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate">{provider.name}</span>
            {provider.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          </div>
          <StarRating rating={provider.rating} count={provider.review_count} />
        </div>
        {serviceId && (
          <Link
            href={`/book/${serviceId}?provider=${provider.id}`}
            className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold transition-colors"
          >
            Book
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all space-y-3">
      <div className="flex items-start gap-3">
        {provider.avatar_url ? (
          <Image src={provider.avatar_url} alt={provider.name} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover border border-slate-700" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xl">{initials}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white truncate">{provider.name}</h3>
            {provider.verified && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <StarRating rating={provider.rating} count={provider.review_count} />
          {provider.location && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3" /> {provider.location}
            </div>
          )}
        </div>
        {provider.hourly_rate && (
          <div className="text-right">
            <span className="text-sm font-bold text-white">₹{provider.hourly_rate}</span>
            <span className="text-[9px] text-slate-400 block">/visit</span>
          </div>
        )}
      </div>

      {provider.bio && (
        <p className="text-[11px] text-slate-400 line-clamp-2">{provider.bio}</p>
      )}

      <div className="flex items-center gap-4 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-brand-400" />
          <strong className="text-slate-200">{provider.completed_jobs}</strong> jobs
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <strong className="text-slate-200">{provider.experience_years}yr</strong> exp
        </span>
      </div>

      {provider.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {provider.specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {s}
            </span>
          ))}
        </div>
      )}

      {serviceId && (
        <Link
          href={`/book/${serviceId}?provider=${provider.id}`}
          className="block w-full text-center py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
        >
          Book {provider.name.split(" ")[0]}
        </Link>
      )}
    </div>
  );
}
