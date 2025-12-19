# Marketing Module Documentation

## Overview

The Marketing Module provides comprehensive marketing automation, campaign management, and lead generation capabilities for the ERP system. It implements the features outlined in the "Vertrieb & Marketing" concept document.

## Table of Contents

- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Architecture

The Marketing Module consists of:

1. **Database Layer**: SQLite tables for campaigns, forms, events, segments, and analytics
2. **Backend API**: RESTful endpoints for CRUD operations and business logic
3. **Frontend Components**: React components for marketing management (to be implemented)

### Database Tables

#### Campaign Management
- `marketing_campaigns` - Core campaign definitions
- `marketing_campaign_metrics` - Performance tracking per campaign
- `marketing_email_sequences` - Email automation sequences
- `marketing_email_steps` - Individual emails in sequences
- `marketing_social_posts` - Social media content calendar

#### Audience Management
- `marketing_segments` - Customer/lead segments
- `marketing_personas` - Buyer personas
- `marketing_budgets` - Budget allocation and tracking

#### Lead Generation
- `marketing_forms` - Web form definitions
- `marketing_form_submissions` - Form submission data
- `marketing_landing_pages` - Landing page content
- `marketing_events` - Event management
- `marketing_event_registrations` - Event attendee tracking

#### Lead Scoring & Analytics
- `marketing_scoring_models` - Lead scoring configurations
- `marketing_lead_scores` - Historical lead scores
- `marketing_attribution_models` - Attribution model definitions
- `marketing_touchpoints` - Customer touchpoint tracking

#### Marketing Automation
- `marketing_workflows` - Automation workflow definitions
- `marketing_workflow_executions` - Workflow execution state
- `marketing_ab_tests` - A/B test configurations

## API Endpoints

### Campaign Management

#### List Campaigns
```http
GET /api/marketing/campaigns?status={status}&type={type}
```

Query Parameters:
- `status` (optional): Filter by status (draft, planned, active, paused, completed, cancelled)
- `type` (optional): Filter by type (email, social, sem, seo, offline, event, telephone)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "camp-uuid",
      "name": "Summer Campaign 2025",
      "type": "email",
      "status": "active",
      "description": "Q2 promotional campaign",
      "start_date": "2025-06-01",
      "end_date": "2025-08-31",
      "budget": 10000,
      "spent": 3500,
      "target_audience": "Active customers",
      "goals": "{\"conversions\": 100, \"revenue\": 50000}",
      "created_at": "2025-05-01T10:00:00Z",
      "updated_at": "2025-05-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

#### Get Campaign by ID
```http
GET /api/marketing/campaigns/:id
```

#### Create Campaign
```http
POST /api/marketing/campaigns
Content-Type: application/json

{
  "name": "Summer Campaign 2025",
  "type": "email",
  "status": "draft",
  "description": "Q2 promotional campaign",
  "start_date": "2025-06-01",
  "end_date": "2025-08-31",
  "budget": 10000,
  "target_audience": "Active customers",
  "goals": "{\"conversions\": 100}"
}
```

#### Update Campaign
```http
PUT /api/marketing/campaigns/:id
Content-Type: application/json

{
  "status": "active",
  "budget": 12000
}
```

#### Delete Campaign
```http
DELETE /api/marketing/campaigns/:id
```

#### Get Campaign Metrics
```http
GET /api/marketing/campaigns/:id/metrics
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "metric-uuid",
      "campaign_id": "camp-uuid",
      "metric_date": "2025-06-01",
      "impressions": 5000,
      "clicks": 250,
      "opens": 1200,
      "conversions": 15,
      "leads_generated": 20,
      "cost": 500,
      "revenue": 3000,
      "engagement_rate": 5.0,
      "conversion_rate": 6.0,
      "roi": 500
    }
  ],
  "count": 1
}
```

### Web Forms

#### List Forms
```http
GET /api/marketing/forms?status={status}
```

#### Get Form by ID
```http
GET /api/marketing/forms/:id
```

