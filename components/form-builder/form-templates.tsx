'use client';

import { useState } from 'react';
import { Search, Download, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormTemplatesProps {
  onSelectTemplate: (template: any) => void;
}

export default function FormTemplates({ onSelectTemplate }: FormTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const templates = [
    {
      id: 'contact-form',
      name: 'Contact Form',
      category: 'business',
      description: 'Simple contact/inquiry form with name, email, subject, and message',
      preview: '✉️',
      rating: 4.8,
      uses: 1250,
      fields: ['text', 'email', 'textarea'],
    },
    {
      id: 'survey',
      name: 'Customer Survey',
      category: 'feedback',
      description: 'Gather customer feedback with rating scales and open-ended questions',
      preview: '📊',
      rating: 4.9,
      uses: 2103,
      fields: ['rating', 'nps', 'textarea', 'multiselect'],
    },
    {
      id: 'event-registration',
      name: 'Event Registration',
      category: 'events',
      description: 'Register attendees with ticket selection, payment, and QR code generation',
      preview: '🎟️',
      rating: 4.7,
      uses: 856,
      fields: ['text', 'email', 'select', 'date', 'payment'],
    },
    {
      id: 'job-application',
      name: 'Job Application',
      category: 'recruitment',
      description: 'Collect job applications with resume upload and custom questions',
      preview: '💼',
      rating: 4.6,
      uses: 734,
      fields: ['text', 'email', 'file', 'textarea', 'select'],
    },
    {
      id: 'appointment-booking',
      name: 'Appointment Booking',
      category: 'scheduling',
      description: 'Schedule appointments with date/time picker and availability management',
      preview: '📅',
      rating: 4.9,
      uses: 1543,
      fields: ['text', 'email', 'date', 'time', 'select'],
    },
    {
      id: 'feedback-form',
      name: 'Feedback Form',
      category: 'feedback',
      description: 'Collect product/service feedback with sentiment tracking',
      preview: '💬',
      rating: 4.7,
      uses: 987,
      fields: ['rating', 'textarea', 'checkbox'],
    },
    {
      id: 'quiz',
      name: 'Quiz/Assessment',
      category: 'education',
      description: 'Create quizzes with scoring, certificates, and branching logic',
      preview: '📝',
      rating: 4.8,
      uses: 1265,
      fields: ['radio', 'checkbox', 'text', 'calculated'],
    },
    {
      id: 'donation-form',
      name: 'Donation Form',
      category: 'fundraising',
      description: 'Collect donations with multiple payment options and receipt generation',
      preview: '❤️',
      rating: 4.9,
      uses: 543,
      fields: ['number', 'select', 'payment', 'email'],
    },
    {
      id: 'order-form',
      name: 'Order Form',
      category: 'ecommerce',
      description: 'Take customer orders with product selection and payment',
      preview: '🛒',
      rating: 4.7,
      uses: 1876,
      fields: ['multiselect', 'number', 'payment', 'address'],
    },
    {
      id: 'hr-onboarding',
      name: 'Employee Onboarding',
      category: 'hr',
      description: 'New employee forms with background info, emergency contacts, paperwork',
      preview: '👥',
      rating: 4.6,
      uses: 421,
      fields: ['text', 'date', 'select', 'checkbox', 'signature'],
    },
    {
      id: 'medical-intake',
      name: 'Medical Intake',
      category: 'healthcare',
      description: 'Patient intake form with medical history and consent (HIPAA friendly)',
      preview: '⚕️',
      rating: 4.8,
      uses: 612,
      fields: ['text', 'date', 'checkbox', 'textarea', 'toggle'],
    },
    {
      id: 'course-enrollment',
      name: 'Course Enrollment',
      category: 'education',
      description: 'Enroll students with course selection, payment, and schedule info',
      preview: '🎓',
      rating: 4.7,
      uses: 834,
      fields: ['select', 'email', 'date', 'payment'],
    },
    {
      id: 'vendor-registration',
      name: 'Vendor Registration',
      category: 'business',
      description: 'Register vendors with business info, documents, and bank details',
      preview: '🏢',
      rating: 4.6,
      uses: 356,
      fields: ['text', 'email', 'file', 'select'],
    },
    {
      id: 'nps-survey',
      name: 'NPS Survey',
      category: 'feedback',
      description: 'Net Promoter Score survey with follow-up questions',
      preview: '📈',
      rating: 4.9,
      uses: 1456,
      fields: ['nps', 'textarea', 'radio'],
    },
    {
      id: 'real-estate-inquiry',
      name: 'Real Estate Inquiry',
      category: 'realestate',
      description: 'Property inquiry form with location, budget, and preferences',
      preview: '🏠',
      rating: 4.7,
      uses: 289,
      fields: ['text', 'number', 'select', 'location'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'business', label: 'Business' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'events', label: 'Events' },
    { id: 'recruitment', label: 'Recruitment' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'education', label: 'Education' },
    { id: 'fundraising', label: 'Fundraising' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'hr', label: 'HR' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'realestate', label: 'Real Estate' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg mb-6">
        <h2 className="text-3xl font-bold mb-2">Form Templates Library</h2>
        <p className="text-blue-100">Start with a pre-built template and customize to your needs</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                filterCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Preview */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center h-32">
              <span className="text-6xl">{template.preview}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg">{template.name}</h3>
                <button
                  onClick={() => toggleFavorite(template.id)}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    favorites.includes(template.id) ? 'text-yellow-400' : 'text-gray-400'
                  }`}
                >
                  <Star className={`w-5 h-5 ${favorites.includes(template.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <p className="text-sm text-gray-600">{template.description}</p>

              {/* Stats */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>⭐ {template.rating}</span>
                <span>📊 {template.uses.toLocaleString()} uses</span>
              </div>

              {/* Fields */}
              <div className="flex flex-wrap gap-1">
                {template.fields.slice(0, 3).map((field, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {field}
                  </span>
                ))}
                {template.fields.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{template.fields.length - 3}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600"
                  onClick={() => onSelectTemplate(template)}
                >
                  <Download className="w-4 h-4" />
                  Use
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No templates found matching your search.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 font-medium mb-2">Don't see what you need?</p>
        <p className="text-gray-600 mb-4">Create your own template from scratch or browse the full marketplace.</p>
        <Button className="gap-2">
          Browse Full Marketplace →
        </Button>
      </div>
    </div>
  );
}
