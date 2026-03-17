'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Copy, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  created: string;
  lastUsed?: string;
  rateLimit: number;
  requestsUsed: number;
}

interface ApiKeysManagerProps {
  keys?: ApiKey[];
  onKeyCreated?: (key: ApiKey) => void;
  onKeyDeleted?: (keyId: string) => void;
  onKeyRegenerated?: (keyId: string, newKey: ApiKey) => void;
}

export default function ApiKeysManager({
  keys = [],
  onKeyCreated,
  onKeyDeleted,
  onKeyRegenerated,
}: ApiKeysManagerProps) {
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a key name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const newKey = await response.json();
        onKeyCreated?.(newKey);
        setNewKeyName('');
        setShowNewKey(false);
      }
    } catch (error) {
      console.error('Error creating key:', error);
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/integrations/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onKeyDeleted?.(keyId);
      }
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleRegenerateKey = async (keyId: string) => {
    if (!confirm('Regenerating will invalidate the old key. Continue?')) return;

    try {
      const response = await fetch(`/api/integrations/api-keys/${keyId}/regenerate`, {
        method: 'POST',
      });

      if (response.ok) {
        const newKey = await response.json();
        onKeyRegenerated?.(keyId, newKey);
      }
    } catch (error) {
      console.error('Error regenerating key:', error);
      alert('Failed to regenerate API key');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(keyId);
    setTimeout(() => setCopied(null), 2000);
  };

  const getUsagePercentage = (key: ApiKey) => {
    return Math.min(100, (key.requestsUsed / key.rateLimit) * 100);
  };

  return (
    <div className="space-y-6">
      {showNewKey && (
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold mb-4">Create New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key Name</label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production, Development, Third-party"
              />
              <p className="text-xs text-gray-600 mt-1">
                Use descriptive names to identify where the key is used
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateKey}
                disabled={loading || !newKeyName.trim()}
              >
                Create Key
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewKey(false);
                  setNewKeyName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">API Keys ({keys.length})</h3>
        {!showNewKey && (
          <Button onClick={() => setShowNewKey(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Key
          </Button>
        )}
      </div>

      {keys.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No API keys yet. Create one to get started with integrations.
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <Card key={key.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{key.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {new Date(key.created).toLocaleDateString()}
                    </p>
                    {key.lastUsed && (
                      <p className="text-xs text-gray-500">
                        Last used {new Date(key.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleKeyVisibility(key.id)}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          visibleKeys.has(key.id) ? key.key : key.maskedKey,
                          key.id
                        )
                      }
                    >
                      {copied === key.id ? (
                        'Copied!'
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerateKey(key.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm text-green-400 overflow-x-auto">
                  {visibleKeys.has(key.id) ? key.key : key.maskedKey}
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">API Rate Limit Usage</span>
                    <span className="font-medium">
                      {key.requestsUsed.toLocaleString()} / {key.rateLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        getUsagePercentage(key) > 80
                          ? 'bg-red-500'
                          : getUsagePercentage(key) > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(key)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-amber-50 border border-amber-200">
        <h4 className="font-semibold text-amber-900 mb-2">API Key Security</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Keep your API keys confidential - don't share them in public code</li>
          <li>• Store keys in environment variables or secure vaults</li>
          <li>• Rotate keys regularly for security</li>
          <li>• Delete unused keys to reduce security risks</li>
          <li>• Monitor key usage for unauthorized access</li>
        </ul>
      </Card>
    </div>
  );
}
