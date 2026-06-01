export const MAIN_CATEGORIES = [
  'All Products',
  'Gemstones',
  'Tools',
  'Scales',
  'Machines',
  'Minerals',
  'Plastic',
  'Beads'
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
  'Lapis',
  'Quartz'
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
    _id: 'blue-lapis',
    name: 'Blue Lapis',
    category: 'Gemstones',
    subcategory: 'Lapis',
    description: 'Gemstone product priced per piece.',
    price: 2,
    image: '/products/blue-lapis.jpg',
    countInStock: 0,
    unit: 'piece',
    requiresQuantitySelection: true
  },
  {
    _id: 'blue-eye-stone-flat-round',
    name: 'Blue eye stone - Flat round',
    category: 'Gemstones',
    subcategory: 'Eye Stone',
    description: 'Select your preferred flat round blue eye stone size before choosing how many grams to add to cart.',
    price: 0,
    image: '/products/blue-eye-stone.jpg',
    countInStock: 0,
    unit: 'gram',
    isBundleProduct: true,
    bundleLabel: 'size',
    bundleDescription: 'Available in the following sizes: 5 mm.',
    bundleOptions: [
      {
        _id: 'blue-eye-stone-flat-round-5mm',
        name: 'Blue eye stone - Flat round 5 mm',
        category: 'Gemstones',
        subcategory: 'Eye Stone',
        description: 'Gemstone product priced per gram.',
        price: 0,
        image: '/products/blue-eye-stone.jpg',
        countInStock: 0,
        unit: 'gram',
        sizeLabel: '5 mm'
      }
    ]
  },
  {
    _id: 'quartz',
    name: 'Quartz',
    category: 'Gemstones',
    subcategory: 'Quartz',
    description: 'Select your preferred quartz size before choosing how many grams to add to cart.',
    price: 0,
    image: '/products/quartz-7-10.jpg',
    countInStock: 0,
    unit: 'gram',
    isBundleProduct: true,
    bundleLabel: 'size',
    bundleDescription: 'Available in the following sizes: 7 * 10 mm, 17mm * 25mm.',
    bundleOptions: [
      {
        _id: 'quartz-7-10mm',
        name: 'Quartz 7 * 10 mm',
        category: 'Gemstones',
        subcategory: 'Quartz',
        description: 'Gemstone product priced per gram.',
        price: 0,
        image: '/products/quartz-7-10.jpg',
        countInStock: 0,
        unit: 'gram',
        sizeLabel: '7 * 10 mm'
      },
      {
        _id: 'quartz-oval-17-25mm',
        name: 'Quartz oval 17mm * 25mm',
        category: 'Gemstones',
        subcategory: 'Quartz',
        description: 'Gemstone product priced per gram.',
        price: 0,
        image: '/products/quartz-17-25.jpg',
        countInStock: 0,
        unit: 'gram',
        sizeLabel: '17mm * 25mm'
      }
    ]
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
    image: '/products/round-turquoise-1mm.jpg',
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
    image: '/products/round-turquoise-1.5mm.jpg',
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
    image: '/products/round-turquoise-2mm.jpg',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-round-3mm',
    name: 'Turquoise Round 3 mm',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 1,
    image: '/products/round-turquoise-3mm.jpg',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'turquoise-round-4mm',
    name: 'Turquoise Round 4 mm',
    category: 'Gemstones',
    subcategory: 'Turquoise',
    description: 'Gemstone product priced per gram.',
    price: 1,
    image: '/products/round-turquoise-4mm.jpg',
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
    image: '/products/round-turquoise-5mm.jpg',
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
    description: 'Select your preferred turquoise oval size before choosing how many grams to add to cart.',
    price: 0.5,
    image: '/products/oval-turquoise-cover.jpg',
    countInStock: 0,
    unit: 'gram',
    isBundleProduct: true,
    bundleLabel: 'size',
    bundleDescription: 'Available in the following sizes: 1-2 mm, 2-3 mm, 4-5 mm.',
    bundleOptions: [
      {
        _id: 'turquoise-oval-1-2mm',
        name: 'Turquoise Oval 1-2 mm',
        category: 'Gemstones',
        subcategory: 'Turquoise',
        description: 'Gemstone product priced per gram.',
        price: 2,
        image: '/products/oval-turquoise-cover.jpg',
        countInStock: 0,
        unit: 'gram',
        sizeLabel: '1-2 mm'
      },
      {
        _id: 'turquoise-oval-2-3mm',
        name: 'Turquoise Oval 2-3 mm',
        category: 'Gemstones',
        subcategory: 'Turquoise',
        description: 'Gemstone product priced per gram.',
        price: 1,
        image: '/products/oval-turquoise-cover.jpg',
        countInStock: 0,
        unit: 'gram',
        sizeLabel: '2-3 mm'
      },
      {
        _id: 'turquoise-oval-4-5mm',
        name: 'Turquoise Oval 4-5 mm',
        category: 'Gemstones',
        subcategory: 'Turquoise',
        description: 'Gemstone product priced per gram.',
        price: 0.5,
        image: '/products/oval-turquoise-cover.jpg',
        countInStock: 0,
        unit: 'gram',
        sizeLabel: '4-5 mm'
      }
    ]
  },
  {
    _id: 'white-zarcon-small',
    name: 'White Zarcon Small',
    category: 'Gemstones',
    subcategory: 'Zarcoon',
    description: 'Gemstone product priced per gram.',
    price: 0.8,
    image: '/products/white-zarcon-small.jpg',
    countInStock: 0,
    unit: 'gram'
  },
  {
    _id: 'white-zarcon-large',
    name: 'White Zarcon Large',
    category: 'Gemstones',
    subcategory: 'Zarcoon',
    description: 'Gemstone product priced per gram.',
    price: 0.5,
    image: '/products/white-zarcon-large.jpg',
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
    image: '/products/benchgrinder.jpg',
    countInStock: 0
  },
  {
    _id: 'freedom-machine',
    name: 'Foredom',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product. Price will be updated.',
    price: 25,
    image: '/products/foredom.jpg',
    countInStock: 0
  },
  {
    _id: 'furnace-machine',
    name: 'Furnace',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product. Price will be updated.',
    price: 160,
    image: '/products/furnace-machine.jpg',
    countInStock: 0
  },
  {
    _id: 'ultrasonic-cleaner-12l-large',
    name: 'Ultrasonic cleaner (12L Large)',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 175,
    image: '/products/ultrasonic-12L.jpg',
    countInStock: 0
  },
  {
    _id: 'ultrasonic-cleaner-5-7l-medium',
    name: 'Ultrasonic cleaner (5.7L Medium)',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 145,
    image: '/products/ultrasonic-5.7L.jpg',
    countInStock: 0
  },
  {
    _id: 'ultrasonic-cleaner-1-8l',
    name: 'Ultrasonic 1.8L',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 30,
    image: '/products/ultrasonic-1.8L.jpg',
    countInStock: 0
  },
  {
    _id: 'ultrasonic-cleaner-1-8l-v2',
    name: 'Ultrasonic 1.8L - v2',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 35,
    image: '/products/ultrasonic-1.8L - v2.jpg',
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
  },
  {
    _id: 'ring-expander-and-reducer',
    name: 'Ring Expander and Reducer',
    category: 'Machines',
    subcategory: null,
    description: 'Machine product.',
    price: 50,
    image: '/products/ring-expander-and-reducer.jpg',
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
    name: 'Yellow cotton buff (large) (6x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1.5,
    image: '/products/yellow-buff-6-50.jpg',
    countInStock: 0
  },
  {
    _id: 'yellow-cotton-buff-medium-4x50',
    name: 'Yellow cotton buff (medium) (4x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1,
    image: '/products/yellow-buff-4-50.jpg',
    countInStock: 0
  },
  {
    _id: 'yellow-cotton-buff-small-3x50',
    name: 'Yellow cotton buff (small) (3x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 0.5,
    image: '/products/yellow-buff-3-50.jpg',
    countInStock: 0
  },
  {
    _id: 'white-cotton-buff-medium-6x50',
    name: 'White cotton buff (6x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1.5,
    image: '/products/white-buff-6-50.jpg',
    countInStock: 0
  },
  {
    _id: 'white-cotton-buff-4x50',
    name: 'White cotton buff (4x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 1,
    image: '/products/white-buff-4-50.jpg',
    countInStock: 0
  },
  {
    _id: 'white-cotton-buff-3x50',
    name: 'White cotton buff (3x50)',
    category: 'Tools',
    subcategory: 'Cotton Buff',
    description: 'Tool product.',
    price: 0.5,
    image: '/products/white-buff-3-50.jpg',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-2-0',
    name: 'Sawing Blade 2.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 5,
    image: '/products/sawing-blades-2.0.jpg',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-3-0',
    name: 'Sawing Blade 3.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 5,
    image: '/products/sawing-blades-3.0.jpg',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-5-0',
    name: 'Sawing Blade 5.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 8,
    image: '/products/sawing-blades-5.0.jpg',
    countInStock: 0
  },
  {
    _id: 'sawing-blade-6-0',
    name: 'Sawing Blade 6.0',
    category: 'Tools',
    subcategory: 'Sawing Blades',
    description: 'Tool product.',
    price: 8,
    image: '/products/sawing-blades-6.0.jpg',
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
    _id: 'soldering-sheet-15x30-cm',
    name: 'Soldering Sheet (15 cm * 30 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 1.5,
    image: '/products/soldering-sheet-15-30.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-25x25-cm',
    name: 'Soldering Sheet (25 cm * 25 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 2,
    image: '/products/soldering-sheet-25-25.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-25-5x30-cm',
    name: 'Soldering Sheet (25.5 cm * 30 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 2.5,
    image: '/products/soldering-sheet-25.5-30.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-30x30-cm',
    name: 'Soldering Sheet (30 cm * 30 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 3.5,
    image: '/products/soldering-sheet-30-30.jpg',
    countInStock: 0
  },
  {
    _id: 'soldering-sheet-25-5x35-cm',
    name: 'Soldering Sheet (25.5 cm * 35 cm)',
    category: 'Tools',
    subcategory: 'Soldering',
    description: 'Tool product.',
    price: 3,
    image: '/products/soldering-sheet-25.5-35.jpg',
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
    _id: 'sievert-gas-burner-2941',
    name: 'Sievert Gas Burner 2941',
    category: 'Tools',
    subcategory: 'Burners',
    description: 'Tool product.',
    price: 8,
    image: '/products/sievert-gas-burner-2941.jpg',
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
    _id: 'diamond-needle-files',
    name: 'Diamond Needle Files',
    category: 'Tools',
    subcategory: 'File',
    description: 'Tool product.',
    price: 10,
    image: '/products/diamond-needle-files.jpg',
    countInStock: 0
  },
  {
    _id: 'diamond-selector-tool',
    name: 'Diamond Selector Tool',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 10,
    image: '/products/diamond-selector-tool.jpg',
    countInStock: 0
  },
  {
    _id: 'wheel-brush-black-small',
    name: 'Wheel brush black (small)',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.4,
    image: '/products/wheel-brush-black-small.jpg',
    countInStock: 0
  },
  {
    _id: 'wheel-brush-black-large',
    name: 'Wheel brush black (large)',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.5,
    image: '/products/wheel-brush-black-large.jpg',
    countInStock: 0
  },
  {
    _id: 'brass-wire-brush-small',
    name: 'Angled brass wire brush (small)',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.5,
    image: '/products/angled-brass-wire-brush-small.jpg',
    countInStock: 0
  },
  {
    _id: 'brass-wire-brush-medium',
    name: 'Angled brass wire brush (medium)',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.6,
    image: '/products/angled-brass-wire-brush-medium.jpg',
    countInStock: 0
  },
  {
    _id: 'brass-wire-brush-large',
    name: 'Angled brass wire brush (large)',
    category: 'Tools',
    subcategory: 'Brushes',
    description: 'Tool product.',
    price: 0.8,
    image: '/products/angled-brass-wire-brush-large.jpg',
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
    _id: 'thickness-gauge-10mm',
    name: 'Thickness Gauge (10mm)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 6,
    image: '/products/measurement-gauge-10mm.jpg',
    countInStock: 0
  },
  {
    _id: 'thickness-gauge-20mm',
    name: 'Thickness Gauge (20mm)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 7,
    image: '/products/measurement-gauge-20mm.jpg',
    countInStock: 0
  },
  {
    _id: 'red-black-polish',
    name: 'Red/black polish',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Tool product.',
    price: 2,
    image: '/products/red-and-black-polish.jpg',
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
    _id: 'steel-cylinder-small',
    name: 'Steel Cylinder (Small)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Small steel cylinder: 12 cm x 9.5 cm.',
    price: 6,
    image: '/products/steel-cylinder-small.jpg',
    countInStock: 0
  },
  {
    _id: 'steel-cylinder-medium',
    name: 'Steel Cylinder (Medium)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Medium steel cylinder: 20 cm x 10 cm.',
    price: 8,
    image: '/products/steel-cylinder-medium.jpg',
    countInStock: 0
  },
  {
    _id: 'steel-cylinder-large',
    name: 'Steel Cylinder (Large)',
    category: 'Tools',
    subcategory: 'Others',
    description: 'Large steel cylinder: 25 cm x 12.5 cm.',
    price: 12,
    image: '/products/steel-cylinder-large.jpg',
    countInStock: 0
  },
  {
    _id: 'gold-jewelry-polishing-cloth',
    name: 'Gold Jewelry Polishing Cloth',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 4,
    image: '/products/gold-jewelry-cleaner-cloth.jpg',
    countInStock: 0
  },
  {
    _id: 'silver-jewelry-polishing-cloth',
    name: 'Silver Polishing Cloth',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 4,
    image: '/products/silver-jewelry-cleaner-cloth.jpg',
    countInStock: 0
  },
  {
    _id: 'liquid-gold-cleaning',
    name: 'Liquid Gold Cleaning',
    category: 'Tools',
    subcategory: 'Gold and silver cleaners',
    description: 'Tool product.',
    price: 3,
    image: '/products/goldbad.jpg',
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
    _id: 'gold-star-omega',
    name: 'Gold Star Omega',
    category: 'Tools',
    subcategory: 'Others',
    description: '45 kg.',
    price: 35,
    image: '/products/gold-star-omega.jpg',
    countInStock: 0
  },
  {
    _id: 'electronic-scale-100g',
    name: 'Electronic Scale (100g)',
    category: 'Scales',
    subcategory: null,
    description: 'Scale product.',
    price: 12,
    image: '/products/electronic-scale-100g.jpg',
    countInStock: 0
  },
  {
    _id: 'electronic-scale-600g',
    name: 'Electronic Scale (600g)',
    category: 'Scales',
    subcategory: null,
    description: 'Scale product.',
    price: 25,
    image: '/products/electronic-scale-100g.jpg',
    countInStock: 0
  },
  {
    _id: 'electronic-scale-3kg',
    name: 'Electronic Scale (3 kg)',
    category: 'Scales',
    subcategory: null,
    description: 'Scale product.',
    price: 180,
    image: '/products/electronic-scale-100g.jpg',
    countInStock: 0
  },
  {
    _id: 'calibration-weight',
    name: 'Calibration weight',
    category: 'Scales',
    subcategory: null,
    description: 'Select your preferred calibration weight before adding to cart.',
    price: 15,
    image: '/products/calibration-weight-1kg.jpg',
    countInStock: 0,
    isBundleProduct: true,
    bundleLabel: 'weight',
    bundleDescription: 'Available in the following weights: 500g, 1 kg.',
    bundleOptions: [
      {
        _id: 'calibration-weight-500g',
        name: 'Calibration weight 500g',
        category: 'Scales',
        subcategory: null,
        description: 'Calibration weight.',
        price: 8,
        image: '/products/calibration-weight-500g.jpg',
        countInStock: 0,
        sizeLabel: '500g'
      },
      {
        _id: 'calibration-weight-1kg',
        name: 'Calibration weight 1 kg',
        category: 'Scales',
        subcategory: null,
        description: 'Calibration weight.',
        price: 15,
        image: '/products/calibration-weight-1kg.jpg',
        countInStock: 0,
        sizeLabel: '1 kg'
      }
    ]
  }
];

