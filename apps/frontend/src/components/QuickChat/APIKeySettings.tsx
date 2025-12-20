/**
 * API Key Settings Component for QuickChat
 * 
 * Allows users to configure API keys for different AI providers
 */

import React, { useState, useEffect } from 'react';
import styles from './APIKeySettings.module.css';

interface APIKeySettingsProps {
  apiBase?: string;
}

interface APIKeys {
  openai?: string;
  anthropic?: string;
  azure?: string;
  huggingface?: string;
  [key: string]: string | undefined;
}

export const APIKeySettings: React.FC<APIKeySettingsProps> = ({
  apiBase = '/api/ai',
}) => {
  const [keys, setKeys] = useState<APIKeys>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  // Load sanitized keys on mount
  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const response = await fetch(`${apiBase}/api-keys`);
      const data = await response.json();
      if (data.success) {
        setKeys(data.keys || {});
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
  };

  const handleSave = async (provider: string) => {
    if (!tempValue.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${apiBase}/api-keys/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: tempValue }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${provider} API key updated successfully`);
        setEditingProvider(null);
        setTempValue('');
        await loadKeys();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (provider: string) => {
    if (!confirm(`Are you sure you want to delete the ${provider} API key?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api-keys/${provider}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${provider} API key deleted`);
        await loadKeys();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (provider: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api-keys/${provider}/test`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.valid) {
        setSuccess(`${provider} connection successful`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Connection test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setLoading(false);
    }
  };

  const providers = [
    { key: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
    { key: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
    { key: 'azure', label: 'Azure OpenAI', placeholder: 'API Key' },
    { key: 'huggingface', label: 'HuggingFace', placeholder: 'hf_...' },
  ];

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>API Keys</h4>
      
      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className={styles.successBanner} role="status">
          {success}
        </div>
      )}

      <div className={styles.providerList}>
        {providers.map(({ key, label, placeholder }) => (
          <div key={key} className={styles.providerItem}>
            <div className={styles.providerHeader}>
              <span className={styles.providerLabel}>{label}</span>
              {keys[key] && !editingProvider && (
                <span className={styles.configuredBadge}>Configured</span>
              )}
            </div>

            {editingProvider === key ? (
              <div className={styles.editForm}>
                <input
                  type="password"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  placeholder={placeholder}
                  className={styles.input}
                  disabled={loading}
                />
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => handleSave(key)}
                    disabled={loading || !tempValue.trim()}
                    className={styles.saveButton}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProvider(null);
                      setTempValue('');
                    }}
                    disabled={loading}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.actionButtons}>
                {keys[key] ? (
                  <>
                    <span className={styles.keyPreview}>{keys[key]}</span>
                    <button
                      onClick={() => {
                        setEditingProvider(key);
                        setTempValue('');
                      }}
                      className={styles.editButton}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTest(key)}
                      className={styles.testButton}
                      disabled={loading}
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleDelete(key)}
                      className={styles.deleteButton}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingProvider(key);
                      setTempValue('');
                    }}
                    className={styles.addButton}
                    disabled={loading}
                  >
                    Add Key
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.helpText}>
        <p>
          <strong>Note:</strong> API keys are encrypted and stored securely.
          Only the last 4 characters are shown for security.
        </p>
      </div>
    </div>
  );
};

export default APIKeySettings;
