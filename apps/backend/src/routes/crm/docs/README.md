# CRM (Customer Relationship Management) Module

Comprehensive customer relationship management system for managing customers, contacts, sales opportunities, and activities.

## Features

- **Customer Management**: Complete customer lifecycle management with status tracking
- **Contact Management**: Individual contacts within customer accounts
- **Opportunity Tracking**: Sales pipeline and opportunity management
- **Activity Logging**: Calls, meetings, emails, tasks, and demos
- **Sales Analytics**: Statistics and metrics for business insights

## Database Schema

### Customers Table (`crm_customers`)

```sql
CREATE TABLE crm_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  status TEXT DEFAULT 'prospect',        -- 'active' | 'inactive' | 'prospect' | 'archived'
  category TEXT,
  industry TEXT,
  website TEXT,
  tax_id TEXT,
  notes TEXT,
  assigned_to TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_customers_status` on `status`
- `idx_customers_category` on `category`
- `idx_customers_assigned` on `assigned_to`
- `idx_customers_email` on `email`

### Contacts Table (`crm_contacts`)

```sql
CREATE TABLE crm_contacts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  position TEXT,
  department TEXT,
  is_primary INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE
);
```

**Indexes:**

- `idx_contacts_customer` on `customer_id`
- `idx_contacts_primary` on `is_primary`
- `idx_contacts_email` on `email`

### Opportunities Table (`crm_opportunities`)

```sql
CREATE TABLE crm_opportunities (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  contact_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  value REAL DEFAULT 0,
  probability INTEGER DEFAULT 50,        -- 0-100%
  status TEXT DEFAULT 'open',            -- 'open' | 'won' | 'lost' | 'cancelled'
  stage TEXT DEFAULT 'lead',             -- 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed'
  expected_close_date TEXT,
  actual_close_date TEXT,
  assigned_to TEXT,
  source TEXT,
  competitors TEXT,
  next_step TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL
);
```

**Indexes:**

- `idx_opportunities_customer` on `customer_id`
- `idx_opportunities_status` on `status`
- `idx_opportunities_stage` on `stage`
- `idx_opportunities_assigned` on `assigned_to`

### Activities Table (`crm_activities`)

```sql
CREATE TABLE crm_activities (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  contact_id TEXT,
  opportunity_id TEXT,
  type TEXT NOT NULL,                    -- 'call' | 'meeting' | 'email' | 'task' | 'note' | 'demo'
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',         -- 'planned' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_at TEXT,
  completed_at TEXT,
  duration_minutes INTEGER,
  assigned_to TEXT,
  outcome TEXT,                          -- 'positive' | 'neutral' | 'negative' | 'no_response'
  location TEXT,
  attendees TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES crm_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (opportunity_id) REFERENCES crm_opportunities(id) ON DELETE SET NULL
);
```

**Indexes:**

- `idx_activities_customer` on `customer_id`
- `idx_activities_contact` on `contact_id`
- `idx_activities_opportunity` on `opportunity_id`
- `idx_activities_type` on `type`
- `idx_activities_status` on `status`
- `idx_activities_scheduled` on `scheduled_at`

## API Endpoints

### Customers

#### `GET /api/crm/customers`

List customers with filtering.

**Query Parameters:**

- `status` (optional): Filter by status (active, inactive, prospect, archived)
- `search` (optional): Search in name, email, company
- `category` (optional): Filter by category
- `industry` (optional): Filter by industry
- `assignedTo` (optional): Filter by assigned user
- `limit` (default: 50): Results per page
- `offset` (default: 0): Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cust-uuid",
      "name": "ACME Corporation",
      "email": "contact@acme.com",
      "phone": "+49 123 456789",
      "company": "ACME Corp",
      "address": "Main Street 123",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "Germany",
      "status": "active",
      "category": "enterprise",
      "industry": "Manufacturing",
      "website": "https://acme.com",
      "taxId": "DE123456789",
      "notes": "Key account",
      "assignedTo": "user-123",
      "createdBy": "admin",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}
