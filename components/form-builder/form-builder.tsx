'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FieldPalette from './field-palette';
import FormCanvas from './form-canvas';
import FieldOptionsEditor from './field-options-editor';
import ConditionalLogicEditor from './conditional-logic-editor';
import FieldValidationEditor from './field-validation-editor';
import { Copy, Link as LinkIcon, Globe } from 'lucide-react';

interface FormBuilderProps {
  formName: string;
  formType: string;
  formId?: string;
}

export default function FormBuilder({ formName, formType, formId }: FormBuilderProps) {
  const router = useRouter();
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSaveForm = useCallback(async () => {
    if (!formName.trim() || fields.length === 0) {
      alert('Please provide a form name and at least one field');
      return;
    }

    setIsSaving(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const organizationId = localStorage.getItem('organizationId') || '';

      const response = await fetch('/api/forms/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          formId: formId || `form-${Date.now()}`,
          organizationId,
          title: formName,
          description: '',
          fields: fields.map((f, i) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            required: f.required,
            helpText: f.helpText,
            defaultValue: f.defaultValue,
            options: f.options,
            validations: f.validations,
            conditionalLogic: f.conditionalLogic,
            order: i,
          })),
          settings: { formType },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('Form saved successfully!');
      if (!formId) {
        router.push(`/dashboard/forms/${data.formId}`);
      }
    } catch (error: any) {
      console.error('Error saving form:', error);
      alert(error.message || 'Error saving form');
    } finally {
      setIsSaving(false);
    }
  }, [formName, fields, formId, router]);

  const handlePublishForm = useCallback(async () => {
    if (!formName.trim() || fields.length === 0) {
      alert('Please save the form first');
      return;
    }

    setIsPublishing(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';

      // First save the form
      await handleSaveForm();

      // Then publish it
      const response = await fetch('/api/forms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          formId: formId || `form-${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsPublished(true);
      setPublishedUrl(data.publishLink);
      alert('Form published successfully!');
    } catch (error: any) {
      console.error('Error publishing form:', error);
      alert(error.message || 'Error publishing form');
    } finally {
      setIsPublishing(false);
    }
  }, [formName, fields, formId, handleSaveForm]);

  const handleUnpublishForm = useCallback(async () => {
    setIsPublishing(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';

      const response = await fetch('/api/forms/publish', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          formId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsPublished(false);
      setPublishedUrl(null);
      alert('Form unpublished successfully!');
    } catch (error: any) {
      console.error('Error unpublishing form:', error);
      alert(error.message || 'Error unpublishing form');
    } finally {
      setIsPublishing(false);
    }
  }, [formId]);

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

        <div className="border-t p-4 mt-auto space-y-3">
          {isPublished && publishedUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-medium text-green-800 mb-2">Published Form</p>
              <div className="flex items-center gap-2 bg-white rounded p-2 break-all text-xs">
                <Globe className="w-4 h-4 flex-shrink-0 text-green-600" />
                <span>{publishedUrl}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publishedUrl);
                  alert('Link copied to clipboard!');
                }}
                className="mt-2 text-xs text-green-700 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy Link
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleSaveForm}
              disabled={isSaving || isPublishing || fields.length === 0}
              variant={isPublished ? 'outline' : 'default'}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            {!isPublished ? (
              <Button
                onClick={handlePublishForm}
                disabled={isPublishing || isSaving || fields.length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isPublishing ? 'Publishing...' : 'Publish Form'}
              </Button>
            ) : (
              <Button
                onClick={handleUnpublishForm}
                disabled={isPublishing}
                variant="destructive"
                className="w-full"
              >
                {isPublishing ? 'Unpublishing...' : 'Unpublish Form'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
