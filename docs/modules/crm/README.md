# CRM (Customer Relationship Management) Module

## Overview

The CRM module provides comprehensive customer relationship management functionality for managing customers, contacts, opportunities, activities, and interaction tracking.

## Features

- **Customer Management**: Track customer information, status, and categorization
- **Contact Management**: Manage individual contacts within customer accounts
- **Opportunity Tracking**: Monitor sales opportunities and pipeline
- **Activity Logging**: Record interactions, meetings, calls, and tasks
- **Sales Funnel**: Track leads through conversion stages

## API Endpoints

### Customers

#### `GET /api/crm/customers`

List all customers with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by customer status (active, inactive, prospect)
- `search` (optional): Search customers by name, email, or company
- `category` (optional): Filter by customer category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+49 123 456789",
      "company": "Company GmbH",
      "status": "active",
      "category": "enterprise",
      "created_at": "2025-12-19T10:00:00Z",
      "updated_at": "2025-12-19T10:00:00Z"
    }
  ]
}
```

#### `POST /api/crm/customers`

Create a new customer.

**Request Body:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+49 123 456789",
  "company": "Company GmbH",
  "address": "Street 123, 12345 City",
  "status": "prospect",
  "category": "enterprise",
  "notes": "Important client"
}
```

#### `GET /api/crm/customers/:id`

Get detailed customer information.

#### `PUT /api/crm/customers/:id`

Update customer information.

#### `DELETE /api/crm/customers/:id`

Delete a customer (soft delete recommended).

### Contacts

#### `GET /api/crm/contacts`

List all contacts with optional filtering.

**Query Parameters:**
- `customerId` (optional): Filter contacts by customer
- `search` (optional): Search contacts by name or email

#### `POST /api/crm/contacts`

Create a new contact.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+49 123 456789",
  "position": "CTO",
  "department": "IT",
  "isPrimary": true
}
```

#### `GET /api/crm/contacts/:id`

Get contact details.

#### `PUT /api/crm/contacts/:id`

Update contact information.

#### `DELETE /api/crm/contacts/:id`

Delete a contact.

### Opportunities

#### `GET /api/crm/opportunities`

List all sales opportunities.

**Query Parameters:**
- `status` (optional): Filter by opportunity status
- `stage` (optional): Filter by sales funnel stage
- `customerId` (optional): Filter by customer

#### `POST /api/crm/opportunities`

Create a new opportunity.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "title": "Software Implementation",
  "description": "ERP system implementation project",
  "value": 50000.00,
  "probability": 75,
  "stage": "proposal",
  "expectedCloseDate": "2025-12-31",
  "assignedTo": "sales-rep-id"
}
```

#### `GET /api/crm/opportunities/:id`

Get opportunity details.

#### `PUT /api/crm/opportunities/:id`

Update opportunity information.

#### `DELETE /api/crm/opportunities/:id`

Delete an opportunity.

### Activities

#### `GET /api/crm/activities`

List all activities and interactions.

**Query Parameters:**
- `customerId` (optional): Filter by customer
- `type` (optional): Filter by activity type (call, meeting, email, task)
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

#### `POST /api/crm/activities`

Log a new activity.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "contactId": "contact-uuid",
  "type": "meeting",
  "subject": "Project Discussion",
  "description": "Discussed project requirements",
  "date": "2025-12-19T14:00:00Z",
  "duration": 60,
  "outcome": "positive"
}
```

#### `GET /api/crm/activities/:id`

Get activity details.

#### `PUT /api/crm/activities/:id`

Update activity information.

#### `DELETE /api/crm/activities/:id`

Delete an activity.

### Statistics

#### `GET /api/crm/statistics`

Get CRM statistics and metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 150,
    "activeCustomers": 120,
    "prospects": 30,
    "totalOpportunities": 45,
    "totalOpportunityValue": 500000.00,
    "conversionRate": 32.5,
    "averageDealSize": 15000.00,
    "activitiesThisMonth": 234
  }
}
```

## Database Schema

### `crm_customers`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `email` (TEXT)
- `phone` (TEXT)
- `company` (TEXT)
- `address` (TEXT)
- `status` (TEXT CHECK: active, inactive, prospect)
- `category` (TEXT)
- `notes` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `crm_contacts`
- `id` (TEXT PRIMARY KEY)
- `customer_id` (TEXT FOREIGN KEY)
- `first_name` (TEXT NOT NULL)
- `last_name` (TEXT NOT NULL)
- `email` (TEXT)
- `phone` (TEXT)
- `position` (TEXT)
- `department` (TEXT)
- `is_primary` (INTEGER)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `crm_opportunities`
- `id` (TEXT PRIMARY KEY)
- `customer_id` (TEXT FOREIGN KEY)
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `value` (REAL)
- `probability` (INTEGER)
- `stage` (TEXT)
- `status` (TEXT)
- `expected_close_date` (TEXT)
- `assigned_to` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `crm_activities`
- `id` (TEXT PRIMARY KEY)
- `customer_id` (TEXT FOREIGN KEY)
- `contact_id` (TEXT FOREIGN KEY)
- `type` (TEXT CHECK: call, meeting, email, task)
- `subject` (TEXT NOT NULL)
- `description` (TEXT)
- `date` (TEXT)
- `duration` (INTEGER)
- `outcome` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)

## Error Handling

The module uses standardized error handling with the following error types:
- `ValidationError`: Invalid input data (400)
- `NotFoundError`: Resource not found (404)
- `BadRequestError`: Invalid request (400)
- `InternalServerError`: Server errors (500)

All responses follow the standard format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  }
}
```

## Integration Points

- **Sales Module**: Opportunity tracking and conversion
- **Finance Module**: Customer invoicing and payment tracking
- **Documents Module**: Customer document management
- **Communication Module**: Email and communication tracking

## Future Enhancements

- [ ] Email campaign integration
- [ ] Customer segmentation
- [ ] Predictive analytics
- [ ] Sales forecasting
- [ ] Lead scoring
- [ ] Customer lifetime value calculation
- [ ] Integration with external CRM platforms

## Related Documentation

- [API Documentation](../../../../docs/modules/crm/README.md)
- [Database Schema](../../../../docs/reference/database-schema.md)
- [Error Handling Guide](../../../../docs/ERROR_STANDARDIZATION_GUIDE.md)

## Version History

- **v0.3.0** (2025-12-19): Initial CRM implementation