```

#### `GET /api/crm/customers/:id`

Get customer by ID.

#### `POST /api/crm/customers`

Create a new customer.

**Request Body:**

```json
{
  "name": "ACME Corporation",
  "email": "contact@acme.com",
  "phone": "+49 123 456789",
  "company": "ACME Corp",
  "address": "Main Street 123",
  "city": "Berlin",
  "postalCode": "10115",
  "country": "Germany",
  "status": "prospect",
  "category": "enterprise",
  "industry": "Manufacturing",
  "website": "https://acme.com",
  "taxId": "DE123456789",
  "notes": "Contacted via trade show",
  "assignedTo": "user-123",
  "createdBy": "admin"
}
```

#### `PUT /api/crm/customers/:id`

Update customer information.

#### `DELETE /api/crm/customers/:id`

Delete a customer.

### Contacts

#### `GET /api/crm/contacts`

List contacts.

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `search` (optional): Search in name, email
- `isPrimary` (optional): Filter primary contacts
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "contact-uuid",
      "customerId": "cust-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@acme.com",
      "phone": "+49 123 456789",
      "mobile": "+49 170 1234567",
      "position": "CTO",
      "department": "IT",
      "isPrimary": true,
      "notes": "Technical decision maker",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 25 }
}
```

#### `GET /api/crm/contacts/:id`

Get contact by ID.

#### `POST /api/crm/contacts`

Create a new contact.

**Request Body:**

```json
{
  "customerId": "cust-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "+49 123 456789",
  "mobile": "+49 170 1234567",
  "position": "CTO",
  "department": "IT",
  "isPrimary": true,
  "notes": "Technical decision maker"
}
```

#### `PUT /api/crm/contacts/:id`

Update contact information.

#### `DELETE /api/crm/contacts/:id`

Delete a contact.

### Opportunities

#### `GET /api/crm/opportunities`

List opportunities.

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `status` (optional): Filter by status (open, won, lost, cancelled)
- `stage` (optional): Filter by stage (lead, qualified, proposal, negotiation, closed)
- `assignedTo` (optional): Filter by assigned user
- `minValue` (optional): Minimum opportunity value
- `maxValue` (optional): Maximum opportunity value
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "opp-uuid",
      "customerId": "cust-uuid",
      "contactId": "contact-uuid",
      "title": "ERP System Implementation",
      "description": "Full ERP system rollout",
      "value": 150000,
      "probability": 75,
      "status": "open",
      "stage": "proposal",
      "expectedCloseDate": "2025-03-31T00:00:00Z",
      "actualCloseDate": null,
      "assignedTo": "sales-rep-123",
      "source": "trade_show",
      "competitors": "SAP, Oracle",
      "nextStep": "Send proposal",
      "notes": "High priority deal",
      "createdBy": "admin",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 45 }
}
```

#### `GET /api/crm/opportunities/:id`

Get opportunity by ID.

#### `POST /api/crm/opportunities`

Create an opportunity.

**Request Body:**

```json
{
  "customerId": "cust-uuid",
  "contactId": "contact-uuid",
  "title": "ERP System Implementation",
  "description": "Full ERP system rollout",
  "value": 150000,
  "probability": 75,
  "status": "open",
  "stage": "proposal",
  "expectedCloseDate": "2025-03-31T00:00:00Z",
  "assignedTo": "sales-rep-123",
  "source": "trade_show",
  "competitors": "SAP, Oracle",
  "nextStep": "Send proposal",
  "notes": "High priority deal",
  "createdBy": "admin"
}
```

#### `PUT /api/crm/opportunities/:id`

Update opportunity.

#### `DELETE /api/crm/opportunities/:id`

Delete an opportunity.

### Activities

#### `GET /api/crm/activities`

List activities.

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `contactId` (optional): Filter by contact
- `opportunityId` (optional): Filter by opportunity
- `type` (optional): Filter by type (call, meeting, email, task, note, demo)
- `status` (optional): Filter by status (planned, in_progress, completed, cancelled)
- `assignedTo` (optional): Filter by assigned user
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-uuid",
      "customerId": "cust-uuid",
      "contactId": "contact-uuid",
      "opportunityId": "opp-uuid",
      "type": "meeting",
      "subject": "Product Demo",
      "description": "Demonstrate ERP features",
      "status": "completed",
      "scheduledAt": "2025-01-15T14:00:00Z",
      "completedAt": "2025-01-15T15:30:00Z",
      "durationMinutes": 90,
      "assignedTo": "sales-rep-123",
      "outcome": "positive",
      "location": "Customer Office",
      "attendees": "John Doe, Jane Smith",
      "notes": "Great interest in automation features",
      "createdBy": "admin",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T16:00:00Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 234 }
}
```

#### `GET /api/crm/activities/:id`

Get activity by ID.

#### `POST /api/crm/activities`

Create an activity.

**Request Body:**

```json
{
  "customerId": "cust-uuid",
  "contactId": "contact-uuid",
  "opportunityId": "opp-uuid",
  "type": "meeting",
  "subject": "Product Demo",
  "description": "Demonstrate ERP features",
  "status": "planned",
  "scheduledAt": "2025-01-20T14:00:00Z",
  "durationMinutes": 60,
  "assignedTo": "sales-rep-123",
  "location": "Customer Office",
  "attendees": "John Doe, Jane Smith",
  "notes": "Prepare demo environment",
  "createdBy": "admin"
}
```

