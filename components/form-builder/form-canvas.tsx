'use client';

import { Input } from '@/components/ui/input';

interface FormCanvasProps {
  formName: string;
  fields: any[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldRemove: (fieldId: string) => void;
  onFieldReorder: (startIndex: number, endIndex: number) => void;
}

export default function FormCanvas({
  formName,
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldRemove,
}: FormCanvasProps) {
  const renderField = (field: any) => {
    const isSelected = field.id === selectedFieldId;
    const baseClass = `p-4 border rounded-lg transition-all cursor-pointer ${
      isSelected
        ? 'border-primary bg-primary/5 shadow-md'
        : 'border-gray-200 hover:border-gray-300 bg-white'
    }`;

    const fieldProps = {
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type={field.type} {...fieldProps} disabled />
          </div>
        );
      case 'textarea':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...fieldProps}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={4}
            />
          </div>
        );
      case 'select':
      case 'multiselect':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Select an option...</option>
            </select>
          </div>
        );
      case 'radio':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="radio" disabled />
                <span className="text-sm">Option 1</span>
              </div>
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <input type="checkbox" disabled />
              <span className="text-sm">Option 1</span>
            </div>
          </div>
        );
      case 'date':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="date" disabled />
          </div>
        );
      case 'time':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="time" disabled />
          </div>
        );
      case 'file':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="file" disabled />
          </div>
        );
      case 'rating':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="text-2xl cursor-pointer">⭐</span>
              ))}
            </div>
          </div>
        );
      case 'nps':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button key={i} className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled" disabled>{i}</button>
              ))}
            </div>
          </div>
        );
      case 'scale':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} className="flex items-center gap-1">
                  <input type="radio" disabled />
                  <span className="text-sm">{n}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'slider':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input type="range" disabled className="w-full" />
          </div>
        );
      case 'datetime':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
              <Input type="date" disabled />
              <Input type="time" disabled />
            </div>
          </div>
        );
      case 'daterange':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2 items-center">
              <Input type="date" disabled />
              <span className="text-sm">to</span>
              <Input type="date" disabled />
            </div>
          </div>
        );
      case 'url':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="url" placeholder="https://..." disabled />
          </div>
        );
      case 'password':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="password" disabled />
          </div>
        );
      case 'country':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Select a country...</option>
            </select>
          </div>
        );
      case 'currency':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>NGN</option>
            </select>
          </div>
        );
      case 'toggle':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <input type="checkbox" disabled />
              <span className="text-sm">Yes</span>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">📸 Click to upload image</p>
            </div>
          </div>
        );
      case 'video':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">🎬 Click to upload video</p>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">🎵 Click to upload audio</p>
            </div>
          </div>
        );
      case 'signature':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 h-32 bg-gray-50 flex items-center justify-center">
              <span className="text-gray-400 text-sm">✍️ Signature pad</span>
            </div>
          </div>
        );
      case 'draw':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 h-48 bg-white flex items-center justify-center">
              <span className="text-gray-400 text-sm">🎨 Drawing canvas</span>
            </div>
          </div>
        );
      case 'address':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input placeholder="Start typing address..." disabled />
          </div>
        );
      case 'location':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
              <span className="text-gray-500">📍 Map location picker</span>
            </div>
          </div>
        );
      case 'qrcode':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 flex justify-center">
              <span className="text-4xl">📱</span>
            </div>
          </div>
        );
      case 'barcode':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 font-mono text-center text-sm">
              <span>|||||||||||||||</span>
            </div>
          </div>
        );
      case 'otp':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Input key={i} maxLength={1} className="w-12 h-12 text-center text-lg" disabled />
              ))}
            </div>
          </div>
        );
      case 'ranking':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm">⬍ Option 1</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm">⬍ Option 2</span>
              </div>
            </div>
          </div>
        );
      case 'matrix':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <table className="w-full border border-gray-300 text-sm">
              <tr className="bg-gray-100">
                <td className="p-2 border">Option</td>
                <td className="p-2 border text-center">Yes</td>
                <td className="p-2 border text-center">No</td>
              </tr>
              <tr>
                <td className="p-2 border">Row 1</td>
                <td className="p-2 border"><input type="radio" disabled /></td>
                <td className="p-2 border"><input type="radio" disabled /></td>
              </tr>
            </table>
          </div>
        );
      case 'repeat':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">Group/Repeat container</p>
              <button className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" disabled>
                + Add Row
              </button>
            </div>
          </div>
        );
      case 'hidden':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              {field.label}
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">Hidden</span>
            </label>
            <p className="text-xs text-gray-500">This field is not visible to users</p>
          </div>
        );
      case 'calculated':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              {field.label}
              <span className="text-xs bg-blue-200 px-2 py-1 rounded">Calculated</span>
            </label>
            <Input value="0" disabled className="bg-gray-100" />
          </div>
        );
      case 'statement':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-gray-700">{field.label || 'Information text block'}</p>
            </div>
          </div>
        );
      case 'divider':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <div className="border-t-2 border-gray-300"></div>
          </div>
        );
      case 'pagebreak':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-center">
              <p className="text-sm font-medium text-yellow-800">📖 Page Break</p>
              <p className="text-xs text-yellow-700">Next section starts on new page</p>
            </div>
          </div>
        );
      case 'embed':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Embed block (video, map, etc.)</span>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Amount</span>
                <span className="text-lg">₦</span>
              </div>
              <Input type="number" placeholder="0.00" disabled className="mb-2" />
              <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>Paystack</option>
                <option>Flutterwave</option>
                <option>PayPal</option>
              </select>
            </div>
          </div>
        );
      case 'product':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <input type="radio" disabled />
                <span className="text-sm">Product 1 - ₦5,000</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <input type="radio" disabled />
                <span className="text-sm">Product 2 - ₦10,000</span>
              </div>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <table className="w-full border border-gray-300 text-sm">
              <tbody>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left font-medium">Plan</th>
                  <th className="p-2 text-center">Price</th>
                  <th className="p-2 text-center">Select</th>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Starter</td>
                  <td className="p-2 text-center">₦2,000</td>
                  <td className="p-2 text-center"><input type="radio" disabled /></td>
                </tr>
                <tr>
                  <td className="p-2">Pro</td>
                  <td className="p-2 text-center">₦5,000</td>
                  <td className="p-2 text-center"><input type="radio" disabled /></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'booking':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <Input type="date" disabled />
              <Input type="time" disabled placeholder="Select time" />
              <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>Select duration...</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>
        );
      case 'ticket':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="radio" disabled />
                <span className="text-sm">Early Bird - ₦3,000</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="radio" disabled />
                <span className="text-sm">Regular - ₦5,000</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="radio" disabled />
                <span className="text-sm">VIP - ₦10,000</span>
              </div>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Item 1</p>
                  <p className="text-xs text-gray-500">Stock: 10 available</p>
                </div>
                <Input type="number" min="0" max="10" disabled className="w-16" />
              </div>
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="radio" disabled />
                <div className="text-sm">
                  <p className="font-medium">Monthly - ₦1,000/month</p>
                  <p className="text-xs text-gray-600">Cancel anytime</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="radio" disabled />
                <div className="text-sm">
                  <p className="font-medium">Yearly - ₦10,000/year</p>
                  <p className="text-xs text-gray-600">Save 20%</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bundle':
        return (
          <div key={field.id} className={baseClass} onClick={() => onFieldSelect(field.id)}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg">
                <input type="checkbox" disabled />
                <div className="text-sm flex-1">
                  <p className="font-medium">Bundle Package</p>
                  <p className="text-xs text-gray-600">Item 1 + Item 2 + Item 3</p>
                  <p className="font-semibold mt-1">₦15,000</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{formName}</h1>
          <p className="text-gray-600">Add fields to your form using the left panel</p>
        </div>

        {/* Form Fields */}
        {fields.length > 0 ? (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="relative group">
                {renderField(field)}
                {selectedFieldId === field.id && (
                  <button
                    onClick={() => onFieldRemove(field.id)}
                    className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No fields yet. Add one from the left panel to get started.</p>
            <p className="text-sm text-gray-500">Click on field types to add them to your form</p>
          </div>
        )}
      </div>
    </div>
  );
}
