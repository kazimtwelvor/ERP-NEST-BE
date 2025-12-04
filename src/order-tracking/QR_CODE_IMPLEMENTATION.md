# QR Code Implementation Documentation

## Overview

This document describes the QR code implementation for order items. The system supports two approaches:

1. **QR Code URL** - Generates a URL that can be decoded on the frontend using an npm package
2. **QR Code Image** - Generates and stores QR code images in the database

## QR Code URL Pattern

All QR codes follow this URL pattern:
```
{FE_URL}/orders/{store_name}?orderItemId={orderItemId}
```

Examples:
- `http://localhost:3000/orders/fineyst-jackets?orderItemId=uuid-123`
- `http://localhost:3000/orders/pelle-pelle-jackets?orderItemId=uuid-456`

## Database Schema

The `order_items` table has been updated with the following fields:

```sql
qr_code VARCHAR(255) UNIQUE NULLABLE  -- Original QR code string (ORDER_ITEM_{id}_{hash})
qr_code_url TEXT NULLABLE             -- QR code URL for scanning
qr_code_image TEXT NULLABLE           -- Base64 encoded QR code image (optional)
```

## Backend Implementation

### Entity Updates

File: `ERP-NEST/src/order-tracking/entities/order-item.entity.ts`

Added fields:
- `qrCodeUrl: string | null` - Stores the QR code URL
- `qrCodeImage: string | null` - Stores the QR code image as base64 (optional)

### Service Updates

File: `ERP-NEST/src/order-tracking/order-tracking.service.ts`

#### New Method: `generateQRCodeUrl()`
```typescript
private generateQRCodeUrl(orderItemId: string, storeName: string): string
```
Generates QR code URL using:
- Frontend URL from config (`FRONTEND_URL` environment variable)
- Store name (dynamic from frontend)
- Order item ID

#### Updated Method: `generateQRCode()`
Now returns both `qrCode` (original format) and `qrCodeUrl`:
```typescript
async generateQRCode(orderItemId: string): Promise<{ 
  qrCode: string; 
  qrCodeUrl: string | null; 
  message: string 
}>
```

#### Updated Method: `customSyncOrderItems()`
Automatically generates QR code URL when creating new order items:
```typescript
orderItem.qrCodeUrl = this.generateQRCodeUrl(orderItem.id, customSyncDto.storeName);
```

#### Updated Method: `syncOrders()`
Automatically generates QR code URL when syncing orders from external stores.

## Frontend Implementation

### Package Installation

Installed `qrcode.react` package:
```bash
npm install qrcode.react
```

### QR Code Display Component

File: `ERP-NEXT/components/orders/qr-code-display.tsx`

Features:
- Displays QR code as SVG
- Supports inline and dialog display modes
- Copy URL to clipboard
- Download QR code as PNG image
- Auto-generates URL if not provided from backend

Usage:
```tsx
<QRCodeDisplay
  qrCodeUrl={item.qrCodeUrl}
  orderItemId={item.id}
  storeName={item.storeName}
  size={60}
  variant="dialog" // or "inline"
/>
```

### Updated Pages

#### 1. Fineyst Jackets Page
File: `ERP-NEXT/app/orders/fineyst-jackets/page.tsx`

- Added `qrCodeUrl` to `DatabaseOrderItem` interface
- Added QR Code column to production items table
- Added QR code display in mobile cards view

#### 2. Pelle Pelle Jackets Page
File: `ERP-NEXT/app/orders/pelle-pelle-jackets/page.tsx`

- Added `qrCodeUrl` to `DatabaseOrderItem` interface
- QR code columns need to be added to tables (similar to fineyst-jackets)

#### 3. Cutter Page
File: `ERP-NEXT/app/orders/cutter/page.tsx`

- Interface already includes `qrCode: string`
- Needs to be updated to include `qrCodeUrl: string | null`
- QR code display needs to be added

## Configuration

### Environment Variables

Backend (`.env`):
```env
FRONTEND_URL=http://localhost:3000  # Frontend URL for QR code generation
```

Frontend (`.env.local`):
```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000  # Optional, falls back to window.location.origin
```

## Migration

A database migration is needed to add the new columns:

File: `ERP-NEST/src/db/migrations/{timestamp}-add-qr-code-url-fields.ts`

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQrCodeUrlFields1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order_items',
      new TableColumn({
        name: 'qr_code_url',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'order_items',
      new TableColumn({
        name: 'qr_code_image',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('order_items', 'qr_code_image');
    await queryRunner.dropColumn('order_items', 'qr_code_url');
  }
}
```

## Supported Stores

Currently configured stores:
- `fineyst-jackets`
- `pelle-pelle-jackets`

## QR Code Generation Flow

### Option 1: URL-Based (Current Implementation)

1. Order item created via `customSyncOrderItems()` or `syncOrders()`
2. Backend generates QR code URL: `{FE_URL}/orders/{store_name}?orderItemId={id}`
3. URL stored in `qr_code_url` field
4. Frontend displays QR code using `qrcode.react` package
5. QR code can be scanned to navigate to order item page

### Option 2: Image-Based (Future Enhancement)

1. Backend generates QR code image using a library (e.g., `qrcode`)
2. Image converted to base64
3. Base64 string stored in `qr_code_image` field
4. Frontend displays image directly
5. No need for frontend QR code generation

## Usage Examples

### Frontend: Display QR Code in Table

```tsx
import { QRCodeDisplay } from '@/components/orders/qr-code-display'

// In table cell
<TableCell>
  <QRCodeDisplay
    qrCodeUrl={item.qrCodeUrl}
    orderItemId={item.id}
    storeName={item.storeName}
    size={60}
    variant="dialog"
  />
</TableCell>
```

### Backend: Generate QR Code URL

```typescript
// Automatic during sync
const qrCodeUrl = this.generateQRCodeUrl(orderItem.id, 'fineyst-jackets');
orderItem.qrCodeUrl = qrCodeUrl;
await this.orderItemRepository.save(orderItem);
```

## Testing

1. Create an order item in production
2. Verify QR code URL is generated correctly
3. Scan QR code with a phone camera
4. Verify it navigates to the correct order item page
5. Test copy and download functionality

## Notes

- QR codes are unique per order item ID
- QR code URLs are generated automatically during order sync
- Store name is dynamic and comes from the frontend during order creation
- QR code images are optional and can be generated separately if needed
- The original `qr_code` field is kept for backward compatibility


