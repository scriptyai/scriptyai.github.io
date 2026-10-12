import { useState } from 'react';
import { X, Search, Terminal, ArrowRight, Check } from 'lucide-react';
import { LUA_TEMPLATES } from '../data/templates';
import { ScriptTemplate, LuaTarget } from '../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ScriptTemplate) => void;
  currentTarget: LuaTarget;
}

export function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTarget,
}: TemplateModalProps) {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = LUA_TEMPLATES.filter((tmpl) => {
    const matchesCategory =
      selectedFilter === 'all' || tmpl.category.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesSearch =
      tmpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-rose-400" />
              Executor (UNC) Script Presets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Self-contained, production-grade Executor scripts with getgenv cleanup and UNC support
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scripts by name or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Presets' },
              { id: 'ui', label: 'Executor UI' },
              { id: 'utility', label: 'Utilities' },
              { id: 'performance', label: 'Performance' },
              { id: 'visuals', label: 'ESP Visuals' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedFilter === f.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No presets found matching your search.
            </div>
          ) : (
            filtered.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-rose-500/40 hover:bg-slate-900/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/50 font-mono">
                      {tmpl.category}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tmpl.scriptType}
                    </span>
                    <h3 className="font-semibold text-sm text-slate-100 group-hover:text-rose-300 transition-colors">
                      {tmpl.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectTemplate(tmpl);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Load Preset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