#### Create Form
```http
POST /api/marketing/forms
Content-Type: application/json

{
  "name": "Contact Form",
  "description": "Main contact form for website",
  "form_type": "contact",
  "form_config": "{\"fields\": [{\"name\": \"email\", \"type\": \"email\", \"required\": true}]}",
  "success_message": "Thank you for contacting us!",
  "redirect_url": "https://example.com/thank-you",
  "status": "published"
}
```

#### Submit Form (Public Endpoint)
```http
POST /api/marketing/forms/:id/submit
Content-Type: application/json

{
  "email": "customer@example.com",
  "name": "John Doe",
  "message": "I'm interested in your services"
}
```

Response:
```json
{
  "success": true,
  "message": "Thank you for contacting us!",
  "redirect_url": "https://example.com/thank-you"
}
```

### Landing Pages

#### List Landing Pages
```http
GET /api/marketing/landing-pages?status={status}
```

#### Get Landing Page by Slug
```http
GET /api/marketing/landing-pages/:slug
```

This endpoint automatically increments the view count.

#### Create Landing Page
```http
POST /api/marketing/landing-pages
Content-Type: application/json

{
  "name": "Product Launch Page",
  "slug": "product-launch-2025",
  "title": "Introducing Our New Product",
  "description": "Revolutionary solution for your business",
  "content": "<html>...</html>",
  "form_id": "form-uuid",
  "seo_config": "{\"keywords\": [\"product\", \"launch\"]}",
  "status": "published"
}
```

### Events

#### List Events
```http
GET /api/marketing/events?status={status}
```

#### Create Event
```http
POST /api/marketing/events
Content-Type: application/json

{
  "campaign_id": "camp-uuid",
  "name": "Product Webinar",
  "event_type": "webinar",
  "description": "Learn about our new features",
  "start_date": "2025-07-15T14:00:00Z",
  "end_date": "2025-07-15T15:00:00Z",
  "location": "Online",
  "capacity": 100,
  "budget": 500
}
```

#### Register for Event
```http
POST /api/marketing/events/:id/register
Content-Type: application/json

{
  "attendee_name": "Jane Smith",
  "attendee_email": "jane@example.com",
  "attendee_phone": "+49123456789",
  "customer_id": "cust-uuid",
  "additional_data": {
    "company": "Example Corp"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Successfully registered for event",
  "registration_id": "reg-uuid"
}
```

### Segments

#### List Segments
```http
GET /api/marketing/segments
```

#### Create Segment
```http
POST /api/marketing/segments
Content-Type: application/json

{
  "name": "High-Value Customers",
  "description": "Customers with LTV > 10000",
  "segment_type": "behavioral",
  "criteria": "{\"ltv\": {\"gt\": 10000}}",
  "status": "active"
}
```

### Statistics

#### Get Marketing Statistics
```http
GET /api/marketing/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalCampaigns": 25,
    "activeCampaigns": 8,
    "totalForms": 12,
    "totalSubmissions": 543,
    "totalEvents": 15,
    "totalSegments": 20
  }
}
```

## Features

### 1. Campaign Management
- Multi-channel campaign support (email, social, SEM/SEO, offline, events)
- Campaign lifecycle management (draft → planned → active → completed)
- Budget tracking and ROI calculation
- Performance metrics tracking
- Campaign attribution

### 2. Email Marketing
- Email sequence builder
- Automated email workflows
- Personalization and dynamic content
- A/B testing support
- Open and click tracking (GDPR-compliant)

### 3. Social Media Management
- Multi-platform posting (Facebook, Instagram, Twitter, LinkedIn, TikTok, Pinterest)
- Content calendar
- Scheduled publishing
- Engagement metrics tracking

### 4. Lead Generation
- Drag-and-drop form builder
- Landing page creation
- Event management and registration
- Lead capture from multiple sources
- Form submission tracking

### 5. Audience Segmentation
- Demographic segmentation
- Firmographic segmentation
- Behavioral segmentation
- Psychographic segmentation
- Persona management

