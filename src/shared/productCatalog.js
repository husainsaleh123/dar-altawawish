export const MAIN_CATEGORIES = [
  'All Products',
  'Gemstones',
  'Tools',
  'Scales',
  'Machines',
  'Minerals',
  'Plastic',
  'Threads'
];

export const GEMSTONE_SUBCATEGORIES = [
  'Turquoise',
  'Malakite',
  'Coral',
  'Eye Stone',
  'Amber',
  'Aqeeq',
  'Glass Stone',
  'Golden Stone',
  'Zarcoon',
  'Black Onyx',
  'Lapis'
];

export const ALL_GEMSTONES_OPTION = 'All Gemstones';
export const TOOL_SUBCATEGORIES = [
  'Crucibles',
  'Cotton Buff',
  'Sawing Blades',
  'Soldering',
  'Burners',
  'Drill Bit',
  'File',
  'Brushes',
  'Gold and silver cleaners',
  'Others'
];
export const ALL_TOOLS_OPTION = 'All Tools';

export const DEFAULT_GEMSTONE_PRODUCTS = [
  {
    _id: 'van-cliff-malakite-10x10mm',
    name: 'Van Cliff Malakite (10mm x 10mm)',
    category: 'Gemstones',
    subcategory: 'Malakite',
    description: 'Gemstone product priced per piece.',
    price: 0.5,
    image: '/products/van-cliff-malakite-10x10mm.jpg',
    countInStock: 0,
    unit: 'piece',
    requiresQuantitySelection: true
  },
  {
    _id: 'coral-1mm-round',
    name: 'Coral 1 mm round',
    category: 'Gemstones',
    subcategory: 'Coral',
    description: 'Gemstone product priced per gram.',
    price: 2,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'coral-1-5mm-round',
    name: 'Coral 1.5 mm round',
    category: 'Gemstones',
    subcategory: 'Coral',
    description: 'Gemstone product priced per gram.',
    price: 2,
    image: '/products/coral-rounded-1.5mm.jpg',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'coral-round-2mm',
    name: 'Coral Round 2mm',
    category: 'Gemstones',
    subcategory: 'Coral',
    description: 'Gemstone product priced per gram.',
    price: 2,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'coral-round-3-5mm',
    name: 'Coral Round 3.5 mm',
    category: 'Gemstones',
    subcategory: 'Coral',
    description: 'Gemstone product priced per gram.',
    price: 1,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'coral-round-5mm',
    name: 'Coral Round 5 mm',
    category: 'Gemstones',
    subcategory: 'Coral',
    description: 'Gemstone product priced per gram.',
    price: 0.5,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-1mm-round',
    name: 'Turquoise 1 mm round',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 2,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-1-5mm-round',
    name: 'Turquoise 1.5 mm round',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 2,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-round-2mm',
    name: 'Turquoise Round 2mm',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 2,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-round-3-5mm',
    name: 'Turquoise Round 3.5 mm',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 1,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-round-5mm',
    name: 'Turquoise Round 5 mm',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 0.5,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-half-rounded',
    name: 'Turquoise Half-rounded',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 0,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-teardrop',
    name: 'Turquoise Teardrop',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 0,
    image: '',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-oval',
    name: 'Turquoise Oval',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 0,
    image: '',
    countInStock: 0,
    unit: 'gram'
  }
];

export const DEFAULT_MACHINE_PRODUCTS = [
  {
    _id: 'money-counting-machine',
    name: 'Cash Counting Machine',
    category: 'Machines',
    subcategory: null,
    description:
      'A reliable money counting machine for fast and accurate cash handling, built for jewellery counters and daily retail operations.',
    price: 70,
    image: '/products/money-counting-machine.jpg',
    countInStock: 8
  },
  {
    _id: 'benchgrinder-machine',
    name: 'Benchgrinder (75mm)',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product. Price will be updated.',
    price: 12,
    image: '',
    countInStock: 0
  },
  {
    _id: 'freedom-machine',
    name: 'Freedom',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product. Price will be updated.',
    price: 0,
    image: '',
    countInStock: 0
  },
  {
    _id: 'furnace-machine',
    name: 'Furnace',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product. Price will be updated.',
    price: 0,
    image: '',
    countInStock: 0
  },
  {
    _id: 'ultrasonic-cleaner-12l-large',
    name: 'Ultrasonic cleaner (12L Large)',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 160,
    image: '',
    countInStock: 0
  },
  {
    _id: 'ultrasonic-cleaner-5-7l-medium',
    name: 'Ultrasonic cleaner (5.7L Medium)',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 140,
    image: '',
    countInStock: 0
  },
  {
    _id: 'sandblast-machine',
    name: 'Sandblast machine',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 130,
    image: '/products/sandblast.jpg',
    countInStock: 0
  }
];

