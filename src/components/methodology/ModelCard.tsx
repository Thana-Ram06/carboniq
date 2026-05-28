"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Shield, BarChart2, Leaf, Brain } from "lucide-react";

interface ModelSection {
  title: string;
  content: string;
  formula?: string;
  references?: string[];
}

interface ModelCardProps {
  id?: string;
  name: string;
  category: "ndvi" | "carbon" | "ai" | "mrv";
  version: string;
  description: string;
  dataSource: string;
  uncertainty: string;
  sections: ModelSection[];
}

const CATEGORY_CONFIG = {
  ndvi:   { icon: BarChart2, color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  carbon: { icon: Leaf,      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  ai:     { icon: Brain,     color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  mrv:    { icon: Shield,    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ModelCard({ id: _id, name, category, version, description, dataSource, uncertainty, sections }: ModelCardProps) {
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const cfg = CATEGORY_CONFIG[category];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="mt-0.5 rounded-lg bg-white/5 p-2 shrink-0">
          <Icon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{name}</p>
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-slate-400">v{version}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{description}</p>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span>Source: {dataSource}</span>
            <span>Uncertainty: ±{uncertainty}</span>
          </div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5">
          {sections.map((section) => {
            const isExpanded = expandedSection === section.title;
            return (
              <div key={section.title} className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/3 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-200">{section.title}</p>
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{section.content}</p>
                    {section.formula && (
                      <div className="rounded-lg bg-slate-900/60 border border-white/5 px-3 py-2">
                        <p className="text-xs text-slate-400 mb-1">Formula</p>
                        <code className="text-xs text-emerald-300 font-mono">{section.formula}</code>
                      </div>
                    )}
                    {section.references && section.references.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">References</p>
                        {section.references.map((ref) => (
                          <p key={ref} className="text-xs text-blue-400 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {ref}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
