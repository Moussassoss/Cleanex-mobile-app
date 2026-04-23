export type ServiceCatalogItem = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  route: string;
  requiresCustomRequest?: boolean;
};

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'laundry',
    name: 'Laundry Services',
    description: 'Clothes and shoes washing with optional ironing.',
    priceLabel: 'From 2,000 RWF',
    route: '/screens/LaundryServices',
  },
  {
    id: 'house_cleaning',
    name: 'House Cleaning',
    description: 'Rooms, living rooms, toilets, kitchen and dishes.',
    priceLabel: 'From 500 RWF per unit',
    route: '/screens/HouseCleaningServices',
  },
  {
    id: 'carpet_deep_cleaning',
    name: 'Carpet Deep Cleaning',
    description: 'Deep stain, dust and odor removal for carpets.',
    priceLabel: '5,000 - 30,000 RWF',
    route: '/screens/ServiceRequest?service=carpet_deep_cleaning',
    requiresCustomRequest: true,
  },
  {
    id: 'bed_covers_cleaning',
    name: 'Bed Covers Cleaning',
    description: 'Bed sheets, duvets, blankets and large bed covers.',
    priceLabel: '3,000 - 18,000 RWF',
    route: '/screens/ServiceRequest?service=bed_covers_cleaning',
    requiresCustomRequest: true,
  },
  {
    id: 'sofa_deep_cleaning',
    name: 'Sofa Deep Cleaning',
    description: 'Fabric and leather sofa treatment and sanitization.',
    priceLabel: '8,000 - 45,000 RWF',
    route: '/screens/ServiceRequest?service=sofa_deep_cleaning',
    requiresCustomRequest: true,
  },
  {
    id: 'pest_control',
    name: 'Insect / Pest Control',
    description: 'Targeted treatment for insects and pest prevention.',
    priceLabel: '15,000 - 80,000 RWF',
    route: '/screens/ServiceRequest?service=pest_control',
    requiresCustomRequest: true,
  },
];
