/** Catalog and supplier fixtures for `npm run seed` (all prices in MMK). */

export const CATEGORIES = [
  { name: 'Electronics', description: 'Computers, peripherals, and accessories' },
  { name: 'Office Supplies', description: 'Paper, stationery, and desk essentials' },
  { name: 'Furniture', description: 'Desks, chairs, and storage units' },
  { name: 'Networking', description: 'Routers, switches, and cables' },
  { name: 'Packaging', description: 'Boxes, tape, and shipping materials' },
];

export const SUPPLIERS = [
  {
    name: 'Yangon Tech Trading',
    contactName: 'Ko Min Thu',
    email: 'orders@yangontech.example.com',
    phone: '+95-9-781-234-567',
    address: '48th St, Botahtaung Township, Yangon',
  },
  {
    name: 'Mandalay Office Mart',
    contactName: 'Daw Hnin Wai',
    email: 'sales@mandalayoffice.example.com',
    phone: '+95-9-420-889-102',
    address: '78th St, Chan Aye Thar Zan, Mandalay',
  },
  {
    name: 'Shwe Pack Logistics',
    contactName: 'U Aung Ko',
    email: 'supply@shwepack.example.com',
    phone: '+95-9-512-334-455',
    address: 'Industrial Zone 2, Hlaing Thar Yar, Yangon',
  },
];

// [sku, name, catIdx, supIdx, costPrice, salePrice, reorderLevel, initialQuantity] — MMK
export const PRODUCTS = [
  ['ELC-1001', 'Wireless Ergonomic Mouse', 0, 0, 28000, 55000, 10, 42],
  ['ELC-1002', 'Mechanical Keyboard TKL', 0, 0, 72000, 145000, 8, 25],
  ['ELC-1003', 'USB-C 7-in-1 Hub', 0, 0, 35000, 72000, 10, 6],
  ['ELC-1004', '27-inch 4K IPS Monitor', 0, 0, 840000, 1390000, 5, 14],
  ['ELC-1005', '1080p Autofocus Webcam', 0, 0, 45000, 95000, 8, 4],
  ['ELC-1006', 'Noise-Canceling Headset', 0, 0, 82000, 165000, 6, 19],
  ['OFC-2001', 'A4 Copy Paper (500 Sheets)', 1, 1, 6500, 14000, 25, 120],
  ['OFC-2002', 'Gel Ink Pens (12-Pack)', 1, 1, 5500, 12500, 20, 75],
  ['OFC-2003', 'Sticky Notes Cube (6-Pack)', 1, 1, 4200, 9800, 15, 11],
  ['OFC-2004', 'Heavy-Duty Stapler', 1, 1, 11500, 24500, 10, 30],
  ['OFC-2005', 'Spiral Notebook A5', 1, 1, 3200, 7500, 20, 64],
  ['OFC-2006', 'Dry-Erase Markers (8-Pack)', 1, 1, 6000, 14000, 12, 9],
  ['FRN-3001', 'Mesh Ergonomic Task Chair', 2, 1, 460000, 920000, 4, 12],
  ['FRN-3002', 'Standing Desk Frame Dual-Motor', 2, 1, 720000, 1360000, 3, 7],
  ['FRN-3003', '3-Drawer Mobile Pedestal', 2, 1, 290000, 560000, 5, 3],
  ['FRN-3004', 'Dual Monitor Arm Mount', 2, 0, 136000, 280000, 6, 18],
  ['FRN-3005', 'Acoustic Desk Divider', 2, 1, 104000, 215000, 5, 15],
  ['FRN-3006', 'LED Architect Desk Lamp', 2, 0, 76000, 160000, 8, 22],
  ['NET-4001', 'Cat6 Patch Cable 2m (5-Pack)', 3, 0, 32000, 72000, 15, 50],
  ['NET-4002', '8-Port Gigabit Switch', 3, 0, 96000, 200000, 8, 16],
  ['NET-4003', 'Wi-Fi 6 Dual-Band Router', 3, 0, 272000, 520000, 5, 5],
  ['NET-4004', '24-Port Managed Switch', 3, 0, 580000, 1080000, 3, 8],
  ['NET-4005', 'USB-C to Gigabit Ethernet', 3, 0, 38000, 80000, 12, 34],
  ['NET-4006', 'Wall-Mount 6U Rack Cabinet', 3, 0, 352000, 680000, 3, 2],
  ['PKG-5001', 'Corrugated Box 12x9x6 (25ct)', 4, 2, 56000, 112000, 12, 40],
  ['PKG-5002', 'Clear Packing Tape (6-Roll)', 4, 2, 26000, 56000, 15, 55],
  ['PKG-5003', 'Bubble Wrap Roll 12in x 50ft', 4, 2, 36000, 76000, 10, 8],
  ['PKG-5004', 'Thermal Shipping Labels (500ct)', 4, 2, 30000, 66000, 15, 48],
  ['PKG-5005', 'Kraft Void Fill Paper Roll', 4, 2, 64000, 128000, 6, 19],
  ['PKG-5006', 'Padded Poly Mailers (100ct)', 4, 2, 44000, 92000, 10, 33],
];