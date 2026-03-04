# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-grade Vue 3 merchant admin system built with TypeScript, providing comprehensive e-commerce management capabilities including product management, order processing, store decoration, financial settlement, and marketing campaigns.

## Technology Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Ant Design Vue 4.x
- **Routing**: Vue Router 4.x with role-based access control
- **Charts**: AntV G2Plot
- **Mocking**: MSW (Mock Service Worker) for local development
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## Common Commands

```bash
# Development
npm run dev                  # Start development server on port 5173

# Code Quality
npm run lint:fix             # Run ESLint and auto-fix issues
npm run typecheck            # Run TypeScript type checking
npm run format               # Format code with Prettier

# Build
npm run build                # Type-check and build for production
npm run preview              # Preview production build locally
```

## Architecture

### Core Structure

- **`src/pages/`** - Route-level page components (40+ pages)
- **`src/components/`** - Reusable components organized by feature domain:
  - `create-product/` - Multi-step product creation wizard
  - `decor/` - Visual store decoration engine components
  - `products/` - Product list and filtering components
  - `order-detail/`, `orders/` - Order management components
  - Shared components: `ProTable.vue`, `AssetPicker.vue`, `TableWrapper.vue`
- **`src/composables/`** - Vue 3 composition functions for reusable logic:
  - `useCreateProductWizard.ts` - Product creation wizard state management
  - `useCreateProductAutoSave.ts` - Auto-save functionality for product forms
  - `useDecorBuilder.ts` - Store decoration builder logic
- **`src/utils/`** - Utility functions and helpers:
  - `auth.ts` - Authentication utilities (token, role management)
  - `request.ts` - HTTP client wrapper
  - `statusConfig.ts` - Order/product status configurations
  - `useListPageState.ts` - List page state management helper
- **`src/api/`** - API client and endpoint definitions
- **`src/router/`** - Route configuration with authentication guards
- **`src/types/`** - TypeScript type definitions by domain
- **`src/mock/`** - MSW mock handlers for local development
- **`src/mocks/`** - MSW browser worker setup

### Key Patterns

#### API Layer

The project uses a custom fetch wrapper (`src/api/client.ts`) with:

- Automatic Bearer token authentication
- 401 handling with redirect to login
- Standardized response format: `{ code: number, message: string, data: T }`

Example:

```typescript
import { request } from '@/api/client'
const data = await request<Product>('/api/products/123')
```

#### Mock Development

Enable MSW by setting `VITE_USE_MSW=true` in `.env`. Mocks are defined in `src/mock/` and automatically intercept matching requests.

#### Routing & Authentication

Routes use meta fields for access control:

- `requiresAuth: true` - Requires valid token
- `roles: ['admin', 'finance']` - Role-based access control
- Route guards in `src/router/index.ts` validate authentication and roles before navigation

#### State Management

- Simple state: Use `ref()` or `reactive()` within components
- Reusable logic: Extract to composables in `src/composables/`
- No global state management library (Vuex/Pinia) - prefer composition and props

#### Component Architecture

- **Page components** in `src/pages/` handle route-level concerns
- **Feature components** in `src/components/[feature]/` for complex UI domains
- **Shared components** in `src/components/` for cross-cutting UI elements
- Always define TypeScript interfaces for props and API responses in `src/types/`

#### ProTable Pattern

The `ProTable.vue` component provides a standardized table interface with:

- Built-in column configuration
- Pagination support
- Loading states
- Empty state handling
- Column visibility settings

### Development Standards

From README.md:

- **Componentization**: Break complex components into smaller functional units
- **Type Safety**: Define TypeScript interfaces for all API responses and business objects
- **State Management**: Use `reactive`/`ref` for simple state, consider composables for complex cross-component state
- **Mock First**: Define mock endpoints in `src/mock/` before developing new features

### Feature Modules

#### Product Creation Wizard

A multi-step form system in `src/components/create-product/` with:

- Auto-save functionality
- Complex SKU (specification) management
- Media asset management
- Validation logic in `useCreateProductValidation.ts`

#### Store Decoration Engine

Visual drag-and-drop builder in `src/components/decor/` for:

- Mobile storefront customization
- Component-based page building
- Real-time preview with `useDecorPreview.ts`
- Builder logic in `useDecorBuilder.ts`

#### Order Management

Comprehensive order processing including:

- Order list and detail views
- Shipping management
- After-sales/refund center
- Print shipping labels functionality

### Environment Variables

```bash
VITE_API_BASE_URL=          # API base URL (empty for same-origin)
VITE_USE_MSW=false          # Enable MSW mocking (true/false)
```

### Code Quality

The project uses:

- ESLint with TypeScript and Vue plugins
- Prettier for code formatting
- Husky for git hooks
- lint-staged for pre-commit checks

Run `npm run lint:fix` before committing to auto-fix linting issues.
