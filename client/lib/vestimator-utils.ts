/**
 * Paint Vestimator Calculation Engine
 * Calculates paint quantity and cost for UK rooms
 */

export interface Room {
  id: string;
  name: string;
  length: number; // metres
  width: number; // metres
  height: number; // metres
  includeCeiling: boolean;
  doors: number;
  smallWindows: number;
  mediumWindows: number;
  largeWindows: number;
  patioDoors: number;
}

export interface Estimate {
  totalAreaSqm: number;
  paintNeededLitres: number;
  paintWithWasteLitres: number;
  tins: TinSize[];
  totalCost: number;
  breakdown: RoomBreakdown[];
}

export interface TinSize {
  size: number; // litres
  quantity: number;
  subtotal: number;
}

export interface RoomBreakdown {
  roomId: string;
  name: string;
  wallAreaSqm: number;
  ceilingAreaSqm: number;
  netAreaSqm: number;
}

// Constants for door/window sizes
const OPENING_SIZES = {
  standardDoor: 1.89, // 2.1m × 0.9m
  smallWindow: 0.84, // 1.2m × 0.7m
  mediumWindow: 1.2, // 1.2m × 1.0m
  largeWindow: 1.8, // 1.5m × 1.2m
  patioDoor: 4.2, // 2.1m × 2.0m
};

/**
 * Calculate wall area for a single room
 */
export function calculateRoomArea(room: Room): RoomBreakdown {
  // Wall area formula: 2 × (length + width) × height
  const wallArea = 2 * (room.length + room.width) * room.height;

  // Deduct openings
  const doorsArea = room.doors * OPENING_SIZES.standardDoor;
  const smallWindowsArea = room.smallWindows * OPENING_SIZES.smallWindow;
  const mediumWindowsArea = room.mediumWindows * OPENING_SIZES.mediumWindow;
  const largeWindowsArea = room.largeWindows * OPENING_SIZES.largeWindow;
  const patiDoorsArea = room.patioDoors * OPENING_SIZES.patioDoor;

  const totalOpeningsArea =
    doorsArea +
    smallWindowsArea +
    mediumWindowsArea +
    largeWindowsArea +
    patiDoorsArea;

  const netWallArea = Math.max(0, wallArea - totalOpeningsArea);

  // Ceiling area
  const ceilingArea = room.includeCeiling ? room.length * room.width : 0;

  return {
    roomId: room.id,
    name: room.name,
    wallAreaSqm: wallArea,
    ceilingAreaSqm: ceilingArea,
    netAreaSqm: netWallArea + ceilingArea,
  };
}

/**
 * Calculate total area across all rooms
 */
export function calculateTotalArea(rooms: Room[]): number {
  return rooms.reduce((total, room) => {
    const breakdown = calculateRoomArea(room);
    return total + breakdown.netAreaSqm;
  }, 0);
}

/**
 * Calculate paint quantity needed
 */
export function calculatePaintNeeded(
  totalAreaSqm: number,
  numberOfCoats: number,
  coveragePerLitre: number
): number {
  const paintNeeded = (totalAreaSqm * numberOfCoats) / coveragePerLitre;
  // Round UP to nearest 0.5 litre
  return Math.ceil(paintNeeded * 2) / 2;
}

/**
 * Add 10% waste factor for professional jobs
 */
export function addWasteFactor(paintNeeded: number): number {
  return Math.ceil(paintNeeded * 1.1 * 2) / 2; // Round to nearest 0.5
}

/**
 * Find optimal tin combination
 */
export function calculateOptimalTins(
  paintNeeded: number,
  availableSizes: number[]
): TinSize[] {
  const tins: TinSize[] = [];
  let remaining = paintNeeded;

  // Sort sizes in descending order for optimal filling
  const sortedSizes = [...availableSizes].sort((a, b) => b - a);

  for (const size of sortedSizes) {
    if (remaining >= size * 0.5) {
      // Only use if it saves more than 0.5L wasted
      const quantity = Math.floor(remaining / size);
      if (quantity > 0) {
        tins.push({
          size,
          quantity,
          subtotal: size * quantity,
        });
        remaining -= size * quantity;
      }
    }
  }

  // Fill remaining with smallest size
  if (remaining > 0) {
    const smallestSize = Math.min(...sortedSizes);
    tins.push({
      size: smallestSize,
      quantity: 1,
      subtotal: smallestSize,
    });
  }

  return tins;
}

/**
 * Calculate total cost
 */
export function calculateTotalCost(
  tins: TinSize[],
  pricePerLitre: number
): number {
  return tins.reduce((total, tin) => {
    return total + tin.subtotal * pricePerLitre;
  }, 0);
}

/**
 * Generate complete estimate
 */
export function generateEstimate(
  rooms: Room[],
  numberOfCoats: number,
  coveragePerLitre: number,
  pricePerLitre: number,
  availableSizes: number[]
): Estimate {
  // Calculate room areas
  const breakdown = rooms.map((room) => calculateRoomArea(room));
  const totalAreaSqm = breakdown.reduce((sum, b) => sum + b.netAreaSqm, 0);

  // Calculate paint needed
  const paintNeeded = calculatePaintNeeded(
    totalAreaSqm,
    numberOfCoats,
    coveragePerLitre
  );
  const paintWithWaste = addWasteFactor(paintNeeded);

  // Calculate optimal tins
  const tins = calculateOptimalTins(paintWithWaste, availableSizes);

  // Calculate cost
  const totalCost = calculateTotalCost(tins, pricePerLitre);

  return {
    totalAreaSqm: Math.round(totalAreaSqm * 100) / 100,
    paintNeededLitres: paintNeeded,
    paintWithWasteLitres: paintWithWaste,
    tins,
    totalCost: Math.round(totalCost * 100) / 100,
    breakdown,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

/**
 * Format area
 */
export function formatArea(area: number): string {
  return `${(Math.round(area * 100) / 100).toFixed(2)} m²`;
}
