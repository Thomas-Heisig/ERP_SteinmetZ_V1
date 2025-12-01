// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/lint/LintPanel.tsx

import React from "react";
import Panel from "../layout/Panel";

import type { LintFinding } from "../../FunctionsCatalog/types";

interface Props {
  findings: LintFinding[];
}

export default function LintPanel({ findings }: Props) {
  if (!Array.isArray(findings) || findings.length === 0) {
    return (
      <Panel title="Lint-Ergebnisse (0)">
        <div className="fc-lint-empty">Keine Findings vorhanden.</div>
      </Panel>
    );
  }

  return (
    <Panel title={`Lint-Ergebnisse (${findings.length})`}>
      <ul className="fc-lint-list">
        {findings.map((f, idx) => (
          <li
            key={`${f.code}-${idx}`}
            className={`fc-lint-item fc-lint-${f.severity}`}
          >
            <strong>
              [{f.severity}] {f.code}
            </strong>
            : {f.message}
            {f.file && <span> @ {f.file}</span>}
            {f.nodePath && <span> – {f.nodePath}</span>}
            {f.nodeId && <span> (ID: {f.nodeId})</span>}
          </li>
        ))}
      </ul>

      <style>{`
        .fc-lint-list {
          margin: 0;
          padding-left: 16px;
          font-size: 14px;
          line-height: 1.4;
        }

        .fc-lint-item {
          margin-bottom: 8px;
        }

        .fc-lint-error strong { color: #b91c1c; }
        .fc-lint-warn strong { color: #d97706; }
        .fc-lint-info strong { color: #2563eb; }

        .fc-lint-empty {
          font-size: 14px;
          color: #6b7280;
        }
      `}</style>
    </Panel>
  );
}
