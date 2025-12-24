import { Visitation } from "@/lib/types";
import { useMemo, useState } from "react";
import { TrashIcon, MessageSquarePlusIcon } from "lucide-react";

export default function VisitationEditor({ visitations, onChange }: { visitations: Visitation[]; onChange: (v: Visitation[]) => void }) {
  // No global error state; invalid rows are highlighted inline

  // Helper utilities

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateRow(idx: number, patch: Partial<Visitation>) {
    const next = visitations.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function addToday() {
    const d = todayStr();
    const hasTodayEmpty = visitations.some((v) => v.date === d && (v.text ?? '') === '');
    const next = visitations.slice();
    if (hasTodayEmpty) {
      // Add an empty-date row and highlight it until user enters a date
      next.push({ date: '', text: '' });
    } else {
      next.push({ date: d, text: '' });
    }
    onChange(next);
  }

  function remove(idx: number) {
    const next = visitations.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  const sortedItems = useMemo(() => visitations
    .map((v, idx) => ({ v, idx }))
    .sort((a, b) => b.v.date.localeCompare(a.v.date)), [visitations]);

  // Track which rows have notes revealed when empty
  const [visibleNotes, setVisibleNotes] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-3">
      <div className="max-h-75 overflow-auto pr-1 visitation-scroll">
        <ul className="space-y-3">
          {sortedItems.map(({ v, idx }, i) => {
            const invalid = !(v.date ?? '').trim();
            const notesRows = Math.min(3, Math.max(1, (v.text ?? '').split('\n').length));
            const hasText = !!(v.text ?? '').trim();
            const shouldShowNotes = hasText || visibleNotes.has(idx);
            return (
              <li key={idx}>
                <div className={`relative rounded border ${invalid ? 'border-red-400' : 'border-white/20 hover:border-white/60'} bg-black/40 px-2 py-2`}>
                  <div className="pr-12">
                    <input
                      type="date"
                      aria-label={`Visitation ${i + 1} date`}
                      aria-invalid={invalid}
                      className="w-full bg-transparent border-none outline-none text-white px-0 py-1"
                      value={v.date}
                      onChange={(e) => updateRow(idx, { date: e.target.value })}
                    />
                  </div>
                  {shouldShowNotes && (
                    <div className="mt-1">
                      <textarea
                        placeholder="Notes"
                        aria-label={`Visitation ${i + 1} notes`}
                        className="w-full bg-transparent border-none outline-none text-white px-0 py-1"
                        rows={notesRows}
                        value={v.text}
                        onChange={(e) => updateRow(idx, { text: e.target.value })}
                      />
                    </div>
                  )}
                  {!shouldShowNotes && (
                    <button
                      type="button"
                      aria-label="Add notes"
                      title="Add notes"
                      className="absolute top-2.5 right-8 p-1 rounded hover:bg-white/10"
                      onClick={() => setVisibleNotes((prev) => {
                        const next = new Set(prev);
                        next.add(idx);
                        return next;
                      })}
                    >
                      <MessageSquarePlusIcon className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Remove"
                    title="Remove"
                    className="absolute text-red-400  top-2.5 right-2 p-1 rounded hover:bg-red-400/20"
                    onClick={() => remove(idx)}
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <button
          type="button"
          className="rounded px-3 py-1 border border-white/40 hover:border-white/70 disabled:opacity-60"
          onClick={addToday}
          title={'Add visitation (today)'}
        >
          Add visitation
        </button>
      </div>
    </div>
  );
}
