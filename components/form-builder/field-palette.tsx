'use client';

interface FieldPaletteProps {
  onFieldAdd: (fieldType: string) => void;
}

export default function FieldPalette({ onFieldAdd }: FieldPaletteProps) {
  const basicFields = [
    { type: 'text', label: 'Text', icon: 'A' },
    { type: 'email', label: 'Email', icon: '✉️' },
    { type: 'phone', label: 'Phone', icon: '📞' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'textarea', label: 'Textarea', icon: '📝' },
  ];

  const selectionFields = [
    { type: 'select', label: 'Dropdown', icon: '▼' },
    { type: 'radio', label: 'Radio', icon: '◯' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'multiselect', label: 'Multi-select', icon: '☒️' },
  ];

  const advancedFields = [
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'time', label: 'Time', icon: '⏰' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'rating', label: 'Rating', icon: '⭐' },
  ];

  const FieldButton = ({ type, label, icon }: any) => (
    <button
      onClick={() => onFieldAdd(type)}
      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );

  return (
    <div className="w-32 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-sm mb-3">Basic</h3>
      <div className="space-y-2 mb-6">
        {basicFields.map(field => (
          <FieldButton key={field.type} {...field} />
        ))}
      </div>

      <h3 className="font-semibold text-sm mb-3">Selection</h3>
      <div className="space-y-2 mb-6">
        {selectionFields.map(field => (
          <FieldButton key={field.type} {...field} />
        ))}
      </div>

      <h3 className="font-semibold text-sm mb-3">Advanced</h3>
      <div className="space-y-2">
        {advancedFields.map(field => (
          <FieldButton key={field.type} {...field} />
        ))}
      </div>
    </div>
  );
}
