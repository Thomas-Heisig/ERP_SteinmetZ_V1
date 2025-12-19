# Marketing Module

## Overview

The Marketing module provides comprehensive marketing automation and campaign management functionality, including campaign tracking, lead generation, landing pages, email marketing, and analytics.

## Features

- **Campaign Management**: Create and track marketing campaigns across multiple channels
- **Lead Generation**: Capture and nurture leads through forms and landing pages
- **Landing Pages**: Create and publish marketing landing pages
- **Email Marketing**: Design and send email campaigns
- **Marketing Automation**: Automated workflows and lead nurturing
- **Analytics & Reporting**: Track campaign performance and ROI

## API Endpoints

### Campaigns

#### `GET /api/marketing/campaigns`

List all marketing campaigns with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by campaign type (email, social, sem, seo, offline, event, telephone)
- `status` (optional): Filter by status (draft, planned, active, paused, completed, cancelled)
- `dateFrom` (optional): Filter campaigns starting from date
- `dateTo` (optional): Filter campaigns ending before date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Summer Sale 2025",
      "type": "email",
      "status": "active",
      "description": "Summer promotional campaign",
      "start_date": "2025-06-01",
      "end_date": "2025-08-31",
      "budget": 10000.00,
      "spent": 3500.00,
      "target_audience": "enterprise_customers",
      "goals": {"leads": 500, "conversions": 50},
      "created_at": "2025-05-01T10:00:00Z"
    }
  ]
}
```

#### `POST /api/marketing/campaigns`

Create a new marketing campaign.

**Request Body:**
```json
{
  "name": "Summer Sale 2025",
  "type": "email",
  "status": "draft",
  "description": "Summer promotional campaign",
  "start_date": "2025-06-01",
  "end_date": "2025-08-31",
  "budget": 10000.00,
  "target_audience": "enterprise_customers",
  "goals": {"leads": 500, "conversions": 50}
}
```

#### `GET /api/marketing/campaigns/:id`

Get detailed campaign information including performance metrics.

#### `PUT /api/marketing/campaigns/:id`

Update campaign information.

#### `DELETE /api/marketing/campaigns/:id`

Delete a campaign.

#### `POST /api/marketing/campaigns/:id/activate`

Activate a campaign (change status from draft/planned to active).

#### `POST /api/marketing/campaigns/:id/pause`

Pause an active campaign.

### Forms

#### `GET /api/marketing/forms`

List all marketing forms.

**Query Parameters:**
- `type` (optional): Filter by form type (contact, newsletter, download, registration, survey, custom)
- `status` (optional): Filter by status (draft, published, archived)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Contact Form",
      "form_type": "contact",
      "status": "published",
      "submissions": 145,
      "conversion_rate": 8.5,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/marketing/forms`

Create a new marketing form.

**Request Body:**
```json
{
  "name": "Product Demo Request",
  "form_type": "contact",
  "form_config": {
    "fields": [
      {"name": "name", "type": "text", "required": true},
      {"name": "email", "type": "email", "required": true},
      {"name": "company", "type": "text", "required": false},
      {"name": "message", "type": "textarea", "required": true}
    ]
  },
  "success_message": "Thank you! We'll contact you soon.",
  "redirect_url": "https://example.com/thank-you",
  "status": "published"
}
```

#### `GET /api/marketing/forms/:id`

Get form details including configuration and statistics.

#### `PUT /api/marketing/forms/:id`

Update form configuration.

#### `DELETE /api/marketing/forms/:id`

Delete a form.

#### `GET /api/marketing/forms/:id/submissions`

Get all submissions for a specific form.

#### `POST /api/marketing/forms/:id/submit`

Submit a form (public endpoint for website integration).

### Landing Pages

#### `GET /api/marketing/landing-pages`

List all landing pages.

**Query Parameters:**
- `status` (optional): Filter by status (draft, published, archived)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Launch Page",
      "slug": "product-launch-2025",
      "status": "published",
      "views": 1250,
      "conversions": 87,
      "conversion_rate": 6.96,
      "created_at": "2025-02-01T10:00:00Z"
    }
  ]
}
```

#### `POST /api/marketing/landing-pages`

Create a new landing page.

**Request Body:**
```json
{
  "name": "Product Launch Page",
  "slug": "product-launch-2025",
  "title": "Revolutionary New Product - Sign Up Now",
  "description": "Be the first to try our new product",
  "content": "<html>...</html>",
  "form_id": "form-uuid",
  "template_id": "template-uuid",
  "seo_config": {
    "meta_description": "...",
    "meta_keywords": "...",
    "og_image": "..."
  },
  "status": "draft"
}
```

#### `GET /api/marketing/landing-pages/:slug`

Get landing page by slug (for public access).

#### `GET /api/marketing/landing-pages/:id`

Get landing page details (admin access).

#### `PUT /api/marketing/landing-pages/:id`

Update landing page.

#### `DELETE /api/marketing/landing-pages/:id`

Delete a landing page.

#### `POST /api/marketing/landing-pages/:id/publish`

Publish a landing page.

### Leads

#### `GET /api/marketing/leads`

List all marketing leads.

**Query Parameters:**
- `status` (optional): Filter by lead status (new, contacted, qualified, converted, lost)
- `source` (optional): Filter by lead source (form, campaign, referral, etc.)
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Example Corp",
      "phone": "+49 123 456789",
      "status": "qualified",
      "source": "landing_page",
      "campaign_id": "campaign-uuid",
      "score": 85,
      "created_at": "2025-12-01T10:00:00Z"
    }
  ]
}
```