export const DEFAULT_PLASTIC_PRODUCTS = [
  {
    _id: 'nylon-plastic-bags-6-8',
    name: 'Nylon Plastic Bags (6 cm x 8 cm)',
    category: 'Plastic',
    subcategory: null,
    description: 'Plastic bag product.',
    price: 0.5,
    image: '/products/plastic-bag-6-8.jpg',
    countInStock: 0
  },
  {
    _id: 'nylon-plastic-bags-7-10',
    name: 'Nylon Plastic Bags (7 cm x 10 cm)',
    category: 'Plastic',
    subcategory: null,
    description: 'Plastic bag product.',
    price: 0.5,
    image: '/products/plastic-bag-7-10.jpg',
    countInStock: 0
  },
  {
    _id: 'nylon-plastic-bags-9-13',
    name: 'Nylon Plastic Bags (9 cm x 13 cm)',
    category: 'Plastic',
    subcategory: null,
    description: 'Plastic bag product.',
    price: 1,
    image: '/products/plastic-bag-9-13.jpg',
    countInStock: 0
  },
  {
    _id: 'nylon-plastic-bags-12-17',
    name: 'Nylon Plastic Bags (12 cm x 17 cm)',
    category: 'Plastic',
    subcategory: null,
    description: 'Plastic bag product.',
    price: 1,
    image: '/products/plastic-bag-12-17.jpg',
    countInStock: 0
  }
];

