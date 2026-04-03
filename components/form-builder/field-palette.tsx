'use client';

interface FieldPaletteProps {
  onFieldAdd: (fieldType: string) => void;
}

export default function FieldPalette({ onFieldAdd }: FieldPaletteProps) {
  const basicFields = [
    { type: 'text', label: 'Short Text', icon: 'A' },
    { type: 'textarea', label: 'Long Text', icon: '📝' },
    { type: 'email', label: 'Email', icon: '✉️' },
    { type: 'phone', label: 'Phone', icon: '📞' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'url', label: 'URL/Website', icon: '🌐' },
    { type: 'password', label: 'Password', icon: '🔒' },
  ];

  const selectionFields = [
    { type: 'select', label: 'Dropdown', icon: '▼' },
    { type: 'radio', label: 'Radio', icon: '◯' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'multiselect', label: 'Multi-select', icon: '☒️' },
    { type: 'country', label: 'Country Selector', icon: '🌍' },
    { type: 'currency', label: 'Currency', icon: '💱' },
    { type: 'toggle', label: 'Toggle/Switch', icon: '⚙️' },
  ];

  const dateTimeFields = [
    { type: 'date', label: 'Date Picker', icon: '📅' },
    { type: 'time', label: 'Time Picker', icon: '⏰' },
    { type: 'datetime', label: 'Date & Time', icon: '📆' },
    { type: 'daterange', label: 'Date Range', icon: '📊' },
  ];

  const ratingFields = [
    { type: 'rating', label: 'Star Rating', icon: '⭐' },
    { type: 'nps', label: 'NPS Score', icon: '📈' },
    { type: 'scale', label: 'Linear Scale', icon: '📏' },
    { type: 'slider', label: 'Slider', icon: '🎚️' },
  ];

  const mediaFields = [
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'image', label: 'Image Upload', icon: '🖼️' },
    { type: 'video', label: 'Video Upload', icon: '🎬' },
    { type: 'audio', label: 'Audio Upload', icon: '🎵' },
    { type: 'signature', label: 'Signature', icon: '✍️' },
    { type: 'draw', label: 'Drawing Canvas', icon: '🎨' },
  ];

  const locationFields = [
    { type: 'address', label: 'Address', icon: '🏠' },
    { type: 'location', label: 'Location/Map', icon: '📍' },
  ];

  const advancedFields = [
    { type: 'qrcode', label: 'QR Code Scan', icon: '📱' },
    { type: 'barcode', label: 'Barcode Scan', icon: '📦' },
    { type: 'otp', label: 'OTP/Verification', icon: '🔐' },
    { type: 'ranking', label: 'Ranking', icon: '🏆' },
    { type: 'matrix', label: 'Matrix/Grid', icon: '⬜' },
    { type: 'repeat', label: 'Repeat/Group', icon: '🔁' },
    { type: 'hidden', label: 'Hidden Field', icon: '👻' },
    { type: 'calculated', label: 'Calculated', icon: '🧮' },
  ];

  const structureFields = [
    { type: 'statement', label: 'Statement Text', icon: '📄' },
    { type: 'divider', label: 'Divider', icon: '─' },
    { type: 'pagebreak', label: 'Page Break', icon: '📖' },
    { type: 'embed', label: 'Embed Block', icon: '🎯' },
  ];

  const FieldButton = ({ type, label, icon }: any) => (
    <button
      onClick={() => onFieldAdd(type)}
      className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 text-left text-sm transition-all"
      title={label}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium truncate">{label}</span>
    </button>
  );

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-3 overflow-y-auto max-h-screen space-y-4">
      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Basic Fields</h3>
        <div className="space-y-1">
          {basicFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Selection</h3>
        <div className="space-y-1">
          {selectionFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Date & Time</h3>
        <div className="space-y-1">
          {dateTimeFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Ratings & Scales</h3>
        <div className="space-y-1">
          {ratingFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Media</h3>
        <div className="space-y-1">
          {mediaFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Location</h3>
        <div className="space-y-1">
          {locationFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Advanced</h3>
        <div className="space-y-1">
          {advancedFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase text-gray-700 mb-2">Structure</h3>
        <div className="space-y-1">
          {structureFields.map(field => (
            <FieldButton key={field.type} {...field} />
          ))}
        </div>
      </div>
    </div>
  );
}