#### `PUT /api/crm/activities/:id`

Update activity.

#### `DELETE /api/crm/activities/:id`

Delete an activity.

### Statistics

#### `GET /api/crm/stats`

Get CRM statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "customers": {
      "total": 150,
      "active": 120,
      "inactive": 10,
      "prospect": 15,
      "archived": 5
    },
    "contacts": {
      "total": 300,
      "primary": 150
    },
    "opportunities": {
      "total": 45,
      "open": 30,
      "won": 10,
      "lost": 5,
      "totalValue": 2500000,
      "avgValue": 55555.56,
      "avgProbability": 62.5
    },
    "activities": {
      "total": 500,
      "planned": 50,
      "completed": 400,
      "thisMonth": 75
    }
  }
}
```

## Frontend Integration

### TypeScript Types

```typescript
// types/crm.ts
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  status: "active" | "inactive" | "prospect" | "archived";
  category?: string;
  industry?: string;
  website?: string;
  taxId?: string;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  contactId?: string;
  title: string;
  description?: string;
  value: number;
  probability: number;
  status: "open" | "won" | "lost" | "cancelled";
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed";
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedTo?: string;
  source?: string;
  competitors?: string;
  nextStep?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
  type: "call" | "meeting" | "email" | "task" | "note" | "demo";
  subject: string;
  description?: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  scheduledAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  assignedTo?: string;
  outcome?: "positive" | "neutral" | "negative" | "no_response";
  location?: string;
  attendees?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### API Client

```typescript
// services/crmApi.ts
import axios from "axios";
import type { Customer, Contact, Opportunity, Activity } from "@/types/crm";

const API_BASE = "/api/crm";

export const crmApi = {
  // Customers
  async getCustomers(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Customer[] }>(
      `${API_BASE}/customers`,
      { params },
    );
    return data;
  },

  async getCustomerById(id: string) {
    const { data } = await axios.get<{ success: boolean; data: Customer }>(
      `${API_BASE}/customers/${id}`,
    );
    return data;
  },

  async createCustomer(customer: Partial<Customer>) {
    const { data } = await axios.post<{ success: boolean; data: Customer }>(
      `${API_BASE}/customers`,
      customer,
    );
    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data } = await axios.put<{ success: boolean; data: Customer }>(
      `${API_BASE}/customers/${id}`,
      updates,
    );
    return data;
  },

  async deleteCustomer(id: string) {
    const { data } = await axios.delete(`${API_BASE}/customers/${id}`);
    return data;
  },

  // Contacts
  async getContacts(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Contact[] }>(
      `${API_BASE}/contacts`,
      { params },
    );
    return data;
  },

  async getContactById(id: string) {
    const { data } = await axios.get<{ success: boolean; data: Contact }>(
      `${API_BASE}/contacts/${id}`,
    );
    return data;
  },

  async createContact(contact: Partial<Contact>) {
    const { data } = await axios.post<{ success: boolean; data: Contact }>(
      `${API_BASE}/contacts`,
      contact,
    );
    return data;
  },

  async updateContact(id: string, updates: Partial<Contact>) {
    const { data } = await axios.put<{ success: boolean; data: Contact }>(
      `${API_BASE}/contacts/${id}`,
      updates,
    );
    return data;
  },

  async deleteContact(id: string) {
    const { data } = await axios.delete(`${API_BASE}/contacts/${id}`);
    return data;
  },

  // Opportunities
  async getOpportunities(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Opportunity[] }>(
      `${API_BASE}/opportunities`,
      { params },
    );
    return data;
  },

  async getOpportunityById(id: string) {
    const { data } = await axios.get<{ success: boolean; data: Opportunity }>(
      `${API_BASE}/opportunities/${id}`,
    );
    return data;
  },

  async createOpportunity(opportunity: Partial<Opportunity>) {
    const { data } = await axios.post<{ success: boolean; data: Opportunity }>(
      `${API_BASE}/opportunities`,
      opportunity,
    );
    return data;
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>) {
    const { data } = await axios.put<{ success: boolean; data: Opportunity }>(
      `${API_BASE}/opportunities/${id}`,
      updates,
    );
    return data;
  },

  async deleteOpportunity(id: string) {
    const { data } = await axios.delete(`${API_BASE}/opportunities/${id}`);
    return data;
  },

  // Activities
  async getActivities(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Activity[] }>(
      `${API_BASE}/activities`,
      { params },
    );
    return data;
  },

  async getActivityById(id: string) {
    const { data } = await axios.get<{ success: boolean; data: Activity }>(
      `${API_BASE}/activities/${id}`,
    );
    return data;
  },

  async createActivity(activity: Partial<Activity>) {
    const { data } = await axios.post<{ success: boolean; data: Activity }>(
      `${API_BASE}/activities`,
      activity,
    );
    return data;
  },

  async updateActivity(id: string, updates: Partial<Activity>) {
    const { data } = await axios.put<{ success: boolean; data: Activity }>(
      `${API_BASE}/activities/${id}`,
      updates,
    );
    return data;
  },

  async deleteActivity(id: string) {
    const { data } = await axios.delete(`${API_BASE}/activities/${id}`);
    return data;
  },

  // Statistics
  async getStats() {
    const { data } = await axios.get(`${API_BASE}/stats`);
    return data;
  },
};
```