#### `POST /api/marketing/leads`

Create a new lead (usually from form submissions).

#### `GET /api/marketing/leads/:id`

Get lead details including activity history.

#### `PUT /api/marketing/leads/:id`

Update lead information or status.

#### `POST /api/marketing/leads/:id/convert`

Convert a lead to a customer (creates CRM entry).

### Email Campaigns

#### `GET /api/marketing/emails`

List all email campaigns.

#### `POST /api/marketing/emails`

Create a new email campaign.

**Request Body:**
```json
{
  "campaign_id": "campaign-uuid",
  "subject": "Special Offer Just for You",
  "from_name": "Marketing Team",
  "from_email": "marketing@example.com",
  "template_id": "template-uuid",
  "content": "<html>...</html>",
  "recipient_list": "segment_id",
  "scheduled_at": "2025-12-20T09:00:00Z"
}
```

#### `POST /api/marketing/emails/:id/send`

Send or schedule an email campaign.

#### `GET /api/marketing/emails/:id/statistics`

Get email campaign statistics (opens, clicks, bounces, unsubscribes).

### Analytics

#### `GET /api/marketing/analytics/overview`

Get overall marketing analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_campaigns": 25,
    "active_campaigns": 8,
    "total_leads": 1250,
    "qualified_leads": 320,
    "conversion_rate": 4.8,
    "total_budget": 50000.00,
    "total_spent": 32500.00,
    "roi": 215.5,
    "email_open_rate": 24.5,
    "email_click_rate": 3.2
  }
}
```

#### `GET /api/marketing/analytics/campaigns/:id`

Get detailed analytics for a specific campaign.

#### `GET /api/marketing/analytics/forms/:id`

Get analytics for a specific form.

#### `GET /api/marketing/analytics/landing-pages/:id`

Get analytics for a specific landing page.

## Database Schema

### `marketing_campaigns`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `type` (TEXT CHECK: email, social, sem, seo, offline, event, telephone)
- `status` (TEXT CHECK: draft, planned, active, paused, completed, cancelled)
- `description` (TEXT)
- `start_date` (TEXT)
- `end_date` (TEXT)
- `budget` (REAL DEFAULT 0)
- `spent` (REAL DEFAULT 0)
- `target_audience` (TEXT)
- `goals` (TEXT) -- JSON
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `marketing_forms`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `form_type` (TEXT CHECK: contact, newsletter, download, registration, survey, custom)
- `form_config` (TEXT NOT NULL) -- JSON
- `success_message` (TEXT)
- `redirect_url` (TEXT)
- `status` (TEXT CHECK: draft, published, archived)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `marketing_form_submissions`
- `id` (TEXT PRIMARY KEY)
- `form_id` (TEXT FOREIGN KEY)
- `data` (TEXT) -- JSON
- `ip_address` (TEXT)
- `user_agent` (TEXT)
- `created_at` (TEXT)

### `marketing_landing_pages`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `slug` (TEXT UNIQUE NOT NULL)
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `content` (TEXT NOT NULL)
- `form_id` (TEXT FOREIGN KEY)
- `template_id` (TEXT)
- `seo_config` (TEXT) -- JSON
- `status` (TEXT CHECK: draft, published, archived)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `marketing_leads`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `email` (TEXT NOT NULL)
- `company` (TEXT)
- `phone` (TEXT)
- `status` (TEXT CHECK: new, contacted, qualified, converted, lost)
- `source` (TEXT)
- `campaign_id` (TEXT FOREIGN KEY)
- `form_id` (TEXT FOREIGN KEY)
- `score` (INTEGER DEFAULT 0)
- `notes` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

## Integration Points

- **CRM Module**: Lead conversion to customers
- **Sales Module**: Opportunity tracking from qualified leads
- **Communication Module**: Email campaign delivery
- **Analytics Module**: Campaign performance tracking

## Error Handling

The module uses standardized error handling:
- `ValidationError`: Invalid input data (400)
- `NotFoundError`: Resource not found (404)
- `BadRequestError`: Invalid operation (400)
- `ConflictError`: Duplicate slug or name (409)

## Future Enhancements

- [ ] A/B testing for landing pages and emails
- [ ] Marketing automation workflows
- [ ] Lead scoring algorithms
- [ ] Social media integration
- [ ] SMS marketing campaigns
- [ ] Referral program management
- [ ] Affiliate tracking
- [ ] Webinar management
- [ ] Content marketing calendar
- [ ] Influencer collaboration tracking

## Related Documentation

- [API Documentation](../../../../docs/modules/marketing/README.md)
- [CRM Module](../crm/README.md)
- [Communication Module](../communication/README.md)
- [Database Schema](../../../../docs/reference/database-schema.md)

## Version History

- **v0.3.0** (2025-12-19): Initial marketing module implementation
