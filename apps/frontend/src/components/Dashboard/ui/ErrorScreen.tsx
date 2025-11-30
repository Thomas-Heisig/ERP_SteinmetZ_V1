// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/ErrorScreen.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import cls from "../utils/cls";

export interface ErrorScreenProps {
  error: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'funny' | 'professional' | 'minimal';
  showDetails?: boolean;
}

/**
 * ErrorScreen – Lustige Fehleranzeige die den Frust nimmt.
 * 
 * "Fehler sind wie Katzen - sie machen was sie wollen!"
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  error, 
  title, 
  message, 
  onRetry, 
  variant = 'funny',
  showDetails = true
}) => {
  const { t } = useTranslation();

  // Lustige Fehler-Emojis und Icons
  const errorEmojis = ['😵', '🤦', '💥', '🐛', '🦄', '👾', '🎪', '🎭'];
  const randomEmoji = errorEmojis[Math.floor(Math.random() * errorEmojis.length)];

  // Lustige Error-Messages
  const funnyTitles = [
    "Huch! Da ist was schiefgelaufen!",
    "Öhm... das war nicht geplant!",
    "Autsch! Ein digitaler Zwischenfall!",
    "Whoopsie! Ein kleiner Fehlerteufel!",
    "404 - Sinn für Humor nicht gefunden!",
    "Das war wohl nix!",
    "Da hat sich ein Bug eingeschlichen! 🐛",
    "Absturz! Aber mit Stil! 💥"
  ];

  const funnyMessages = [
    "Unsere Hamster im Server sind müde. Probier's nochmal!",
    "Sogar Roboter machen mal Pause. Versuch's später nochmal!",
    "Das Internet ist heute wohl etwas verstopft...",
    "Unser Code hat sich verirrt. Wir schicken Suchtrupps!",
    "Das war ein Test, ob du aufpasst! Bestanden! 😄",
    "Fehler? Wir nennen das 'kreative Abweichung'!",
    "Unser Algorithmus meditiert gerade. Kommt gleich zurück!",
    "Das war Absicht! Wir testen deine Geduld! ✨"
  ];

  const randomTitle = funnyTitles[Math.floor(Math.random() * funnyTitles.length)];
  const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  const displayTitle = title || (variant === 'funny' ? randomTitle : t('errorScreen.defaultTitle'));
  const displayMessage = message || (variant === 'funny' ? randomMessage : t('errorScreen.defaultMessage'));

  // Error-Details aufbereiten
  const errorDetails = React.useMemo(() => {
    if (!error) return null;
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }, [error]);

  // Lustige Retry-Button-Texte
  const retryButtonTexts = [
    "Nochmal versuchen!",
    "Gib mir noch eine Chance!",
    "Ich glaub an dich!",
    "Zauberstab schwingen! ✨",
    "Reset-Knopf drücken!",
    "Weiter geht's!",
    "Noch ein Versuch!",
    "Das schaffen wir! 💪"
  ];

  const randomRetryText = retryButtonTexts[Math.floor(Math.random() * retryButtonTexts.length)];

  const handleRetry = () => {
    // Kleine Verzögerung für bessere UX
    setTimeout(() => {
      onRetry?.();
    }, 300);
  };

  const screenClasses = cls(
    'error-screen',
    `error-screen--${variant}`,
    {
      'error-screen--retry-available': !!onRetry,
      'error-screen--show-details': showDetails
    },
    undefined
  );

  return (
    <div className={screenClasses}>
      <div className="error-screen__container">
        {/* Haupt-Emoji/Icon */}
        <div className="error-screen__emoji" role="img" aria-label="Error Emoji">
          {randomEmoji}
        </div>

        {/* Titel und Nachricht */}
        <div className="error-screen__content">
          <h2 className="error-screen__title">
            {displayTitle}
          </h2>
          
          <p className="error-screen__message">
            {displayMessage}
          </p>

          {/* Lustiger Fortschrittsbalken (fake) */}
          {variant === 'funny' && (
            <div className="error-screen__progress">
              <div className="error-screen__progress-bar">
                <div 
                  className="error-screen__progress-fill"
                  style={{ width: `${Math.random() * 30 + 10}%` }}
                />
              </div>
              <div className="error-screen__progress-text">
                Fehleranalyse läuft... {Math.floor(Math.random() * 100)}%
              </div>
            </div>
          )}

          {/* Error-Details (ausklappbar) */}
          {showDetails && errorDetails && (
            <details className="error-screen__details">
              <summary className="error-screen__details-summary">
                {variant === 'funny' ? '🤓 Technische Details (für Nerds)' : 'Technische Details'}
              </summary>
              <pre className="error-screen__details-content">
                {errorDetails}
              </pre>
            </details>
          )}

          {/* Aktions-Buttons */}
          <div className="error-screen__actions">
            {onRetry && (
              <button
                className="error-screen__retry-button"
                onClick={handleRetry}
              >
                <span className="error-screen__retry-emoji" role="img" aria-label="Retry">
                  🔄
                </span>
                {variant === 'funny' ? randomRetryText : t('errorScreen.retry')}
              </button>
            )}
            
            <button
              className="error-screen__action-button"
              onClick={() => window.location.reload()}
            >
              <span role="img" aria-label="Refresh">🔄</span>
              Seite neu laden
            </button>
            
            <button
              className="error-screen__action-button"
              onClick={() => window.history.back()}
            >
              <span role="img" aria-label="Go back">⬅️</span>
              Zurück gehen
            </button>
          </div>

          {/* Lustiger Footer */}
          {variant === 'funny' && (
            <footer className="error-screen__footer">
              <p className="error-screen__footer-text">
                "Fehler sind wie Katzen - sie machen was sie wollen!" 
                <span role="img" aria-label="cat"> 😼</span>
              </p>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;