### React Query Hooks

```typescript
// hooks/useCRM.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/services/crmApi";
import type { Customer, Contact, Opportunity, Activity } from "@/types/crm";

// Customers
export function useCustomers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => crmApi.getCustomers(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => crmApi.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customer: Partial<Customer>) =>
      crmApi.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) =>
      crmApi.updateCustomer(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["customers", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

// Contacts
export function useContacts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () => crmApi.getContacts(params),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: Partial<Contact>) => crmApi.createContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

// Opportunities
export function useOpportunities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["opportunities", params],
    queryFn: () => crmApi.getOpportunities(params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunities", id],
    queryFn: () => crmApi.getOpportunityById(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opportunity: Partial<Opportunity>) =>
      crmApi.createOpportunity(opportunity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Opportunity>;
    }) => crmApi.updateOpportunity(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["opportunities", id] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

// Activities
export function useActivities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => crmApi.getActivities(params),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activity: Partial<Activity>) =>
      crmApi.createActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["crm-stats"] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Activity> }) =>
      crmApi.updateActivity(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["activities", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

// Statistics
export function useCRMStats() {
  return useQuery({
    queryKey: ["crm-stats"],
    queryFn: () => crmApi.getStats(),
    staleTime: 60000, // Cache for 1 minute
  });
}
```

### Component Examples

#### Customer List

```tsx
// components/CustomerList.tsx
import { useCustomers, useUpdateCustomer } from "@/hooks/useCRM";

export function CustomerList() {
  const { data: customersData, isLoading } = useCustomers({ status: "active" });
  const updateCustomer = useUpdateCustomer();

  const handleStatusChange = async (id: string, status: Customer["status"]) => {
    await updateCustomer.mutateAsync({ id, updates: { status } });
  };

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <div className="customer-list">
      {customersData?.data.map((customer) => (
        <div key={customer.id} className="customer-card">
          <div className="customer-header">
            <h3>{customer.name}</h3>
            <span className={`status-badge ${customer.status}`}>
              {customer.status}
            </span>
          </div>
          <div className="customer-info">
            <p>
              <strong>Company:</strong> {customer.company}
            </p>
            <p>
              <strong>Email:</strong> {customer.email}
            </p>
            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>
            <p>
              <strong>Industry:</strong> {customer.industry}
            </p>
          </div>
          <div className="customer-actions">
            <button onClick={() => handleStatusChange(customer.id, "active")}>
              Activate
            </button>
            <button onClick={() => handleStatusChange(customer.id, "archived")}>
              Archive
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Opportunity Pipeline

```tsx
// components/OpportunityPipeline.tsx
import { useOpportunities } from "@/hooks/useCRM";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed"];