export const DEFAULT_TOOL_PRODUCTS = [
  {
    _id: 'electric-crucible-1kg',
    name: 'Electric Crucible 1 kg',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Tool product.',
    price: 5,
    image: '/products/electric-crucible.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-1',
    name: 'Crucible No. 1',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 1,
    image: '/products/graphite-crucible-1.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-1-5',
    name: 'Crucible No. 1.5',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 1.5,
    image: '/products/graphite-crucible-1.5.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-2',
    name: 'Crucible No. 2',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 2,
    image: '/products/graphite-crucible-2.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-3',
    name: 'Crucible No. 3',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 3,
    image: '/products/graphite-crucible-3.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-4',
    name: 'Crucible No. 4',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 4,
    image: '/products/graphite-crucible-4.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-5',
    name: 'Crucible No. 5',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 5,
    image: '/products/graphite-crucible-5.jpg',
    countInStock: 0
  },
  {
    _id: 'crucible-no-6',
    name: 'Crucible No. 6',
    category: 'Tools',
    subcategory: 'Crucibles',
    description: 'Used for melting metals at high temperatures.',
    price: 6,
    image: '/products/graphite-crucible-6.jpg',
    countInStock: 0
  },
  {
    _id: 'yellow-cotton-buff-medium-6x50',
    name: 'Yellow cotton buff (medium) (6x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1.5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'yellow-cotton-buff-small-3x50',
    name: 'Yellow cotton buff (small) (3x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'white-cotton-buff-medium-6x50',
    name: 'White cotton buff (medium) (6x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1.5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'white-cotton-buff-3x50',
    name: 'White cotton buff (3x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-2-0',
    name: 'Sawing Blade 2.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-3-0',
    name: 'Sawing Blade 3.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-6-0',
    name: 'Sawing Blade 6.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'soldering-water-200-ml',
    name: 'Soldering Water (200 ML)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 0.8,
    image: '/products/Soldering-water-200ml.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-water-400-ml',
    name: 'Soldering Water (400 ML)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 1,
    image: '/products/Soldering-water-400ml.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-water-1-ml',
    name: 'Soldering Water (1L)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 2.5,
    image: '/products/Soldering-water-1L.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-25x12-5-cm',
    name: 'Soldering Sheet (25 cm * 12.5 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-30x15-cm',
    name: 'Soldering Sheet (30 cm * 15 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 1.5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-25x25-cm',
    name: 'Soldering Sheet (25 cm * 25 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 2,
    image: '',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-30x25-cm',
    name: 'Soldering Sheet (30 cm * 25 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 2.5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-30x30-cm',
    name: 'Soldering Sheet (30 cm * 30 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 3,
    image: '',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-35x25-5-cm',
    name: 'Soldering Sheet (35 cm * 25.5 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 3,
    image: '',
    countInStock: 0
  },
  {
    _id: 'swaraj-gas-burner-0',
    name: 'Swaraj Gas Burner 0',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 2,
    image: '/products/swaraj-burner-0.jpg',
    countInStock: 0
  },
  {
    _id: 'swaraj-gas-burner-3938',
    name: 'Swaraj Gas Burner 3938',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 2,
    image: '/products/swaraj-burner-3938.jpg',
    countInStock: 0
  },
  {
    _id: 'swaraj-gas-burner-3940',
    name: 'Swaraj Gas Burner 3940',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 2.5,
    image: '/products/swaraj-burner-3940.jpg',
    countInStock: 0
  },
  {
    _id: 'swaraj-gas-burner-2942',
    name: 'Swaraj Gas Burner 2942',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'sievert-gas-burner-2941',
    name: 'Sievert Gas Burner 2941',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 8,
    image: '',
    countInStock: 0
  },
  {
    _id: 'gemka-burner-3938',
    name: 'Gemka Burner 3938',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 2,
    image: '',
    countInStock: 0
  },
  {
    _id: 'gemka-burner-3939',
    name: 'Gemka Burner 3939',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 3,
    image: '/products/gemka-burner-3939.jpg',
    countInStock: 0
  },
  {
    _id: 'gemka-burner-2940',
    name: 'Gemka Burner 2940',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 3,
    image: '',
    countInStock: 0
  },
  {
    _id: 'gemka-burner-2943',
    name: 'Gemka Burner 2943',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'wheel-brush-black',
    name: 'Wheel brush black',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.4,
    image: '',
    countInStock: 0
  },
  {
    _id: 'angled-brass-wire-brush',
    name: 'Angled brass wire brush',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'larger-brush-dense-brass-wire-brush',
    name: 'Dense brass wire brush',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.8,
    image: '',
    countInStock: 0
  },
  {
    _id: 'magnetic-pen-1kg',
    name: 'Magnetic Pen (1 kg)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 18,
    image: '',
    countInStock: 0
  },
  {
    _id: 'stamp-21',
    name: 'Stamp 21',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 2,
    image: '/products/stamp-21.jpg',
    countInStock: 0
  },
  {
    _id: 'tar',
    name: 'Tar',
    category: 'Tools',
    subcategory: 'Others',
    description: '0.3 BD per one (0.25 BD if more).',
    price: 0.3,
    image: '',
    countInStock: 0
  },
  {
    _id: 'casting-sand-1kg',
    name: 'Casting Sand (1 kg)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 1.5,
    image: '',
    countInStock: 0
  },
  {
    _id: 'screw-plate',
    name: 'Screw Plate',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 1,
    image: '',
    countInStock: 0
  },
  {
    _id: 'castaldo-spray',
    name: 'Castaldo Spray',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 5,
    image: '/products/castaldo-spray.jpg',
    countInStock: 0
  },
  {
    _id: 'ring-stick',
    name: 'Ring Stick',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 3,
    image: '/products/ring-stick.jpg',
    countInStock: 0
  },
  {
    _id: 'ring-sizer',
    name: 'Ring sizer',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 5,
    image: '/products/ring-sizer.jpg',
    countInStock: 0
  },
  {
    _id: 'red-black-polish',
    name: 'Red/black polish',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 2,
    image: '',
    countInStock: 0
  },
  {
    _id: 'goldsmith-shovel',
    name: 'Goldsmith Shovel',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 0.5,
    image: '/products/shovel.jpg',
    countInStock: 0
  },
  {
    _id: 'wax',
    name: 'Wax',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 5,
    image: '/products/wax.jpg',
    countInStock: 0
  },
  {
    _id: 'araldite-glue',
    name: 'Araldite Glue',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 1.5,
    image: '/products/Araldite.jpg',
    countInStock: 0
  },
  {
    _id: 'mesh',
    name: 'Mesh',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 0.5,
    image: '/products/mesh.jpg',
    countInStock: 0
  },
  {
    _id: 'gold-jewelry-polishing-cloth',
    name: 'Gold Jewelry Polishing Cloth',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 2,
    image: '',
    countInStock: 0
  },
  {
    _id: 'silver-jewelry-polishing-cloth',
    name: 'Silver Jewelry Polishing Cloth',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 2,
    image: '',
    countInStock: 0
  },
  {
    _id: 'liquid-gold-cleaning',
    name: 'Liquid Gold Cleaning',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 3,
    image: '',
    countInStock: 0
  },
  {
    _id: 'silver-cleaning-liquid',
    name: 'Silver Cleaning Liquid',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 4.5,
    image: '/products/silver-cleaner.jpg',
    countInStock: 0
  },
  {
    _id: 'electronic-scale-100g',
    name: 'Electronic scale 100g',
    category: 'Scales',
    subcategory: null,
    description: 'Scale product.',
    price: 12,
    image: '/products/electronic-scale-100g.jpg',
    countInStock: 0
  }
];