### 6. Lead Scoring
- Rule-based scoring models
- AI-based scoring (extensible)
- Score history tracking
- Automated lead routing based on scores

### 7. Marketing Automation
- Workflow automation
- Trigger-based actions
- Lead nurturing campaigns
- Multi-step sequences
- Behavioral triggers

### 8. Analytics & Reporting
- Campaign performance dashboards
- ROI calculation
- Attribution modeling (first-touch, last-touch, multi-touch)
- Touchpoint tracking
- Conversion funnel analysis

### 9. A/B Testing
- Test multiple variants
- Statistical significance tracking
- Winner selection
- Performance comparison

### 10. Budget Management
- Budget allocation per campaign/channel
- Spend tracking
- Budget alerts
- ROI optimization

## Usage Examples

### Example 1: Create and Launch an Email Campaign

```typescript
// 1. Create a campaign
const campaignResponse = await fetch('/api/marketing/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Newsletter Q2 2025',
    type: 'email',
    status: 'draft',
    description: 'Quarterly newsletter',
    start_date: '2025-04-01',
    end_date: '2025-06-30',
    budget: 5000,
    target_audience: 'Newsletter Subscribers',
    goals: JSON.stringify({
      opens: 1000,
      clicks: 150,
      conversions: 30
    })
  })
});

const campaign = await campaignResponse.json();

// 2. Create an email sequence
const sequenceResponse = await fetch('/api/marketing/email-sequences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaign_id: campaign.data.id,
    name: 'Welcome Series',
    trigger_type: 'manual',
    status: 'active'
  })
});

// 3. Add email steps to the sequence
// Step 1: Welcome email
await fetch('/api/marketing/email-steps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sequence_id: sequence.data.id,
    step_order: 1,
    subject: 'Welcome to our newsletter!',
    content: '<html>...</html>',
    delay_days: 0,
    delay_hours: 0
  })
});

// Step 2: Follow-up email
await fetch('/api/marketing/email-steps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sequence_id: sequence.data.id,
    step_order: 2,
    subject: 'Here are our top tips',
    content: '<html>...</html>',
    delay_days: 3,
    delay_hours: 0
  })
});

// 4. Activate the campaign
await fetch(`/api/marketing/campaigns/${campaign.data.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
});
```

### Example 2: Create a Landing Page with Lead Capture Form

```typescript
// 1. Create a form
const formResponse = await fetch('/api/marketing/forms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Product Demo Request',
    form_type: 'registration',
    form_config: JSON.stringify({
      fields: [
        { name: 'name', type: 'text', label: 'Full Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'company', type: 'text', label: 'Company', required: false },
        { name: 'phone', type: 'tel', label: 'Phone', required: false }
      ]
    }),
    success_message: 'Thank you! We will contact you soon.',
    status: 'published'
  })
});

const form = await formResponse.json();

// 2. Create a landing page
const pageResponse = await fetch('/api/marketing/landing-pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Product Demo Page',
    slug: 'request-demo',
    title: 'Request a Free Demo',
    description: 'See our product in action',
    content: '<html>...</html>',
    form_id: form.data.id,
    seo_config: JSON.stringify({
      meta_title: 'Request a Demo - Our Product',
      meta_description: 'Schedule your free product demonstration',
      keywords: ['demo', 'product', 'free trial']
    }),
    status: 'published'
  })
});

// Landing page is now live at: /api/marketing/landing-pages/request-demo
```

### Example 3: Create a Customer Segment

```typescript
const segmentResponse = await fetch('/api/marketing/segments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Active Enterprise Customers',
    description: 'Enterprise customers with recent activity',
    segment_type: 'firmographic',
    criteria: JSON.stringify({
      company_size: { gte: 100 },
      customer_status: 'active',
      last_order_days: { lte: 90 }
    }),
    status: 'active'
  })
});
```

### Example 4: Track Campaign Performance

```typescript
// Add campaign metrics
await fetch('/api/marketing/campaign-metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaign_id: 'camp-uuid',
    metric_date: '2025-06-01',
    impressions: 10000,
    clicks: 500,
    opens: 2500,
    conversions: 25,
    leads_generated: 30,
    cost: 1000,
    revenue: 5000
  })
});

