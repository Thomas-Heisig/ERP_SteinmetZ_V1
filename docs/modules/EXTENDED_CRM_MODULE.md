# Extended CRM Module Documentation

## Overview

The Extended CRM Module adds advanced customer relationship management capabilities to the existing CRM system, including hierarchies, data enrichment, duplicate detection, and predictive analytics.

## Table of Contents

- [Features](#features)
- [Database Schema](#database-schema)
- [Integration with Base CRM](#integration-with-base-crm)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Features

### 1. Customer Hierarchies

- Parent-subsidiary relationships
- Corporate group structures
- Partner networks
- Key account mapping

### 2. Contact Relationships

- Organizational charts
- Influencer identification
- Decision-maker mapping
- Relationship strength tracking

### 3. Data Enrichment

- External data source integration
- Automatic data updates
- Quality scoring
- Enrichment audit trail

### 4. Duplicate Detection

- Fuzzy matching algorithms
- Multi-field comparison
- Manual review workflow
- Merge history tracking

### 5. Data Quality Management

- Automated quality checks
- Completeness scoring
- Validation rules
- Issue tracking and resolution

### 6. Extended Contact Features

- Communication preferences
- GDPR consent management
- Multi-channel contact history
- Automated follow-ups

### 7. Customer Value Metrics

- Lifetime value calculation
- Customer scoring
- Churn risk prediction
- Engagement scoring

### 8. Telephony & CTI Integration

- Call logging and recording
- Call quality tracking
- Voicemail management
- Transcription services

### 9. Email Tracking

- Open and click tracking
- Delivery monitoring
- Bounce management
- Engagement analytics

### 10. Performance & Predictive Analytics

- Sales performance metrics
- Predictive models for opportunities
- Churn prediction
- Forecasting

## Database Schema

### Customer Hierarchies

#### `crm_company_hierarchies`

Manages relationships between companies.

```sql
CREATE TABLE crm_company_hierarchies (
  id TEXT PRIMARY KEY,
  parent_customer_id TEXT NOT NULL,
  child_customer_id TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('parent_subsidiary', 'corporate_group', 'partner', 'key_account')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (child_customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  UNIQUE(parent_customer_id, child_customer_id)
);
```

#### `crm_contact_relationships`

Tracks relationships between individual contacts.

```sql
CREATE TABLE crm_contact_relationships (
  id TEXT PRIMARY KEY,
  contact_id_from TEXT NOT NULL,
  contact_id_to TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'colleague', 'influencer', 'decision_maker')),
  relationship_strength INTEGER CHECK (relationship_strength >= 1 AND relationship_strength <= 10),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contact_id_from) REFERENCES crm_contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id_to) REFERENCES crm_contacts(id) ON DELETE CASCADE
);
```

### Data Enrichment

#### `crm_enrichment_logs`

Tracks all data enrichment activities.

```sql
CREATE TABLE crm_enrichment_logs (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  contact_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('handelsregister', 'creditreform', 'web_scraping', 'social_media', 'manual', 'api')),
  enriched_fields TEXT NOT NULL, -- JSON: array of enriched field names
  enriched_data TEXT NOT NULL, -- JSON: actual enriched data
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  enriched_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE CASCADE
);
```

### Duplicate Detection

#### `crm_duplicate_rules`

Defines rules for detecting duplicates.

```sql
CREATE TABLE crm_duplicate_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'contact')),
  matching_fields TEXT NOT NULL, -- JSON: fields to match on with weights
  threshold_score INTEGER NOT NULL DEFAULT 80,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### `crm_duplicate_candidates`

Stores detected potential duplicates.

```sql
CREATE TABLE crm_duplicate_candidates (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'contact')),
  entity_id_1 TEXT NOT NULL,
  entity_id_2 TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  matching_details TEXT, -- JSON: which fields matched
  status TEXT NOT NULL CHECK (status IN ('pending_review', 'confirmed_duplicate', 'not_duplicate', 'merged')) DEFAULT 'pending_review',
  reviewed_by TEXT,
  reviewed_at TEXT,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id_1, entity_id_2)
);
```

### Contact Preferences

#### `crm_contact_preferences`

Stores communication preferences and consent.

```sql
CREATE TABLE crm_contact_preferences (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  preferred_communication_channel TEXT CHECK (preferred_communication_channel IN ('email', 'phone', 'sms', 'chat', 'mail')),
  preferred_contact_time TEXT,
  communication_frequency TEXT CHECK (communication_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  language TEXT,
  timezone TEXT,
  gdpr_consent BOOLEAN DEFAULT 0,
  gdpr_consent_date TEXT,
  marketing_opt_in BOOLEAN DEFAULT 0,
  marketing_opt_in_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE CASCADE,
  UNIQUE(contact_id)
);
```

### Customer Metrics

#### `crm_customer_metrics`

Tracks customer value and behavior metrics.

```sql
CREATE TABLE crm_customer_metrics (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  metric_date TEXT NOT NULL,
  total_revenue REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value REAL DEFAULT 0,
  lifetime_value REAL DEFAULT 0,
  customer_score INTEGER DEFAULT 0,
  churn_risk_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  satisfaction_score INTEGER DEFAULT 0,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);
```

### Communication Tracking

#### `crm_call_logs`

Detailed call tracking and recording.

```sql
CREATE TABLE crm_call_logs (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  customer_id TEXT,
  contact_id TEXT,
  phone_number TEXT NOT NULL,
  call_direction TEXT CHECK (call_direction IN ('inbound', 'outbound')),
  call_duration_seconds INTEGER DEFAULT 0,
  call_status TEXT CHECK (call_status IN ('answered', 'missed', 'voicemail', 'busy', 'failed')),
  recording_url TEXT,
  transcript TEXT,
  call_quality_score INTEGER CHECK (call_quality_score >= 1 AND call_quality_score <= 5),
  notes TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  FOREIGN KEY (activity_id) REFERENCES crm_activities(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
);
```

#### `crm_email_tracking`

Email interaction tracking.

```sql
CREATE TABLE crm_email_tracking (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  customer_id TEXT,
  contact_id TEXT,
  email_subject TEXT NOT NULL,
  email_from TEXT NOT NULL,
  email_to TEXT NOT NULL,
  email_cc TEXT,
  sent_at TEXT NOT NULL,
  delivered_at TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft', 'none')),
  status TEXT CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced')),
  FOREIGN KEY (activity_id) REFERENCES crm_activities(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
);
```

### Performance Metrics

#### `crm_performance_metrics`

Tracks sales and team performance.

```sql
CREATE TABLE crm_performance_metrics (
  id TEXT PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('user', 'team', 'company')),
  metric_owner TEXT, -- user_id or team_id
  metric_period TEXT NOT NULL, -- e.g., '2025-12', 'Q1-2025'
  total_opportunities INTEGER DEFAULT 0,
  won_opportunities INTEGER DEFAULT 0,
  lost_opportunities INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  avg_deal_size REAL DEFAULT 0,
  avg_sales_cycle_days INTEGER DEFAULT 0,
  pipeline_velocity REAL DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Integration with Base CRM

The Extended CRM module seamlessly integrates with the base CRM tables:

- `crm_customers` - Base customer data
- `crm_contacts` - Base contact data
- `crm_opportunities` - Sales opportunities
- `crm_activities` - Customer interactions

All extended tables use foreign keys to maintain referential integrity with the base CRM data.

## Usage Examples

### Example 1: Create a Company Hierarchy

```typescript
// Create parent-subsidiary relationship
await fetch("/api/crm/hierarchies", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    parent_customer_id: "cust-parent-uuid",
    child_customer_id: "cust-subsidiary-uuid",
    relationship_type: "parent_subsidiary",
    notes: "Full subsidiary, 100% owned",
  }),
});
```

### Example 2: Enrich Customer Data

```typescript
// Log data enrichment from external source
await fetch("/api/crm/enrichment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer_id: "cust-uuid",
    source: "creditreform",
    enriched_fields: ["credit_score", "company_size", "revenue"],
    enriched_data: {
      credit_score: 85,
      company_size: 250,
      revenue: 15000000,
    },
    quality_score: 95,
  }),
});
```

### Example 3: Detect and Merge Duplicates

```typescript
// Run duplicate detection
const duplicates = await fetch("/api/crm/duplicates/detect", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    entity_type: "customer",
    rule_id: "rule-uuid",
  }),
});

// Review and merge duplicates
const duplicateList = await duplicates.json();
for (const dup of duplicateList.data) {
  if (dup.match_score > 90) {
    // Merge the duplicates
    await fetch("/api/crm/duplicates/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master_id: dup.entity_id_1,
        duplicate_ids: [dup.entity_id_2],
        merge_strategy: "keep_master",
      }),
    });
  }
}
```

### Example 4: Track Customer Metrics

```typescript
// Calculate and store customer metrics
await fetch("/api/crm/metrics/customer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer_id: "cust-uuid",
    metric_date: "2025-12-01",
    total_revenue: 125000,
    total_orders: 45,
    avg_order_value: 2777.78,
    lifetime_value: 250000,
    customer_score: 85,
    churn_risk_score: 15,
    engagement_score: 92,
    satisfaction_score: 88,
  }),
});
```

### Example 5: Log a Call with Transcription

```typescript
// Log a completed call
await fetch("/api/crm/calls", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer_id: "cust-uuid",
    contact_id: "contact-uuid",
    phone_number: "+49123456789",
    call_direction: "outbound",
    call_duration_seconds: 420,
    call_status: "answered",
    recording_url: "https://recordings.example.com/call-123.mp3",
    transcript: "Call transcript text here...",
    call_quality_score: 5,
    notes: "Discussed renewal of contract",
    started_at: "2025-12-19T10:00:00Z",
    ended_at: "2025-12-19T10:07:00Z",
  }),
});
```

### Example 6: Set Contact Preferences

```typescript
// Update contact preferences and GDPR consent
await fetch("/api/crm/contacts/cust-uuid/preferences", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    preferred_communication_channel: "email",
    preferred_contact_time: "09:00-17:00",
    communication_frequency: "weekly",
    language: "de",
    timezone: "Europe/Berlin",
    gdpr_consent: true,
    gdpr_consent_date: "2025-12-19",
    marketing_opt_in: true,
    marketing_opt_in_date: "2025-12-19",
  }),
});
```

## Best Practices

### 1. Data Enrichment

- Schedule regular enrichment updates
- Validate enriched data before storing
- Track enrichment quality scores
- Document data sources
- Respect rate limits on external APIs

### 2. Duplicate Detection

- Set appropriate match thresholds (80-90%)
- Always require manual review before merging
- Keep merge history for audit purposes
- Test rules on sample data first
- Monitor false positive rates

### 3. Data Quality

- Run automated checks daily
- Prioritize critical issues
- Set up alerts for quality drops
- Regular data cleanup campaigns
- Document quality standards

### 4. GDPR Compliance

- Always record consent timestamps
- Provide easy opt-out mechanisms
- Honor data deletion requests within 30 days
- Maintain audit trails
- Regular compliance reviews

### 5. Customer Metrics

- Calculate metrics asynchronously
- Update metrics on schedule (daily/weekly)
- Use historical trends for predictions
- Document calculation methodologies
- Validate metric accuracy regularly

### 6. Communication Tracking

- Only track with proper consent
- Secure call recordings properly
- Respect privacy regulations
- Anonymize transcripts if needed
- Set retention policies

### 7. Performance Analytics

- Calculate metrics off-peak hours
- Use aggregated data for dashboards
- Cache frequently accessed metrics
- Set realistic targets
- Regular model validation

### 8. Hierarchies

- Prevent circular references
- Validate relationships before creating
- Document organizational changes
- Review hierarchies quarterly
- Handle reorganizations carefully

### 9. Contact Relationships

- Keep relationship data current
- Track relationship changes
- Use for targeted campaigns
- Respect organizational boundaries
- Document key relationships

### 10. Predictive Models

- Regular retraining (monthly/quarterly)
- Monitor model drift
- Explain predictions when possible
- A/B test model changes
- Document model assumptions

## Security Considerations

1. **Access Control**: Implement role-based access for sensitive data
2. **Data Encryption**: Encrypt sensitive fields (recordings, transcripts)
3. **Audit Trails**: Log all data access and modifications
4. **GDPR Compliance**: Proper consent management and data deletion
5. **API Security**: Rate limiting and authentication for external data sources

## Performance Optimization

### Indexing Strategy

All critical indexes are created by the migration:

- Foreign key indexes for joins
- Status indexes for filtering
- Date indexes for time-based queries
- Composite indexes for common query patterns

### Query Optimization

- Use indexed columns in WHERE clauses
- Limit result sets appropriately
- Paginate large datasets
- Cache frequently accessed data
- Use aggregations wisely

### Batch Processing

- Calculate metrics in batches
- Schedule heavy operations off-peak
- Use queues for async processing
- Implement retry logic
- Monitor processing times

## Future Enhancements

- AI-powered relationship mapping
- Advanced predictive churn models
- Real-time data quality monitoring
- Automated data enrichment workflows
- Social network analysis
- Advanced segmentation algorithms
- Natural language processing for call transcripts
- Sentiment analysis for communications

## Support

For issues or questions:

- Review the database schema
- Check the API documentation
- Examine example implementations
- Contact the development team

## License

SPDX-License-Identifier: MIT
