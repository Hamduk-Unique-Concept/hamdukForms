'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FieldPalette from './field-palette';
import FormCanvas from './form-canvas';
import FieldOptionsEditor from './field-options-editor';
import ConditionalLogicEditor from './conditional-logic-editor';
import FieldValidationEditor from './field-validation-editor';

interface FormBuilderProps {
  formName: string;
  formType: string;
}

export default function FormBuilder({ formName, formType }: FormBuilderProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addField = (fieldType: string) => {
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      order: fields.length,
      options: [],
      validations: [],
      conditionalLogic: [],
      helpText: '',
      defaultValue: '',
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: any) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const reorderFields = (startIndex: number, endIndex: number) => {
    const result = Array.from(fields);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const reordered = result.map((f, i) => ({ ...f, order: i }));
    setFields(reordered);
  };

  const handleSaveForm = async () => {
    setIsSaving(true);
    try {
      console.log('Saving form:', { name: formName, type: formType, fields });
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex h-screen bg-gray-100">
      <FieldPalette onFieldAdd={addField} />
      <FormCanvas
        formName={formName}
        fields={fields}
        selectedFieldId={selectedFieldId}
        onFieldSelect={setSelectedFieldId}
        onFieldRemove={removeField}
        onFieldReorder={reorderFields}
      />

      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        {selectedField ? (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Field Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Placeholder</label>
                  <Input
                    value={selectedField.placeholder}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Help Text</label>
                  <Input
                    value={selectedField.helpText || ''}
                    onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                    placeholder="Optional helper text"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  />
                  <label htmlFor="required" className="text-sm font-medium">
                    Required Field
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <FieldOptionsEditor
                fieldId={selectedField.id}
                fieldType={selectedField.type}
                options={selectedField.options || []}
                onChange={(options) => updateField(selectedField.id, { options })}
              />
            </div>

            <div className="border-t pt-4">
              <FieldValidationEditor
                fieldId={selectedField.id}
                fieldType={selectedField.type}
                validations={selectedField.validations || []}
                onChange={(validations) => updateField(selectedField.id, { validations })}
              />
            </div>

            <div className="border-t pt-4">
              <ConditionalLogicEditor
                fieldId={selectedField.id}
                rules={selectedField.conditionalLogic || []}
                onChange={(conditionalLogic) => updateField(selectedField.id, { conditionalLogic })}
                availableFields={fields
                  .filter(f => f.id !== selectedField.id)
                  .map(f => ({ id: f.id, label: f.label }))}
              />
            </div>

            <div className="border-t pt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => removeField(selectedField.id)}
              >
                Delete Field
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Form Settings</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900 mb-1">Name</p>
                <p>{formName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Type</p>
                <p>{formType}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Fields</p>
                <p>{fields.length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t p-4 mt-auto">
          <Button
            onClick={handleSaveForm}
            disabled={isSaving || fields.length === 0}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>
    </div>
  );
}
