// SPDX-License-Identifier: MIT
// apps/frontend/src/components/UnderConstruction/UnderConstruction.tsx

import React from "react";
import { Link } from "react-router-dom";
import "./UnderConstruction.css";

interface UnderConstructionProps {
  pageName?: string;
  message?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  pageName = "Diese Seite",
  message = "ist derzeit in Entwicklung",
}) => {
  return (
    <div className="under-construction">
      <div className="construction-container">
        <div className="construction-icon">
          <span className="emoji">🚧</span>
          <div className="construction-tape">
            <div className="tape-stripe"></div>
            <div className="tape-stripe"></div>
            <div className="tape-stripe"></div>
          </div>
        </div>

        <h1 className="construction-title">{pageName}</h1>
        <p className="construction-message">{message}</p>

        <div className="construction-info">
          <p>
            Wir arbeiten hart daran, diese Funktionalität für Sie bereitzustellen.
          </p>
          <p>
            In der Zwischenzeit können Sie unseren KI-Assistenten nutzen, um
            Ihre Anforderungen zu erfassen.
          </p>
        </div>

        <div className="construction-actions">
          <Link to="/ai" className="btn btn-primary">
            <span className="btn-icon">🤖</span>
            AI Annotator öffnen
          </Link>
          <Link to="/" className="btn btn-secondary">
            <span className="btn-icon">🏠</span>
            Zurück zum Dashboard
          </Link>
        </div>

        <div className="construction-features">
          <h3>Geplante Features:</h3>
          <ul>
            <li>✨ Intuitive Benutzeroberfläche</li>
            <li>📊 Umfassende Datenverwaltung</li>
            <li>🔄 Automatisierte Workflows</li>
            <li>📈 Detaillierte Analysen & Reports</li>
            <li>🔒 Sichere Datenhaltung</li>
          </ul>
        </div>

        <div className="construction-footer">
          <p className="help-text">
            Haben Sie Fragen oder Anregungen?{" "}
            <Link to="/help">Besuchen Sie unser Hilfe-Center</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