export function OpportunityPipeline() {
  const { data: opportunitiesData } = useOpportunities({ status: "open" });

  const opportunitiesByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage] =
        opportunitiesData?.data.filter((opp) => opp.stage === stage) || [];
      return acc;
    },
    {} as Record<string, Opportunity[]>,
  );

  return (
    <div className="pipeline">
      {STAGES.map((stage) => (
        <div key={stage} className="pipeline-stage">
          <h3>{stage.toUpperCase()}</h3>
          <div className="stage-value">
            $
            {opportunitiesByStage[stage]
              .reduce((sum, opp) => sum + opp.value, 0)
              .toLocaleString()}
          </div>
          <div className="opportunities">
            {opportunitiesByStage[stage].map((opp) => (
              <div key={opp.id} className="opportunity-card">
                <div className="opp-title">{opp.title}</div>
                <div className="opp-value">${opp.value.toLocaleString()}</div>
                <div className="opp-probability">{opp.probability}%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Activity Timeline

```tsx
// components/ActivityTimeline.tsx
import { useActivities } from "@/hooks/useCRM";
import { format } from "date-fns";

export function ActivityTimeline({ customerId }: { customerId?: string }) {
  const { data: activitiesData } = useActivities({
    customerId,
    limit: 20,
  });

  return (
    <div className="activity-timeline">
      {activitiesData?.data.map((activity) => (
        <div key={activity.id} className="timeline-item">
          <div className={`activity-icon ${activity.type}`}>
            {activity.type === "call" && "📞"}
            {activity.type === "meeting" && "👥"}
            {activity.type === "email" && "📧"}
            {activity.type === "task" && "✓"}
          </div>
          <div className="activity-content">
            <div className="activity-header">
              <span className="activity-subject">{activity.subject}</span>
              <span className="activity-time">
                {format(
                  new Date(activity.scheduledAt || activity.createdAt),
                  "PPp",
                )}
              </span>
            </div>
            <div className="activity-description">{activity.description}</div>
            {activity.outcome && (
              <span className={`outcome-badge ${activity.outcome}`}>
                {activity.outcome}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### CRM Stats Dashboard

```tsx
// components/CRMStatsDashboard.tsx
import { useCRMStats } from "@/hooks/useCRM";

export function CRMStatsDashboard() {
  const { data: stats } = useCRMStats();

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="crm-stats-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Customers</h3>
          <div className="stat-value">{stats.data.customers.total}</div>
          <div className="stat-breakdown">
            <div className="stat-item">
              <span className="label">Active:</span>
              <span className="value">{stats.data.customers.active}</span>
            </div>
            <div className="stat-item">
              <span className="label">Prospects:</span>
              <span className="value">{stats.data.customers.prospect}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Opportunities</h3>
          <div className="stat-value">{stats.data.opportunities.total}</div>
          <div className="stat-breakdown">
            <div className="stat-item">
              <span className="label">Open:</span>
              <span className="value">{stats.data.opportunities.open}</span>
            </div>
            <div className="stat-item">
              <span className="label">Total Value:</span>
              <span className="value">
                ${stats.data.opportunities.totalValue.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="label">Avg Probability:</span>
              <span className="value">
                {stats.data.opportunities.avgProbability.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Activities</h3>
          <div className="stat-value">{stats.data.activities.total}</div>
          <div className="stat-breakdown">
            <div className="stat-item">
              <span className="label">This Month:</span>
              <span className="value">{stats.data.activities.thisMonth}</span>
            </div>
            <div className="stat-item">
              <span className="label">Completed:</span>
              <span className="value">{stats.data.activities.completed}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Contacts</h3>
          <div className="stat-value">{stats.data.contacts.total}</div>
          <div className="stat-breakdown">
            <div className="stat-item">
              <span className="label">Primary:</span>
              <span className="value">{stats.data.contacts.primary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Best Practices

### Customer Management

1. **Status Workflow**: prospect → active → inactive → archived
2. **Deduplication**: Check email/company before creating new customers
3. **Assignment**: Always assign customers to account managers
4. **Data Quality**: Require minimum fields (name, email/phone, status)

### Contact Management

1. **Primary Contact**: Mark one contact as primary per customer
2. **Cascading Delete**: Contacts are deleted when customer is deleted
3. **Email Validation**: Validate email format on frontend and backend
4. **Role Clarity**: Use position/department to identify decision makers

### Opportunity Management

1. **Stage Progression**: Lead → Qualified → Proposal → Negotiation → Closed
2. **Probability Guidelines**: Lead (10%), Qualified (25%), Proposal (50%), Negotiation (75%), Closed (100%)
3. **Close Dates**: Update expected_close_date as opportunity progresses
4. **Value Tracking**: Update value as scope changes

### Activity Management

1. **Linking**: Always link activities to customer, contact, or opportunity
2. **Scheduling**: Set scheduledAt for future activities
3. **Completion**: Mark status as completed and set completedAt
4. **Outcomes**: Track outcome for meetings and calls

### Performance

1. **Pagination**: Always use limit/offset for large datasets
2. **Filtering**: Filter on backend, not frontend
3. **Caching**: Use React Query staleTime for stats
4. **Indexes**: Leverage database indexes for fast queries

### Security

1. **Input Validation**: All inputs validated with Zod schemas
2. **SQL Injection**: Parameterized queries with SqlValue types
3. **Access Control**: Implement user-based permissions
4. **Data Privacy**: Respect GDPR for customer data

---

**Last Updated:** 2025-12-20  
**Version:** 2.0  
**Database:** SQLite  
**Documentation:** Complete with frontend integration guide
