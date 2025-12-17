// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/LoadingScreen.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import cls from "../utils/cls";

export interface LoadingScreenProps {
  message?: string;
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "funny";
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
  overlay?: boolean;
  progress?: number; // 0-100 for progress indication
  estimatedTime?: number; // seconds
  showTips?: boolean;
}

/**
 * LoadingScreen - Enhanced loading screen with multiple variants and features
 *
 * Features:
 * - Multiple loading animations (spinner, dots, pulse, skeleton, funny)
 * - Progress indication
 * - Estimated time display
 * - Helpful tips during loading
 * - Responsive design
 * - Accessibility support
 *
 * @component
 * @example
 * ```tsx
 * <LoadingScreen
 *   message="Loading dashboard..."
 *   variant="dots"
 *   size="large"
 *   progress={75}
 *   estimatedTime={5}
 *   showTips={true}
 * />
 * ```
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  variant = "spinner",
  size = "medium",
  fullScreen = true,
  overlay = false,
  progress,
  estimatedTime,
  showTips = false,
}) => {
  const { t } = useTranslation();

  // Loading tips for better UX
  const loadingTips = [
    t("loadingScreen.tips.tip1"),
    t("loadingScreen.tips.tip2"),
    t("loadingScreen.tips.tip3"),
    t("loadingScreen.tips.tip4"),
    t("loadingScreen.tips.tip5"),
  ];

  const [currentTip, setCurrentTip] = React.useState(0);

  // Rotate tips every 5 seconds
  React.useEffect(() => {
    if (!showTips) return;

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [showTips, loadingTips.length]);

  // Funny loading messages
  const funnyMessages = [
    "Bitte warten während wir die Hamster füttern... 🐹",
    "Lade awesomeness... ✨",
    "Kaffee kochen für die Server... ☕",
    "Bits und Bytes sortieren... 🔢",
    "Magie laden... 🎩",
    "Digitalen Zauberstab schwingen... ✨",
    "Pixels anordnen... 🎨",
    "Loading... mit Stil! 💃",
  ];

  const [randomFunnyMessage] = React.useState(
    () => funnyMessages[Math.floor(Math.random() * funnyMessages.length)],
  );

  const displayMessage =
    message ||
    (variant === "funny"
      ? randomFunnyMessage
      : t("loadingScreen.defaultMessage"));

  const [randomFunnyEmoji] = React.useState(
    () => ["🐹", "⚡", "🎪", "🚀", "🌈"][Math.floor(Math.random() * 5)],
  );

  const screenClasses = cls(
    "loading-screen",
    `loading-screen--${variant}`,
    `loading-screen--${size}`,
    {
      "loading-screen--fullscreen": fullScreen,
      "loading-screen--overlay": overlay,
      "loading-screen--has-progress": progress !== undefined,
      "loading-screen--show-tips": showTips,
    },
    undefined,
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="loading-screen__dots">
            <div className="loading-screen__dot"></div>
            <div className="loading-screen__dot"></div>
            <div className="loading-screen__dot"></div>
          </div>
        );

      case "pulse":
        return (
          <div className="loading-screen__pulse">
            <div className="loading-screen__pulse-circle"></div>
          </div>
        );

      case "skeleton":
        return (
          <div className="loading-screen__skeleton">
            <div className="loading-screen__skeleton-line loading-screen__skeleton-line--large"></div>
            <div className="loading-screen__skeleton-line"></div>
            <div className="loading-screen__skeleton-line loading-screen__skeleton-line--medium"></div>
            <div className="loading-screen__skeleton-line"></div>
          </div>
        );

      case "funny":
        return (
          <div className="loading-screen__funny">
            <div
              className="loading-screen__funny-emoji"
              role="img"
              aria-label="Loading"
            >
              {randomFunnyEmoji}
            </div>
            <div className="loading-screen__funny-animation"></div>
          </div>
        );

      default: // spinner
        return (
          <div className="loading-screen__spinner">
            <div className="loading-screen__spinner-ring"></div>
          </div>
        );
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return t("loadingScreen.time.seconds", { count: seconds });
    } else {
      const minutes = Math.ceil(seconds / 60);
      return t("loadingScreen.time.minutes", { count: minutes });
    }
  };

  return (
    <div
      className={screenClasses}
      role="status"
      aria-live="polite"
      aria-label={t("loadingScreen.ariaLabel")}
    >
      <div className="loading-screen__container">
        {/* Main Loader */}
        <div className="loading-screen__loader">{renderLoader()}</div>

        {/* Message */}
        <div className="loading-screen__content">
          <p className="loading-screen__message">{displayMessage}</p>

          {/* Progress Bar */}
          {progress !== undefined &&
            (() => {
              const progressBarProps = {
                className: "loading-screen__progress-fill",
                role: "progressbar" as const,
                "aria-label": t("loadingScreen.progress", { progress }),
                "aria-valuenow": progress,
                "aria-valuemin": 0,
                "aria-valuemax": 100,
              };

              return (
                <div
                  className="loading-screen__progress"
                  data-progress={progress}
                >
                  <div className="loading-screen__progress-bar">
                    <div {...progressBarProps} />
                  </div>
                  <div className="loading-screen__progress-text">
                    {t("loadingScreen.progress", { progress })}
                  </div>
                </div>
              );
            })()}

          {/* Estimated Time */}
          {estimatedTime && (
            <div className="loading-screen__estimated-time">
              {t("loadingScreen.estimatedTime", {
                time: formatTime(estimatedTime),
              })}
            </div>
          )}

          {/* Loading Tips */}
          {showTips && (
            <div className="loading-screen__tips">
              <div className="loading-screen__tips-icon">💡</div>
              <p className="loading-screen__tips-text">
                {loadingTips[currentTip]}
              </p>
            </div>
          )}

          {/* Funny Easter Egg */}
          {variant === "funny" && (
            <div className="loading-screen__easter-egg">
              <small className="loading-screen__easter-egg-text">
                {t("loadingScreen.funny.fact")}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