// Retrieve campaign metrics
const metricsResponse = await fetch('/api/marketing/campaigns/camp-uuid/metrics');
const metrics = await metricsResponse.json();

// Calculate ROI
metrics.data.forEach(m => {
  const roi = ((m.revenue - m.cost) / m.cost) * 100;
  console.log(`Date: ${m.metric_date}, ROI: ${roi}%`);
});
```

## Best Practices

### 1. Campaign Planning
- Set clear goals and KPIs before launching campaigns
- Define target audience segments upfront
- Plan budget allocation across channels
- Schedule campaigns to avoid overlap
- Set up tracking and attribution before launch

### 2. Data Quality
- Validate email addresses before sending
- Regularly clean and update segments
- Remove inactive subscribers
- Monitor bounce rates and spam complaints
- Ensure GDPR compliance for all data collection

### 3. Form Design
- Keep forms short and focused
- Only ask for essential information
- Use clear labels and placeholders
- Provide helpful validation messages
- Test forms on multiple devices

### 4. Email Marketing
- Always include unsubscribe links
- Personalize subject lines and content
- A/B test email variants
- Optimize for mobile devices
- Monitor deliverability metrics

### 5. Landing Pages
- Have a single, clear call-to-action
- Optimize page load speed
- Use compelling headlines and visuals
- Include social proof (testimonials, stats)
- Track and optimize conversion rates

### 6. Segmentation
- Create segments based on behavior, not just demographics
- Regularly review and update segment criteria
- Test segment performance
- Avoid over-segmentation
- Document segment definitions

### 7. Lead Scoring
- Start simple, iterate based on results
- Include both explicit and implicit signals
- Regularly review and adjust scoring rules
- Set appropriate thresholds for routing
- Track scoring accuracy and adjust models

### 8. Analytics
- Set up conversion tracking on all campaigns
- Use consistent UTM parameters
- Regularly review attribution models
- Compare actual vs. predicted performance
- Document assumptions and methodologies

### 9. Automation
- Test workflows before activation
- Monitor workflow execution regularly
- Set up error notifications
- Have fallback paths for edge cases
- Document workflow logic

### 10. Compliance
- Always obtain explicit consent for marketing
- Provide easy opt-out mechanisms
- Honor unsubscribe requests immediately
- Maintain audit trails
- Regular compliance reviews

## Performance Optimization

### Database Indexes
All relevant indexes are created automatically by the migration scripts:
- Campaign status and type for filtering
- Form and landing page status
- Event dates for date-range queries
- Touchpoint timestamps for analytics
- Customer/lead foreign keys for joins

### Caching Strategies
- Cache frequently accessed segments
- Cache campaign metrics for dashboards
- Use Redis for real-time counters
- Invalidate caches on updates

### Batch Processing
- Process form submissions asynchronously
- Batch email sends
- Schedule metric calculations off-peak
- Use queues for heavy operations

## Security Considerations

1. **Input Validation**: All inputs are validated using Zod schemas
2. **SQL Injection Prevention**: Parameterized queries throughout
3. **XSS Protection**: Sanitize user-generated content in forms and landing pages
4. **Rate Limiting**: Implement rate limits on public endpoints (form submissions)
5. **GDPR Compliance**: Track consent, provide data export/deletion capabilities
6. **Access Control**: Implement role-based access for sensitive operations

## Future Enhancements

- AI-powered content recommendations
- Advanced predictive analytics
- Social listening integration
- Marketing attribution modeling improvements
- Multi-language support for campaigns
- Advanced email template builder
- Real-time personalization engine
- Integration with external marketing platforms
- Advanced reporting and dashboards

## Support

For issues or questions:
- Check the API documentation
- Review the database schema
- Examine the router implementation
- Contact the development team

## License

SPDX-License-Identifier: MIT
