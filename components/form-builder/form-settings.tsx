'use client';

interface FormSettingsProps {
  formName: string;
  formType: string;
  fieldCount: number;
}

export default function FormSettings({ formName, formType, fieldCount }: FormSettingsProps) {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Form Settings</h3>
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-900 mb-1">Form Name</p>
          <p>{formName}</p>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-1">Form Type</p>
          <p>{formType}</p>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-1">Fields</p>
          <p>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}