export const DEFAULT_BEAD_PRODUCTS = [
  {
    _id: 'natural-amber-bracelet',
    name: 'Natural Amber Bracelet',
    category: 'Beads',
    subcategory: null,
    description: 'Select your preferred bracelet weight before adding to cart.',
    price: 0,
    image: '/products/natural-amber-bracelet.jpg',
    countInStock: 0
  },
  {
    _id: 'natural-amber-bracelet-13g',
    name: 'Natural Amber Bracelet (13g)',
    category: 'Beads',
    subcategory: null,
    description: 'Natural amber bracelet.',
    price: 26,
    image: '/products/natural-amber-bracelet-26-bd.jpg',
    countInStock: 0
  },
  {
    _id: 'natural-amber-bracelet-16g',
    name: 'Natural Amber Bracelet (16g)',
    category: 'Beads',
    subcategory: null,
    description: 'Natural amber bracelet.',
    price: 32,
    image: '/products/natural-amber-bracelet-32-bd.jpg',
    countInStock: 0
  },
  {
    _id: 'natural-amber-bracelet-19g',
    name: 'Natural Amber Bracelet (19g)',
    category: 'Beads',
    subcategory: null,
    description: 'Natural amber bracelet.',
    price: 38,
    image: '/products/natural-amber-bracelet-38-bd.jpg',
    countInStock: 0
  },
  {
    _id: 'natural-amber-bracelet-25g',
    name: 'Natural Amber Bracelet (25g)',
    category: 'Beads',
    subcategory: null,
    description: 'Natural amber bracelet.',
    price: 50,
    image: '/products/natural-amber-bracelet-50-bd.jpg',
    countInStock: 0
  },
  {
    _id: 'natural-amber-bracelet-30g',
    name: 'Natural Amber Bracelet (30g)',
    category: 'Beads',
    subcategory: null,
    description: 'Natural amber bracelet.',
    price: 60,
    image: '/products/natural-amber-bracelet-60-bd.jpg',
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
  ...DEFAULT_PLASTIC_PRODUCTS,
  ...DEFAULT_BEAD_PRODUCTS,
  ...DEFAULT_MINERAL_PRODUCTS
];
