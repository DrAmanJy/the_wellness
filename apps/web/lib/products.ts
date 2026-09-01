export type Product = {
  id: string;
  name: string;
  category: string;
  type: 'Prescription (Rx)' | 'Over-The-Counter (OTC)';
  description: string;
  benefits: string[];
  ingredients: string[];
  image: string;
  images?: string[];
  price: number;
  tags?: string[];
};

export const products: Product[] = [
  {
    id: 'respira-inhaler-pro',
    name: 'Respira Inhaler Pro',
    category: 'Respiratory',
    type: 'Prescription (Rx)',
    description:
      'Advanced metered-dose inhaler providing rapid relief for acute asthma and COPD exacerbations. Features micro-fine suspension for optimal lung deposition.',
    benefits: [
      'Rapid bronchodilation within minutes',
      'Targeted deep lung penetration',
      'Dose counter for precise tracking',
    ],
    ingredients: ['Salbutamol Sulfate 100mcg', 'HFA Propellant (CFC-free)'],
    image: '/images/respira-inhaler.png',
    price: 3735.0,
    tags: ['respiratory', 'inhaler', 'asthma', 'copd', 'lung', 'bronchodilator'],
  },
  {
    id: 'cardiostatin-40',
    name: 'Cardiostatin 40mg',
    category: 'Cardiovascular',
    type: 'Prescription (Rx)',
    description:
      'A potent statin therapy designed to aggressively lower LDL cholesterol levels and reduce the risk of major cardiovascular events in high-risk patients.',
    benefits: ['Significantly lowers LDL-C', 'Stabilizes arterial plaques', 'Once-daily dosing'],
    ingredients: ['Atorvastatin Calcium 40mg', 'Microcrystalline Cellulose', 'Calcium Carbonate'],
    image: '/images/cardiostatin.png',
    price: 4855.5,
    tags: ['cardio', 'heart', 'cholesterol', 'statin', 'atorvastatin'],
  },
  {
    id: 'neurocognin-xr',
    name: 'NeuroCognin XR',
    category: 'Neurology',
    type: 'Prescription (Rx)',
    description:
      'Extended-release formulation for the management of mild to moderate neurocognitive decline. Maintains steady plasma concentrations over 24 hours.',
    benefits: [
      'Improves cognitive retention',
      'Smooth 24-hour release profile',
      'Reduces caregiver burden',
    ],
    ingredients: ['Donepezil Hydrochloride 10mg (Extended Release)', 'Matrix polymer base'],
    image: '/images/neurocognin.png',
    price: 7387.0,
    tags: ['neurology', 'cognitive', 'brain', 'memory', 'donepezil'],
  },
  {
    id: 'willmox-500',
    name: 'Willmox-CV 500',
    category: 'Anti-Infectives',
    type: 'Prescription (Rx)',
    description:
      'Broad-spectrum antibiotic combining amoxicillin with a beta-lactamase inhibitor, highly effective against resistant respiratory and skin tract infections.',
    benefits: [
      'Overcomes beta-lactamase resistance',
      'High clinical cure rates',
      'Convenient twice-daily dosing',
    ],
    ingredients: ['Amoxicillin 500mg', 'Clavulanate Potassium 125mg'],
    image: '/images/willmox.png',
    price: 2672.6,
    tags: ['antibiotic', 'infection', 'amoxicillin', 'anti-infective', 'bacteria'],
  },
  {
    id: 'osteo-flex-advanced',
    name: 'OsteoFlex Advanced',
    category: 'OTC & Wellness',
    type: 'Over-The-Counter (OTC)',
    description:
      'A clinical-strength OTC formulation designed to reduce joint inflammation and support cartilage matrix repair for improved mobility.',
    benefits: [
      'Reduces joint stiffness',
      'Supports cartilage synthesis',
      'Gastric-friendly formulation',
    ],
    ingredients: ['Glucosamine Sulfate 1500mg', 'Chondroitin 1200mg', 'Curcumin C3 Complex'],
    image: '/images/osteoflex.png',
    price: 2074.17,
    tags: ['joint', 'mobility', 'curcumin', 'otc', 'wellness', 'cartilage'],
  },
  {
    id: 'pediacetamol-suspension',
    name: 'PediaCetamol Suspension',
    category: 'Pediatrics',
    type: 'Over-The-Counter (OTC)',
    description:
      'Gentle, rapid-acting antipyretic and analgesic suspension formulated specifically for infants and children. Sugar-free and pleasant tasting.',
    benefits: [
      'Fast fever reduction',
      'Gentle on pediatric stomachs',
      'Accurate dosing syringe included',
    ],
    ingredients: ['Paracetamol 250mg/5ml', 'Purified Water', 'Berry Flavoring (Sugar-free)'],
    image: '/images/pediacetamol.png',
    price: 1224.25,
    tags: ['pediatric', 'fever', 'pain', 'otc', 'paracetamol', 'child'],
  },
];

export const getProductById = (id: string) => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string) => {
  if (!category || category === 'All') return products;
  return products.filter((p) => p.category === category);
};

export const getAllCategories = () => {
  const categories = new Set(products.map((p) => p.category));
  return ['All', ...Array.from(categories)];
};
