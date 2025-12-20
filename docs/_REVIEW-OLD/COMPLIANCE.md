# Compliance & Audit — ERP SteinmetZ

Ziele:

- GoBD-konforme Protokollierung (vollständige Nachvollziehbarkeit)
- GDPR-konforme Prozesse (Right-to-be-Forgotten)
- Aufbewahrungsfristen & automatisches Archivieren/Löschen
- Vier-Augen-Prinzip (Approval-Flows)

Empfohlene Implementierungen:

1. Audit Trail
   - Jede Änderung an kritischen Entities (buchungen, payroll, bank_accounts, employees) schreibt einen Audit-Record (before/after).
   - Audit-Einträge sind append-only.
   - Audit-Trail Tabelle: core.audit_trail (siehe Migration).

2. Retention Policies
   - Konfiguration per Entity/Field-Kategorie:
     - PII: 10 Jahre
     - Buchhaltung: 10 Jahre
     - HR: 30 Jahre
   - Implementiere background jobs (daily) die expired Daten archivieren oder löschen (kein hartes delete ohne Archiv).

3. Four-Eyes Approval
   - Critical operations move into "pending" state, require a second authorized user to approve.
   - Store approvals in core.audit_trail with compliance_tags ['FOUR_EYES'].

4. GDPR Workflows
   - Right-to-be-Forgotten triggers a cascade:
     - Mask PII, preserve accounting integrity (ledger entries kept but anonymized)
     - Record the action in audit_trail
     - Export package with lifecycle log

5. Monitoring & Alerts
   - Alerts for failed or unreviewed approvals (>24h)
   - Alert on unusual data purges

6. Certification & Evidence
   - Provide exportable compliance reports (hash-signed snapshots of audit trail)
