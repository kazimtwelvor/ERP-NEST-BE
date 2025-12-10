
export enum DepartmentStatus {
  LEATHER_AVAILABILITY_PENDING = 'leather_availability_pending',
  LEATHER_AVAILABLE = 'leather_available',
  LEATHER_OUT_OF_STOCK = 'leather_out_of_stock',

  CUTTING_IN_PROGRESS = 'cutting_in_progress',
  CUTTING_COMPLETED = 'cutting_completed',

  EMBROIDERY_IN_PROGRESS = 'embroidery_in_progress',
  EMBROIDERY_COMPLETED = 'embroidery_completed',

  RIVETS_INSTALLATION_IN_PROGRESS = 'rivets_installation_in_progress',
  RIVETS_COMPLETED = 'rivets_completed',

  STITCHING_IN_PROGRESS = 'stitching_in_progress',
  STITCHING_COMPLETED = 'stitching_completed',

  PACKING_IN_PROGRESS = 'packing_in_progress',
  PACKING_COMPLETED = 'packing_completed',

  QUALITY_CONTROL_INSPECTION = 'quality_control_inspection',
  QUALITY_CONTROL_PASSED = 'quality_control_passed',
  QUALITY_CONTROL_FAILED = 'quality_control_failed',

  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',

  CUSTOMS_CLEARANCE_PENDING = 'customs_clearance_pending',
  CUSTOMS_CLEARED = 'customs_cleared',

  DELIVERED = 'delivered',
}


export const DepartmentStatusMap: Record<string, DepartmentStatus[]> = {
  'inventory': [
    DepartmentStatus.LEATHER_AVAILABILITY_PENDING,
    DepartmentStatus.LEATHER_AVAILABLE,
    DepartmentStatus.LEATHER_OUT_OF_STOCK,
  ],
  'cutting': [
    DepartmentStatus.CUTTING_IN_PROGRESS,
    DepartmentStatus.CUTTING_COMPLETED,
  ],
  'embroidery': [
    DepartmentStatus.EMBROIDERY_IN_PROGRESS,
    DepartmentStatus.EMBROIDERY_COMPLETED,
  ],
  'rivets': [
    DepartmentStatus.RIVETS_INSTALLATION_IN_PROGRESS,
    DepartmentStatus.RIVETS_COMPLETED,
  ],
  'stitching': [
    DepartmentStatus.STITCHING_IN_PROGRESS,
    DepartmentStatus.STITCHING_COMPLETED,
  ],
  'packing': [
    DepartmentStatus.PACKING_IN_PROGRESS,
    DepartmentStatus.PACKING_COMPLETED,
  ],
  'quality-control': [
    DepartmentStatus.QUALITY_CONTROL_INSPECTION,
    DepartmentStatus.QUALITY_CONTROL_PASSED,
    DepartmentStatus.QUALITY_CONTROL_FAILED,
  ],
  'logistics': [
    DepartmentStatus.READY_TO_SHIP,
    DepartmentStatus.SHIPPED,
    DepartmentStatus.IN_TRANSIT,
    DepartmentStatus.CUSTOMS_CLEARANCE_PENDING,
    DepartmentStatus.CUSTOMS_CLEARED,
    DepartmentStatus.DELIVERED,
  ],
};


export const StatusTransitions: Record<DepartmentStatus, DepartmentStatus[]> = {
  // Leather Availability
  [DepartmentStatus.LEATHER_AVAILABILITY_PENDING]: [
    DepartmentStatus.LEATHER_AVAILABLE,
    DepartmentStatus.LEATHER_OUT_OF_STOCK,
  ],
  [DepartmentStatus.LEATHER_AVAILABLE]: [DepartmentStatus.CUTTING_IN_PROGRESS],
  [DepartmentStatus.LEATHER_OUT_OF_STOCK]: [], // End state - order held

  // Cutting
  [DepartmentStatus.CUTTING_IN_PROGRESS]: [DepartmentStatus.CUTTING_COMPLETED],
  [DepartmentStatus.CUTTING_COMPLETED]: [DepartmentStatus.EMBROIDERY_IN_PROGRESS],

  // Embroidery
  [DepartmentStatus.EMBROIDERY_IN_PROGRESS]: [DepartmentStatus.EMBROIDERY_COMPLETED],
  [DepartmentStatus.EMBROIDERY_COMPLETED]: [DepartmentStatus.RIVETS_INSTALLATION_IN_PROGRESS],

  // Rivets
  [DepartmentStatus.RIVETS_INSTALLATION_IN_PROGRESS]: [DepartmentStatus.RIVETS_COMPLETED],
  [DepartmentStatus.RIVETS_COMPLETED]: [DepartmentStatus.STITCHING_IN_PROGRESS],

  // Stitching
  [DepartmentStatus.STITCHING_IN_PROGRESS]: [DepartmentStatus.STITCHING_COMPLETED],
  [DepartmentStatus.STITCHING_COMPLETED]: [DepartmentStatus.PACKING_IN_PROGRESS],

  // Packing
  [DepartmentStatus.PACKING_IN_PROGRESS]: [DepartmentStatus.PACKING_COMPLETED],
  [DepartmentStatus.PACKING_COMPLETED]: [DepartmentStatus.QUALITY_CONTROL_INSPECTION],

  // Quality Control
  [DepartmentStatus.QUALITY_CONTROL_INSPECTION]: [
    DepartmentStatus.QUALITY_CONTROL_PASSED,
    DepartmentStatus.QUALITY_CONTROL_FAILED,
  ],
  [DepartmentStatus.QUALITY_CONTROL_PASSED]: [DepartmentStatus.READY_TO_SHIP],
  [DepartmentStatus.QUALITY_CONTROL_FAILED]: [
    // Can return to any previous stage
    DepartmentStatus.CUTTING_IN_PROGRESS,
    DepartmentStatus.EMBROIDERY_IN_PROGRESS,
    DepartmentStatus.RIVETS_INSTALLATION_IN_PROGRESS,
    DepartmentStatus.STITCHING_IN_PROGRESS,
    DepartmentStatus.PACKING_IN_PROGRESS,
  ],

  // Shipping
  [DepartmentStatus.READY_TO_SHIP]: [DepartmentStatus.SHIPPED],
  [DepartmentStatus.SHIPPED]: [
    DepartmentStatus.IN_TRANSIT,
    DepartmentStatus.CUSTOMS_CLEARANCE_PENDING,
  ],
  [DepartmentStatus.IN_TRANSIT]: [DepartmentStatus.DELIVERED],
  [DepartmentStatus.CUSTOMS_CLEARANCE_PENDING]: [
    DepartmentStatus.CUSTOMS_CLEARED,
  ],
  [DepartmentStatus.CUSTOMS_CLEARED]: [DepartmentStatus.IN_TRANSIT],

  // Final
  [DepartmentStatus.DELIVERED]: [], // End state
};


