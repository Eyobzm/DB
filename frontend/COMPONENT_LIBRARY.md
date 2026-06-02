# CFMS Component Library Guide

## Overview

This document provides a comprehensive guide to the CFMS shared component library and layout system. All components use **Tailwind CSS only** with no external component libraries (except icons from Lucide).

## Table of Contents

1. [Layout Components](#layout-components)
2. [UI Components](#ui-components)
3. [Usage Examples](#usage-examples)
4. [Responsive Design](#responsive-design)
5. [Accessibility](#accessibility)

---

## Layout Components

### AppShell

The main layout container that wraps all authenticated pages with a sidebar and top bar.

**Features:**
- Collapsible sidebar (240px on desktop, full-width on mobile)
- Fixed top bar with user info
- Responsive mobile overlay
- Smooth transitions

**Location:** `components/Layout/AppShell.jsx`

**Usage:**
```jsx
import { AppShell } from './components/Layout';

// Automatically used by ProtectedRoute
export function MyPage() {
  return <ProtectedRoute><MyContent /></ProtectedRoute>;
}
```

### ProtectedRoute

Wrapper component that:
- Checks JWT authentication
- Redirects to `/login` if not authenticated
- Wraps children with AppShell layout

**Location:** `components/Layout/ProtectedRoute.jsx`

**Usage:**
```jsx
import { ProtectedRoute } from './components/Layout';

// In App.jsx routes:
<Route
  path="/equipment"
  element={
    <ProtectedRoute>
      <EquipmentList />
    </ProtectedRoute>
  }
/>
```

### Sidebar

Left navigation menu with Lucide icons for all CFMS modules.

**Navigation Items:**
- Dashboard (LayoutDashboard icon)
- Equipment (Wrench icon)
- Sites (MapPin icon)
- Staff (Users icon)
- Maintenance (Briefcase icon)
- Activity Logs (Activity icon)
- Finance (DollarSign icon)
- Vendors (Truck icon)
- Inventory (Package icon)
- Logout (LogOut icon)

**Features:**
- Active route highlighting (blue background)
- Collapsible on mobile
- Logout button at bottom

**Location:** `components/Layout/Sidebar.jsx`

### TopBar

Top navigation bar displaying:
- Sidebar toggle button (mobile)
- Application title (desktop)
- Logged-in user name and role badge
- User avatar

**Role Badge Colors:**
- Admin: Red
- Accountant: Green
- Site_Manager: Blue
- Operator: Yellow
- Supervisor: Purple

**Location:** `components/Layout/TopBar.jsx`

---

## UI Components

### StatusBadge

Color-coded pill component for displaying statuses and priorities.

**Supported Statuses:**
- Equipment: `Available`, `In_Use`, `Under_Maintenance`, `Rented_Out`, `Retired`
- Maintenance: `Scheduled`, `In_Progress`, `Completed`, `Overdue`, `Cancelled`
- Activity Logs: `Pending`, `Verified`, `Rejected`
- Finance: `Draft`, `Pending_Approval`, `Approved`, `Paid`, `Unpaid`, `Disbursed`
- Priority: `Critical`, `High`, `Medium`, `Low`

**Location:** `components/ui/StatusBadge.jsx`

**Usage:**
```jsx
import { StatusBadge } from './components/ui';

<StatusBadge status="In_Use" />
<StatusBadge status="Critical" />
<StatusBadge status="Approved" />
```

### DataTable

TanStack Table wrapper with built-in support for:
- Sorting (click column headers)
- Global search/filtering
- Pagination
- Responsive scrolling

**Location:** `components/ui/DataTable.jsx`

**Usage:**
```jsx
import { DataTable } from './components/ui';

const columns = [
  {
    accessorKey: 'equipment_id',
    header: 'Equipment ID',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
];

<DataTable
  columns={columns}
  data={equipmentList}
  pageSize={10}
  isLoading={isLoading}
  onRowClick={(row) => navigate(`/equipment/${row.equipment_id}`)}
/>
```

### FormField

Input wrapper with label, placeholder, and inline error message display.

**Features:**
- Integrated error display via Zod
- Required field indicator (*)
- Help text support
- Disabled state styling
- Red highlight for validation errors

**Location:** `components/ui/FormField.jsx`

**Usage:**
```jsx
import { FormField } from './components/ui';

<FormField
  label="Equipment Name"
  name="name"
  type="text"
  placeholder="Enter equipment name"
  value={formData.name}
  onChange={handleChange}
  error={errors.name}
  required
/>
```

### ConfirmDialog

Modal dialog for destructive actions (delete, disable, etc.).

**Features:**
- Alert icon for dangerous actions
- Customizable message and button labels
- Loading state during confirmation
- Prevents accidental destructive actions

**Location:** `components/ui/ConfirmDialog.jsx`

**Usage:**
```jsx
import { ConfirmDialog } from './components/ui';
import { useState } from 'react';

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  isOpen={showConfirm}
  title="Delete Equipment?"
  message="This action cannot be undone."
  isDangerous
  onConfirm={() => handleDelete()}
  onCancel={() => setShowConfirm(false)}
/>
```

### LoadingSpinner

Loading indicator for async operations (NFR032 compliance).

**Features:**
- Inline or full-screen modes
- Animated spinner
- Custom message support
- Used for all API calls

**Location:** `components/ui/LoadingSpinner.jsx`

**Usage:**
```jsx
import { LoadingSpinner } from './components/ui';

{isLoading ? (
  <LoadingSpinner message="Loading equipment..." />
) : (
  <DataTable columns={columns} data={data} />
)}

// Full screen during page load:
{isPageLoading && <LoadingSpinner fullScreen message="Loading dashboard..." />}
```

### PageHeader

Page title section with optional action button.

**Features:**
- Bold title
- Optional subtitle
- Action button (e.g., "Add New")
- Responsive layout

**Location:** `components/ui/PageHeader.jsx`

**Usage:**
```jsx
import { PageHeader } from './components/ui';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<PageHeader
  title="Equipment Management"
  subtitle="View and manage all fleet equipment"
  action={() => navigate('/equipment/new')}
  actionLabel="Add Equipment"
/>
```

---

## Usage Examples

### Complete Page Example

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/Layout';
import { 
  PageHeader, DataTable, StatusBadge, LoadingSpinner, ConfirmDialog 
} from './components/ui';
import { useEquipmentList } from './hooks/useEquipment';

export function EquipmentPage() {
  const navigate = useNavigate();
  const { data: equipmentList = [], isLoading } = useEquipmentList();
  const [selectedId, setSelectedId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  const columns = [
    { accessorKey: 'equipment_id', header: 'ID' },
    { accessorKey: 'equipment_name', header: 'Name' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'acquisition_cost',
      header: 'Cost',
      cell: ({ getValue }) => `$${getValue().toLocaleString()}`,
    },
  ];

  return (
    <ProtectedRoute>
      <PageHeader
        title="Equipment Management"
        subtitle="View and manage fleet equipment"
        action={() => navigate('/equipment/new')}
        actionLabel="Add Equipment"
      />

      {isLoading ? (
        <LoadingSpinner message="Loading equipment..." />
      ) : (
        <DataTable
          columns={columns}
          data={equipmentList}
          onRowClick={(row) => navigate(`/equipment/${row.equipment_id}`)}
        />
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Equipment"
        isDangerous
        onConfirm={() => handleDelete()}
        onCancel={() => setShowDelete(false)}
      />
    </ProtectedRoute>
  );
}
```

### Form Example

```jsx
import { FormField, PageHeader, LoadingSpinner, ConfirmDialog } from './components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function EquipmentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipmentSchema),
  });

  return (
    <ProtectedRoute>
      <PageHeader title="Add Equipment" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <FormField
          label="Equipment Name"
          {...register('equipment_name')}
          error={errors.equipment_name}
          required
        />

        <FormField
          label="Make & Model"
          {...register('make_model')}
          error={errors.make_model}
        />

        <FormField
          label="Acquisition Cost"
          type="number"
          {...register('acquisition_cost')}
          error={errors.acquisition_cost}
          required
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Save Equipment
          </button>
          <button type="button" onClick={() => navigate('/equipment')}>
            Cancel
          </button>
        </div>
      </form>
    </ProtectedRoute>
  );
}
```

---

## Responsive Design

All components follow mobile-first responsive design (NFR030):

### Breakpoints Used

- **Mobile:** `< 640px` (default)
- **Tablet:** `md: >= 768px`
- **Desktop:** `lg: >= 1024px`

### Key Responsive Features

1. **Sidebar:**
   - Mobile: Collapsible overlay
   - Desktop (lg): Fixed sidebar (240px)

2. **DataTable:**
   - Mobile: Horizontal scroll
   - Desktop: Full width with pagination

3. **Forms:**
   - Mobile: Single column
   - Desktop: Two-column layout (via custom components)

4. **Navigation:**
   - Mobile: Hamburger menu toggle
   - Desktop: Full breadcrumbs/sidebar

### Example Responsive Classes

```jsx
{/* Shows on tablet and up */}
<div className="hidden md:block">Desktop content</div>

{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

{/* Responsive padding */}
<div className="p-4 md:p-6">Content</div>
```

---

## Accessibility

### Keyboard Navigation

- Sidebar: Tab through items, Enter to navigate
- DataTable: Sortable columns (click or keyboard)
- Forms: Label associations, error announcements
- Buttons: All interactive elements keyboard-accessible

### Screen Readers

- `aria-label` on icon-only buttons
- `role` attributes where needed
- Error messages associated with inputs
- Status badges have semantic meaning

### Color Contrast

- All status badges meet WCAG AA standards
- Text on colored backgrounds has sufficient contrast
- Red/green not used alone (status badge labels included)

---

## Best Practices

1. **Always use ProtectedRoute** for authenticated pages
2. **Show LoadingSpinner** during all API calls
3. **Use StatusBadge** for all status/priority fields
4. **Wrap forms** with FormField components
5. **Use DataTable** for all data lists with >5 items
6. **Add PageHeader** to all main pages
7. **Use ConfirmDialog** for delete/disable actions
8. **Test on mobile** (768px width) during development

---

## File Locations

| Component | Location |
|-----------|----------|
| AppShell | `components/Layout/AppShell.jsx` |
| Sidebar | `components/Layout/Sidebar.jsx` |
| TopBar | `components/Layout/TopBar.jsx` |
| ProtectedRoute | `components/Layout/ProtectedRoute.jsx` |
| StatusBadge | `components/ui/StatusBadge.jsx` |
| DataTable | `components/ui/DataTable.jsx` |
| FormField | `components/ui/FormField.jsx` |
| ConfirmDialog | `components/ui/ConfirmDialog.jsx` |
| LoadingSpinner | `components/ui/LoadingSpinner.jsx` |
| PageHeader | `components/ui/PageHeader.jsx` |

---

## Dependencies

- `react`: ^18.3.1
- `react-router-dom`: ^6.22.0
- `@tanstack/react-table`: ^8.13.2
- `tailwindcss`: ^3.4.1
- `lucide-react`: ^0.344.0 (icons only)

No other UI libraries used!