export const DEFAULT_MINERAL_PRODUCTS = [
  {
    _id: 'brass-cube-1kg',
    name: 'Brass cube (1 kg)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 23,
    image: '/products/brass-cube.jpg',
    countInStock: 0
  },
  {
    _id: 'copper-grains-100g',
    name: 'Copper Grains (100 g)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 1.3,
    image: '/products/copper-grains-100g.jpg',
    countInStock: 0
  },
  {
    _id: 'copper-grains-500g',
    name: 'Copper Grains (500 g)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 6.5,
    image: '/products/copper-grains-500g.jpg',
    countInStock: 0
  },
  {
    _id: 'copper-grains-1kg',
    name: 'Copper Grains (1 kg)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 13,
    image: '/products/copper-grains-1kg.jpg',
    countInStock: 0
  },
  {
    _id: 'zinc-100g',
    name: 'Zinc (100 g)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 2.3,
    image: '/products/zinc-grains-100g.jpg',
    countInStock: 0
  },
  {
    _id: 'zinc-500g',
    name: 'Zinc (500 g)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 11.5,
    image: '/products/zinc-grains-500g.jpg',
    countInStock: 0
  },
  {
    _id: 'zinc-1kg',
    name: 'Zinc (1 kg)',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 23,
    image: '/products/zinc-grains-1kg.jpg',
    countInStock: 0
  },
  {
    _id: 'auruna-264',
    name: 'Auruna 264',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 120,
    image: '/products/auruna-264.jpg',
    countInStock: 0
  },
  {
    _id: 'rhoduna-275-black',
    name: 'Rhoduna 275 Black',
    category: 'Minerals',
    subcategory: null,
    description: 'Mineral product.',
    price: 350,
    image: '/products/rhoduna-275.jpg',
    countInStock: 0
  },
];

export const DEFAULT_PRODUCTS = [
  ...DEFAULT_MACHINE_PRODUCTS,
  ...DEFAULT_TOOL_PRODUCTS,
  ...DEFAULT_GEMSTONE_PRODUCTS,
  ...DEFAULT_MINERAL_PRODUCTS
];
