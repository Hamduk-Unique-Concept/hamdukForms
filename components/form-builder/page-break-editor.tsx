'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PageBreakEditorProps {
  fieldId: string;
  isPageBreak: boolean;
  pageTitle: string;
  pageDescription: string;
  onToggle: (isPageBreak: boolean) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export default function PageBreakEditor({
  fieldId,
  isPageBreak,
  pageTitle,
  pageDescription,
  onToggle,
  onTitleChange,
  onDescriptionChange,
}: PageBreakEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="page-break"
          checked={isPageBreak}
          onChange={(e) => onToggle(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="page-break" className="text-sm font-medium">
          Start new page after this field
        </label>
      </div>

      {isPageBreak && (
        <div className="space-y-3 p-3 bg-blue-50 rounded-md">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <Input
              value={pageTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g., Contact Information"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Page Description</label>
            <Input
              value={pageDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Optional description for this page"
            />
          </div>
        </div>
      )}
    </div>
  );
}
