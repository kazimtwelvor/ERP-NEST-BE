# QR Code Functionality Documentation

## Overview

QR codes are used to uniquely identify and track order items throughout the production process. Each order item gets a unique QR code that can be scanned to perform tracking operations.

---

## QR Code Generation

### Automatic Generation (During Sync)

**When:** QR codes are **automatically generated** when orders are synced from external stores.

**How it works:**
1. When you call `POST /order-tracking/sync-orders` with a store name
2. The system fetches orders from the external API
3. For each **new** order item (not already in database):
   - Order item is created and saved to database
   - **QR code is automatically generated** using the format: `ORDER_ITEM_{orderItemId}_{randomHash}`
   - QR code is saved to the database

**Format:**
```
ORDER_ITEM_{UUID}_{32-character-hex-hash}
Example: ORDER_ITEM_123e4567-e89b-12d3-a456-426614174000_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Important Notes:**
- ✅ QR codes are **automatically generated** for new items during sync
- ✅ Existing items (already synced) keep their existing QR codes
- ✅ QR codes are unique and stored in the database
- ✅ QR codes are generated **after** the order item is saved (to get the UUID)

### Manual Generation (Optional)

**When:** You can manually generate or regenerate a QR code if needed.

**Endpoint:** `POST /order-tracking/generate-qr/:orderItemId`

**Use Cases:**
- Regenerating QR code for an existing item (if QR code was lost or needs to be changed)
- Generating QR code for items that were created before QR code generation was implemented

**Note:** This will **overwrite** the existing QR code if one exists.

---

## QR Code Usage

### 1. Scanning QR Code

QR codes are scanned to:
- **Check-in** items to departments
- **Check-out** items from departments
- **Update status** (e.g., to in-progress)
- **View order item details**
- **View tracking history**

### 2. Operations Using QR Code

All tracking operations require the QR code:

#### Check-In
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx_yyy",
  "departmentId": "uuid",
  "userId": "uuid",
  "password": "password"
}
```

#### Check-Out
```json
POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx_yyy",
  "departmentId": "uuid",
  "userId": "uuid",
  "password": "password"
}
```

#### Update Status
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx_yyy",
  "status": "in-progress",
  "departmentId": "uuid",
  "userId": "uuid",
  "password": "password"
}
```

#### Get Order Item by QR Code
```bash
GET /order-tracking/order-item/qr/:qrCode
```

#### Get Tracking History
```bash
GET /order-tracking/tracking-history?qrCode=ORDER_ITEM_xxx_yyy
```

---

## QR Code Lifecycle

```
1. Order Sync
   ↓
2. Order Items Created
   ↓
3. QR Codes Auto-Generated (for new items)
   ↓
4. QR Codes Stored in Database
   ↓
5. QR Codes Used for Tracking Operations
```

---

## Implementation Details

### Generation Logic

```typescript
// During sync (automatic)
const orderItem = await orderItemRepository.create({...});
await orderItemRepository.save(orderItem); // Save first to get ID

const hash = crypto.randomBytes(16).toString('hex');
orderItem.qrCode = `ORDER_ITEM_${orderItem.id}_${hash}`;
await orderItemRepository.save(orderItem); // Save QR code
```

### Database Storage

- **Column:** `qr_code` in `order_items` table
- **Type:** `VARCHAR` (nullable)
- **Unique:** Yes (enforced by database constraint)
- **Indexed:** Can be queried efficiently

---

## Best Practices

1. **Print QR Codes:** After syncing orders, print QR codes for physical items
2. **Store QR Codes:** Keep QR codes accessible for scanning during production
3. **Don't Regenerate:** Avoid regenerating QR codes for items already in production
4. **Backup:** Ensure QR codes are backed up with order item data

---

## Troubleshooting

### QR Code Not Generated
- **Check:** Ensure order item was successfully created during sync
- **Check:** Verify sync completed without errors
- **Solution:** Use manual generation endpoint if needed

### QR Code Not Found
- **Check:** Verify QR code format is correct
- **Check:** Ensure order item exists in database
- **Solution:** Regenerate QR code using manual endpoint

### Duplicate QR Code Error
- **Cause:** Extremely rare (random hash collision)
- **Solution:** System will automatically handle by generating new hash

---

## Summary

✅ **QR codes are automatically generated** when orders are synced  
✅ **No manual action required** for new order items  
✅ **QR codes are unique** and stored permanently  
✅ **Manual generation available** if needed for existing items  
✅ **QR codes are used** for all tracking operations

