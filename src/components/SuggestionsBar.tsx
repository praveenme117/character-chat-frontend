'use client';

type SuggestionsBarProps = {
  disabled?: boolean;
  onSelect: (text: string) => void;
};

const SUGGESTIONS = [
  'Tell me a fun fact',
  'What should I watch today?',
  'Help me plan a weekend trip',
  'Teach me a Japanese greeting',
];

export default function SuggestionsBar({ disabled, onSelect }: SuggestionsBarProps) {
  return (
    <div className="glass-card p-2 flex gap-2 overflow-x-auto">
      {SUGGESTIONS.map((s, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(s)}
          disabled={disabled}
          className="whitespace-nowrap rounded-xl px-4 py-2 text-sm text-white/90 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {s}
        </button>
      ))}
    </div>
  );
}


