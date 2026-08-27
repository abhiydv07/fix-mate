"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface SubCategory {
  name: string;
  icon: string;
  href: string;
}

interface CategoryData {
  name: string;
  icon: string;
  sections: { title: string; items: SubCategory[] }[];
}

const CATEGORY_DATA: Record<string, CategoryData> = {
  plumbing: {
    name: "Plumbing",
    icon: "🔧",
    sections: [
      {
        title: "Pipe & Leak",
        items: [
          { name: "Tap Leak Repair", icon: "🚰", href: "/services/plumbing" },
          { name: "Pipe Burst Fix", icon: "🔧", href: "/services/plumbing" },
          { name: "Drainage Unblocking", icon: "🚿", href: "/services/plumbing" },
          { name: "Toilet Repair", icon: "🚽", href: "/services/plumbing" },
        ],
      },
      {
        title: "Installation",
        items: [
          { name: "Geyser Installation", icon: "♨️", href: "/services/plumbing" },
          { name: "Water Tank Install", icon: "🪣", href: "/services/plumbing" },
          { name: "Piping Work", icon: "🔩", href: "/services/plumbing" },
          { name: "Water Purifier", icon: "💧", href: "/services/plumbing" },
        ],
      },
    ],
  },
  electrical: {
    name: "Electrical",
    icon: "⚡",
    sections: [
      {
        title: "Wiring & Switches",
        items: [
          { name: "Switch Board Repair", icon: "🔌", href: "/services/electrical" },
          { name: "Wire Replacement", icon: "⚡", href: "/services/electrical" },
          { name: "MCB/Trip Fix", icon: "🛡️", href: "/services/electrical" },
          { name: "Earthing Work", icon: "🌿", href: "/services/electrical" },
        ],
      },
      {
        title: "Fixtures & Fans",
        items: [
          { name: "Ceiling Fan Install", icon: "🌀", href: "/services/electrical" },
          { name: "Light Installation", icon: "💡", href: "/services/electrical" },
          { name: "LED Panel Fitting", icon: "🔲", href: "/services/electrical" },
          { name: "Inverter Setup", icon: "🔋", href: "/services/electrical" },
        ],
      },
    ],
  },
  cleaning: {
    name: "Cleaning & Pest",
    icon: "🧹",
    sections: [
      {
        title: "Home Cleaning",
        items: [
          { name: "Deep Cleaning", icon: "🏠", href: "/services/cleaning" },
          { name: "Sofa Cleaning", icon: "🛋️", href: "/services/cleaning" },
          { name: "Bathroom Deep Clean", icon: "🛁", href: "/services/cleaning" },
          { name: "Kitchen Cleaning", icon: "🍳", href: "/services/cleaning" },
        ],
      },
      {
        title: "Specialized",
        items: [
          { name: "Carpet Cleaning", icon: "🟫", href: "/services/cleaning" },
          { name: "Window Cleaning", icon: "🪟", href: "/services/cleaning" },
          { name: "Pest Control", icon: "🐛", href: "/services/cleaning" },
          { name: "Tank Cleaning", icon: "🪣", href: "/services/cleaning" },
        ],
      },
    ],
  },
  appliances: {
    name: "AC & Appliance Repair",
    icon: "🔌",
    sections: [
      {
        title: "Large Appliances",
        items: [
          { name: "AC Repair & Service", icon: "❄️", href: "/services/appliances" },
          { name: "Washing Machine", icon: "👕", href: "/services/appliances" },
          { name: "Refrigerator Repair", icon: "🧊", href: "/services/appliances" },
          { name: "Television Repair", icon: "📺", href: "/services/appliances" },
        ],
      },
      {
        title: "Other Appliances",
        items: [
          { name: "Microwave Repair", icon: "📡", href: "/services/appliances" },
          { name: "RO/Water Purifier", icon: "💧", href: "/services/appliances" },
          { name: "Geyser Repair", icon: "♨️", href: "/services/appliances" },
          { name: "Air Cooler", icon: "🌬️", href: "/services/appliances" },
        ],
      },
    ],
  },
  painting: {
    name: "Home Painting",
    icon: "🎨",
    sections: [
      {
        title: "Interior",
        items: [
          { name: "Wall Painting", icon: "🎨", href: "/services/painting" },
          { name: "Texture Work", icon: "🖌️", href: "/services/painting" },
          { name: "Waterproofing", icon: "💧", href: "/services/painting" },
          { name: "Wood Polishing", icon: "🪵", href: "/services/painting" },
        ],
      },
      {
        title: "Exterior",
        items: [
          { name: "Exterior Painting", icon: "🏡", href: "/services/painting" },
          { name: "Stain Removal", icon: "✨", href: "/services/painting" },
          { name: "Wallpaper Install", icon: "📋", href: "/services/painting" },
          { name: "Color Consultation", icon: "🎯", href: "/services/painting" },
        ],
      },
    ],
  },
  carpentry: {
    name: "Carpentry & Furniture",
    icon: "🪚",
    sections: [
      {
        title: "Furniture",
        items: [
          { name: "Furniture Assembly", icon: "🛏️", href: "/services/carpentry" },
          { name: "Door Repair", icon: "🚪", href: "/services/carpentry" },
          { name: "Window Repair", icon: "🪟", href: "/services/carpentry" },
          { name: "Cupboard Fixing", icon: "🗄️", href: "/services/carpentry" },
        ],
      },
      {
        title: "Installation",
        items: [
          { name: "Shelf Mounting", icon: "📚", href: "/services/carpentry" },
          { name: "Curtain Rod Install", icon: "🎪", href: "/services/carpentry" },
          { name: "Lock Replacement", icon: "🔐", href: "/services/carpentry" },
          { name: "Custom Woodwork", icon: "🪵", href: "/services/carpentry" },
        ],
      },
    ],
  },
};

interface CategoryModalProps {
  categoryKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({ categoryKey, isOpen, onClose }: CategoryModalProps) {
  const category = CATEGORY_DATA[categoryKey];
  if (!category || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{category.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {category.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">{section.title}</h3>
              <div className="grid grid-cols-4 gap-3">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
