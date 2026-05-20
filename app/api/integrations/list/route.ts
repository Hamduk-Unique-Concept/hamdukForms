import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

const AVAILABLE_INTEGRATIONS = [
  // Cloud Storage & Documents
  { id: 'google_drive', name: 'Google Drive', category: 'Cloud Storage', icon: '📁', description: 'Connect Google Drive' },
  { id: 'onedrive', name: 'Microsoft OneDrive', category: 'Cloud Storage', icon: '☁️', description: 'Connect Microsoft OneDrive' },
  { id: 'dropbox', name: 'Dropbox', category: 'Cloud Storage', icon: '📦', description: 'Connect Dropbox' },
  { id: 'google_docs', name: 'Google Docs', category: 'Documents', icon: '📄', description: 'Export to Google Docs' },
  { id: 'microsoft_word', name: 'Microsoft Word', category: 'Documents', icon: '📋', description: 'Export to Word via Zapier' },
  
  // Productivity & Design
  { id: 'canva', name: 'Canva', category: 'Design', icon: '🎨', description: 'Create assets & QR codes' },
  { id: 'excel', name: 'Microsoft Excel', category: 'Productivity', icon: '📊', description: 'Export data to Excel' },
  { id: 'notion', name: 'Notion', category: 'Productivity', icon: '📑', description: 'Save form data to Notion' },
  { id: 'airtable', name: 'Airtable', category: 'Productivity', icon: '🗂️', description: 'Sync with Airtable' },
  { id: 'trello', name: 'Trello', category: 'Productivity', icon: '📌', description: 'Create Trello cards' },
  { id: 'asana', name: 'Asana', category: 'Productivity', icon: '✓', description: 'Create Asana tasks' },
  
  // CRM & Marketing
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', icon: '🤝', description: 'Connect Salesforce' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM', icon: '📈', description: 'Sync leads' },
  { id: 'zoho_crm', name: 'Zoho CRM', category: 'CRM', icon: '💼', description: 'Connect Zoho' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', icon: '📧', description: 'Email marketing' },
  { id: 'activecampaign', name: 'ActiveCampaign', category: 'Marketing', icon: '🎯', description: 'Automation platform' },
  
  // Communication
  { id: 'whatsapp', name: 'WhatsApp Business', category: 'Communication', icon: '💬', description: 'Send WhatsApp messages' },
  { id: 'telegram', name: 'Telegram', category: 'Communication', icon: '✈️', description: 'Telegram notifications' },
  { id: 'discord', name: 'Discord', category: 'Communication', icon: '🎮', description: 'Send Discord messages' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', icon: '👥', description: 'Teams notifications' },
  { id: 'twilio', name: 'Twilio (SMS)', category: 'Communication', icon: '📱', description: 'Send SMS' },
  
  // Analytics
  { id: 'google_analytics', name: 'Google Analytics', category: 'Analytics', icon: '📊', description: 'Track form analytics' },
  { id: 'facebook_pixel', name: 'Facebook Pixel', category: 'Analytics', icon: '👤', description: 'Facebook tracking' },
  { id: 'hotjar', name: 'Hotjar', category: 'Analytics', icon: '🔥', description: 'Form heatmaps' },
];

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get user's connected integrations
    const { data: connectedIntegrations } = await supabase
      .from('user_integrations')
      .select('integration_id, is_connected, created_at')
      .eq('user_id', userId);

    const connectedMap = new Map(
      connectedIntegrations?.map(i => [i.integration_id, i]) || []
    );

    const integrations = AVAILABLE_INTEGRATIONS.map(integration => ({
      ...integration,
      isConnected: connectedMap.has(integration.id),
      connectedAt: connectedMap.get(integration.id)?.created_at,
    }));

    return NextResponse.json({ integrations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}
