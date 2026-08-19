import { Search, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Select Service",
      desc: "Pick from 50+ verified home repair, plumbing, electrical & cleaning services.",
      icon: Search,
      color: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    },
    {
      num: "02",
      title: "Professional Arrives",
      desc: "Background-checked local service partner arrives at your address within 30 minutes.",
      icon: UserCheck,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      num: "03",
      title: "Pay After Completion",
      desc: "Inspect the finished work and pay cash or UPI directly. Zero upfront charges.",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <section className="space-y-4 pt-4">
      <div className="text-center space-y-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-brand-400">
          Seamless Experience
        </span>
        <h2 className="text-lg font-extrabold text-slate-100">How Fix Mate Works</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Book trusted home services in 3 simple steps with zero advance fees
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-black text-slate-600">{step.num}</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
