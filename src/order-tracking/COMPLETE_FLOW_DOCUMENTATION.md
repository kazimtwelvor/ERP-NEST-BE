# Complete Order Tracking Flow Documentation

## Overview

This system tracks leather goods (like jackets) through the complete production process, from material availability check through final delivery. Each stage has department-specific statuses that track the exact state within that department.

---

## Core Concepts

### 1. **Order Status** (`currentStatus`)
High-level status tracking the item's position in the overall workflow:
- `pending` - Just synced, not yet started
- `checked-in` - In a department
- `in-progress` - Being processed
- `checked-out` - Completed in department, ready for handover
- `completed` - All production complete
- `shipped` - Sent to customer
- `delivered` - Customer received

### 2. **Department Status** (`currentDepartmentStatus`)
Detailed status within the current department (e.g., `cutting_in_progress`, `cutting_pending_approval`)

### 3. **Department Flow Fields**
- `currentDepartmentId` - Department currently handling the item
- `lastDepartmentId` - Previous department that handled it
- `handedOverDepartmentId` - Next department it's being handed over to

### 4. **Preparation Type**
- `in-house` - Work done within company
- `outsourced` - Work done by external vendor

---

## Complete Production Flow

### Stage 1: Leather Availability Check
**Department:** Inventory  
**Status Flow:**
```
leather_availability_pending → leather_available OR leather_out_of_stock
```

**API Call:**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "inventory-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "leather_availability_pending",
  "preparationType": "in-house"
}
```

**Update Status:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "inventory-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "leather_available"
}
```

---

### Stage 2: Cutting Process
**Department:** Cutting  
**Status Flow:**
```
cutting_in_progress → cutting_pending_approval → cutting_approved → cutting_completed
```

**Check-In:**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "cutting-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "cutting_in_progress",
  "preparationType": "in-house"
}
```

**Update to Pending Approval:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "cutting-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "cutting_pending_approval"
}
```

**Production Manager Approves:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "cutting-dept-uuid",
  "userId": "manager-uuid",
  "password": "password",
  "departmentStatus": "cutting_approved"
}
```

**Check-Out (Hand over to Embroidery):**
```json
POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "cutting-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "handedOverDepartmentId": "embroidery-dept-uuid",
  "notes": "Cutting completed and approved"
}
```

---

### Stage 3: Embroidery Process
**Department:** Embroidery  
**Status Flow:**
```
embroidery_in_progress → embroidery_completed
```

**Check-In:**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "embroidery-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "embroidery_in_progress"
}
```

**Update to Completed:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "embroidery-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "embroidery_completed"
}
```

**Check-Out (Hand over to Rivets):**
```json
POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "embroidery-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "handedOverDepartmentId": "rivets-dept-uuid"
}
```

---

### Stage 4: Rivets Installation
**Department:** Rivets  
**Status Flow:**
```
rivets_installation_in_progress → rivets_completed
```

**Check-In:**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "rivets-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "rivets_installation_in_progress"
}
```

**Update & Check-Out:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "rivets-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "rivets_completed"
}

POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "rivets-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "handedOverDepartmentId": "stitching-dept-uuid"
}
```

---

### Stage 5: Stitching Process
**Department:** Stitching  
**Status Flow:**
```
stitching_in_progress → stitching_completed
```

**Check-In (Can be In-house or Outsourced):**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "stitching-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "stitching_in_progress",
  "preparationType": "outsourced"  // or "in-house"
}
```

**Update & Check-Out:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "stitching-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "stitching_completed"
}

POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "stitching-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "handedOverDepartmentId": "packing-dept-uuid"
}
```

---

### Stage 6: Packing Process
**Department:** Packing  
**Status Flow:**
```
packing_in_progress → packing_completed
```

**Check-In (Always In-house):**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "packing-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "packing_in_progress",
  "preparationType": "in-house"
}
```

**Update & Check-Out:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "packing-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "packing_completed"
}

POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "packing-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "handedOverDepartmentId": "quality-control-dept-uuid"
}
```

---

### Stage 7: Quality Control Inspection
**Department:** Quality Control  
**Status Flow:**
```
quality_control_inspection → quality_control_passed OR quality_control_failed
```

**Check-In:**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "quality-control-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "quality_control_inspection"
}
```

**Pass - Update Status:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "in-progress",
  "departmentId": "quality-control-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "quality_control_passed"
}
```

**Check-Out (Hand over to Logistics):**
```json
POST /order-tracking/check-out
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "quality-control-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "handedOverDepartmentId": "logistics-dept-uuid"
}
```

**Fail - Return to Previous Stage:**
```json
POST /order-tracking/return-to-stage
{
  "qrCode": "ORDER_ITEM_xxx",
  "returnToStatus": "cutting_in_progress",
  "departmentId": "quality-control-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "reason": "Quality issue found in cutting, needs re-cutting",
  "notes": "Returning to cutting stage for correction"
}
```

---

### Stage 8: Shipping & Delivery
**Department:** Logistics  
**Status Flow:**
```
ready_to_ship → shipped → in_transit → delivered
OR
ready_to_ship → shipped → customs_clearance_pending → customs_cleared → in_transit → delivered
```

**Check-In:**
```json
POST /order-tracking/check-in
{
  "qrCode": "ORDER_ITEM_xxx",
  "departmentId": "logistics-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "ready_to_ship"
}
```

**Update to Shipped:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "shipped",
  "departmentId": "logistics-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "shipped"
}
```

