/**
 * Provider Status Indicator Component
 * 
 * Displays a "traffic light" indicator showing which AI providers
 * are currently available in the QuickChat system.
 */

import React from 'react';
import styles from './ProviderStatusIndicator.module.css';

export interface ProviderStatus {
  provider: string;
  available: boolean;
  status: 'online' | 'offline' | 'error' | 'unknown';
  message?: string;
  latency?: number;
  lastChecked: string;
}

interface ProviderStatusIndicatorProps {
  providers: ProviderStatus[];
  compact?: boolean;
}

/**
 * Provider Status Indicator Component
 */
export const ProviderStatusIndicator: React.FC<ProviderStatusIndicatorProps> = ({
  providers,
  compact = false,
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
        return '🟢'; // Green
      case 'offline':
        return '🔴'; // Red
      case 'error':
        return '🟠'; // Orange
      default:
        return '⚪'; // White
    }
  };

  const getStatusLabel = (provider: ProviderStatus): string => {
    const name = provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1);
    if (!compact && provider.available) {
      return `${name} ${provider.latency ? `(${provider.latency}ms)` : ''}`;
    }
    return name;
  };

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        {providers.map((provider) => (
          <span
            key={provider.provider}
            className={styles.compactIndicator}
            title={`${provider.provider}: ${provider.status}${provider.message ? ` - ${provider.message}` : ''}`}
            aria-label={`${provider.provider} status: ${provider.status}`}
          >
            {getStatusColor(provider.status)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Provider Status</h4>
      <div className={styles.providerList}>
        {providers.map((provider) => (
          <div
            key={provider.provider}
            className={`${styles.providerItem} ${provider.available ? styles.available : styles.unavailable}`}
          >
            <span className={styles.indicator} aria-label={`Status: ${provider.status}`}>
              {getStatusColor(provider.status)}
            </span>
            <div className={styles.providerInfo}>
              <div className={styles.providerName}>{getStatusLabel(provider)}</div>
              {provider.message && (
                <div className={styles.providerMessage}>{provider.message}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderStatusIndicator;