**Update to In Transit:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "shipped",
  "departmentId": "logistics-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "in_transit"
}
```

**For International Orders - Customs:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "shipped",
  "departmentId": "logistics-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "customs_clearance_pending"
}

POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "shipped",
  "departmentId": "logistics-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "customs_cleared"
}
```

**Final - Delivered:**
```json
POST /order-tracking/update-status
{
  "qrCode": "ORDER_ITEM_xxx",
  "status": "delivered",
  "departmentId": "logistics-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "departmentStatus": "delivered"
}
```

---

## Department Status Transitions

The system enforces valid status transitions. Each status can only transition to specific next statuses:

### Valid Transitions:
- `cutting_in_progress` → `cutting_pending_approval`
- `cutting_pending_approval` → `cutting_approved` OR `cutting_in_progress` (if rejected)
- `cutting_approved` → `embroidery_in_progress`
- `embroidery_in_progress` → `embroidery_completed`
- `embroidery_completed` → `rivets_installation_in_progress`
- `rivets_installation_in_progress` → `rivets_completed`
- `rivets_completed` → `stitching_in_progress`
- `stitching_in_progress` → `stitching_completed`
- `stitching_completed` → `packing_in_progress`
- `packing_in_progress` → `packing_completed`
- `packing_completed` → `quality_control_inspection`
- `quality_control_inspection` → `quality_control_passed` OR `quality_control_failed`
- `quality_control_passed` → `ready_to_ship`
- `quality_control_failed` → Can return to any previous stage
- `ready_to_ship` → `shipped`
- `shipped` → `in_transit` OR `customs_clearance_pending`
- `customs_clearance_pending` → `customs_cleared`
- `customs_cleared` → `in_transit`
- `in_transit` → `delivered`
- `delivered` → (End state)

---

## Quality Control Failure Handling

When quality control fails, the item can be returned to any previous production stage:

**Endpoint:** `POST /order-tracking/return-to-stage`

**Example - Return to Cutting:**
```json
{
  "qrCode": "ORDER_ITEM_xxx",
  "returnToStatus": "cutting_in_progress",
  "departmentId": "quality-control-dept-uuid",
  "userId": "user-uuid",
  "password": "password",
  "reason": "Cutting dimensions incorrect",
  "notes": "Needs to be re-cut with correct measurements"
}
```

**Valid Return Statuses:**
- `cutting_in_progress`
- `embroidery_in_progress`
- `rivets_installation_in_progress`
- `stitching_in_progress`
- `packing_in_progress`

---

## Field Tracking Summary

### Check-In Updates:
- `currentDepartmentId` → New department
- `lastDepartmentId` → Previous `currentDepartmentId`
- `currentDepartmentStatus` → Initial department status
- `handedOverDepartmentId` → Cleared (null)
- `preparationType` → Set if provided

### Status Update Updates:
- `currentDepartmentStatus` → New department status
- `preparationType` → Updated if provided
- Validates status transition

### Check-Out Updates:
- `currentDepartmentId` → null
- `lastDepartmentId` → Previous `currentDepartmentId`
- `handedOverDepartmentId` → Next department
- `currentDepartmentStatus` → Preserved

### Return to Stage Updates:
- `currentDepartmentStatus` → Return status
- `currentStatus` → `in-progress`
- Creates tracking record with reason

---

## Complete Example Flow

```
1. Sync Order → pending, no department
2. Check-In Inventory → leather_availability_pending
3. Update → leather_available
4. Check-Out → handedOverDepartmentId = Cutting
5. Check-In Cutting → cutting_in_progress
6. Update → cutting_pending_approval
7. Update → cutting_approved
8. Check-Out → handedOverDepartmentId = Embroidery
9. Check-In Embroidery → embroidery_in_progress
10. Update → embroidery_completed
11. Check-Out → handedOverDepartmentId = Rivets
12. Check-In Rivets → rivets_installation_in_progress
13. Update → rivets_completed
14. Check-Out → handedOverDepartmentId = Stitching
15. Check-In Stitching → stitching_in_progress (outsourced)
16. Update → stitching_completed
17. Check-Out → handedOverDepartmentId = Packing
18. Check-In Packing → packing_in_progress
19. Update → packing_completed
20. Check-Out → handedOverDepartmentId = Quality Control
21. Check-In QC → quality_control_inspection
22. Update → quality_control_passed
23. Check-Out → handedOverDepartmentId = Logistics
24. Check-In Logistics → ready_to_ship
25. Update → shipped
26. Update → in_transit
27. Update → delivered
```

---

## API Endpoints Summary

1. **Sync Orders:** `POST /order-tracking/sync-orders`
2. **Check-In:** `POST /order-tracking/check-in` (with `departmentStatus`)
3. **Update Status:** `POST /order-tracking/update-status` (with `departmentStatus`)
4. **Check-Out:** `POST /order-tracking/check-out` (with `handedOverDepartmentId`)
5. **Return to Stage:** `POST /order-tracking/return-to-stage` (for QC failures)
6. **Get Tracking History:** `GET /order-tracking/tracking-history`
7. **Get Order Item:** `GET /order-tracking/order-item/qr/:qrCode`

---

## Key Features

✅ **Department-Specific Statuses** - Track exact state within each department  
✅ **Status Transition Validation** - Enforces valid workflow progression  
✅ **Handover Tracking** - Know exactly where items are going  
✅ **Quality Control Returns** - Handle failures and returns to previous stages  
✅ **In-house vs Outsourced** - Track preparation type  
✅ **Complete Audit Trail** - Every status change is recorded  
✅ **Department History** - Track last department and handover chain

