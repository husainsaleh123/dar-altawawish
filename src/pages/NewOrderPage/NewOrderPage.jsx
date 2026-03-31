import styles from './NewOrderPage.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { getAll } from '../../utilities/products-api';
import { useNavigate } from 'react-router-dom';
import {
  ALL_GEMSTONES_OPTION,
  ALL_TOOLS_OPTION,
  DEFAULT_PRODUCTS,
  GEMSTONE_SUBCATEGORIES,
  MAIN_CATEGORIES,
  TOOL_SUBCATEGORIES
} from '../../shared/productCatalog';

const PRODUCT_IMAGE_BY_KEY = new Map(
  DEFAULT_PRODUCTS
    .map((product) => [String(product?._id || '').trim().toLowerCase(), String(product?.image || '').trim()])
    .filter(([catalogKey, image]) => catalogKey && image)
);
const PRODUCT_IMAGE_CACHE_VERSION = import.meta.env.DEV
  ? String(Date.now())
  : '2026-03-30-1005';

function inferMainCategory(product) {
  const source = [
    product?.category,
    product?.subcategory,
    product?.name,
    product?.description
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    /\bgem(stone|stones)?\b/.test(source) ||
    GEMSTONE_SUBCATEGORIES.some((subcategory) => source.includes(subcategory.toLowerCase()))
  ) {
    return 'Gemstones';
  }
  if (source.includes('scale')) return 'Scales';
  if (source.includes('tool') || source.includes('crucible') || source.includes('file') || source.includes('solder')) return 'Tools';
  if (source.includes('machine')) return 'Machines';
  if (source.includes('mineral')) return 'Minerals';
  if (source.includes('plastic')) return 'Plastic';
  if (source.includes('thread')) return 'Threads';
  return null;
}

function inferGemstoneSubcategory(product) {
  const directSubcategory = String(product?.subcategory || '').trim();
  if (directSubcategory) {
    const matched = GEMSTONE_SUBCATEGORIES.find(
      (subcategory) => subcategory.toLowerCase() === directSubcategory.toLowerCase()
    );
    if (matched) return matched;
  }

  const source = [product?.name, product?.description, product?.subcategory]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    GEMSTONE_SUBCATEGORIES.find((subcategory) => source.includes(subcategory.toLowerCase())) || null
  );
}

function inferToolSubcategory(product) {
  const directSubcategory = String(product?.subcategory || '').trim();
  if (directSubcategory) {
    const matched = TOOL_SUBCATEGORIES.find(
      (subcategory) => subcategory.toLowerCase() === directSubcategory.toLowerCase()
    );
    if (matched) return matched;
  }

  const source = [product?.name, product?.description, product?.subcategory]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (source.includes('crucible')) return 'Crucibles';
  if (source.includes('buff')) return 'Cotton Buff';
  if (source.includes('saw') || source.includes('blade')) return 'Sawing Blades';
  if (source.includes('soldering') || source.includes('flux')) return 'Soldering';
  if (source.includes('burner') || source.includes('torch')) return 'Burners';
  if (source.includes('drill bit') || (source.includes('drill') && source.includes('bit'))) return 'Drill Bit';
  if (/\bfile\b/.test(source)) return 'File';
  if (source.includes('brush')) return 'Brushes';
  if (source.includes('scale')) return 'Scales';
  if (source.includes('cleaner') || (source.includes('gold') && source.includes('silver') && source.includes('clean'))) {
    return 'Gold and silver cleaners';
  }
  return 'Others';
}

function formatPrice(value) {
  if (typeof value !== 'number') return value || '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(value);
}

function getVersionedProductImageSrc(imageSrc, versionSeed) {
  const normalizedSrc = String(imageSrc || '').trim();
  if (!normalizedSrc) return '';
  if (!normalizedSrc.startsWith('/products/')) return normalizedSrc;

  const normalizedSeed = String(versionSeed || '').trim();
  const finalSeed = normalizedSeed
    ? `${normalizedSeed}-${PRODUCT_IMAGE_CACHE_VERSION}`
    : PRODUCT_IMAGE_CACHE_VERSION;

  const separator = normalizedSrc.includes('?') ? '&' : '?';
  return `${normalizedSrc}${separator}v=${encodeURIComponent(finalSeed)}`;
}

function getResolvedProductImage(product) {
  const configuredImage = String(product?.image || '').trim();
  if (configuredImage) return configuredImage;

  const catalogKey = String(product?.catalogKey || product?._id || '').trim().toLowerCase();
  return PRODUCT_IMAGE_BY_KEY.get(catalogKey) || '';
}

function getBundleCoverImage(variants) {
  if (!Array.isArray(variants) || !variants.length) return '';
  return variants.find((variant) => String(variant?.image || '').trim())?.image || '';
}

const SOLDERING_WATER_ORDER = ['200 ML', '400 ML', '1L'];
const GRAPHITE_CRUCIBLE_ORDER = ['No. 1', 'No. 1.5', 'No. 2', 'No. 3', 'No. 4', 'No. 5', 'No. 6'];
const ROUND_GEMSTONE_SIZE_ORDER = ['1 mm', '1.5 mm', '2 mm', '3.5 mm', '5 mm'];
const YELLOW_COTTON_BUFF_ORDER = ['small 3x50', 'medium 6x50'];
const WHITE_COTTON_BUFF_ORDER = ['3x50', 'medium 6x50'];
const GRAPHITE_CRUCIBLE_DIMENSIONS = {
  'No. 1': '9 cm width x 8.5 cm height',
  'No. 1.5': '10 cm width x 10.5 cm height',
  'No. 2': '11 cm width x 12 cm height',
  'No. 3': '12 cm width x 13.5 cm height',
  'No. 4': '13.5 cm width x 14 cm height',
  'No. 5': '14.5 cm width x 16.5 cm height',
  'No. 6': '15 cm width x 16.5 cm height'
};

function isSolderingWaterProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('soldering water');
}

function getSolderingWaterSizeLabel(product) {
  const match = String(product?.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function isGraphiteCrucibleProduct(product) {
  return /^crucible no\./i.test(String(product?.name || '').trim());
}

function getGraphiteCrucibleSizeLabel(product) {
  const match = String(product?.name || '').match(/(No\.\s*[0-9.]+)/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function getGraphiteCrucibleDimensionLabel(product) {
  return GRAPHITE_CRUCIBLE_DIMENSIONS[getGraphiteCrucibleSizeLabel(product)] || '';
}

function getGraphiteCrucibleBaseDescription(product) {
  return String(product?.description || '').replace(/\s+/g, ' ').trim().replace(/[.:\s]+$/, '');
}

function isRoundCoralProduct(product) {
  const name = String(product?.name || '').toLowerCase();
  return (
    String(product?.subcategory || '').toLowerCase() === 'coral' &&
    name.includes('round')
  );
}

function isRoundTurquoiseProduct(product) {
  const name = String(product?.name || '').toLowerCase();
  return (
    String(product?.subcategory || '').toLowerCase() === 'turquoise' &&
    name.includes('round')
  );
}

function isVanCliffMalakiteProduct(product) {
  const name = String(product?.name || '').toLowerCase();
  return (
    String(product?.subcategory || '').toLowerCase() === 'malakite' &&
    name.includes('van cliff malakite')
  );
}

function getRoundGemstoneSizeLabel(product) {
  const match = String(product?.name || '').match(/(\d+(?:\.\d+)?)\s*mm/i);
  return match ? `${match[1]} mm` : '';
}

function getVanCliffMalakiteSizeLabel(product) {
  const match = String(product?.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function isCopperGrainsProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('copper grains');
}

function getCopperGrainsSizeLabel(product) {
  const match = String(product?.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function getCopperGrainsVariantImage(product) {
  const configuredImage = String(product?.image || '').trim();
  if (configuredImage) return configuredImage;

  const sizeLabel = getCopperGrainsSizeLabel(product).toLowerCase();
  if (sizeLabel === '100 g') return '/products/copper-grains-100g.jpg';
  if (sizeLabel === '500 g') return '/products/copper-grains-500g.jpg';
  if (sizeLabel === '1 kg') return '/products/copper-grains-1kg.jpg';
  return '';
}

function isLegacyCopperProduct(product) {
  return String(product?.name || '').toLowerCase() === 'copper (1 kg)';
}

function isZincProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('zinc');
}

function getZincSizeLabel(product) {
  const match = String(product?.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function getZincVariantImage(product) {
  const configuredImage = String(product?.image || '').trim();
  if (configuredImage) return configuredImage;

  const sizeLabel = getZincSizeLabel(product).toLowerCase();
  if (sizeLabel === '100 g') return '/products/zinc-grains-100g.jpg';
  if (sizeLabel === '500 g') return '/products/zinc-grains-500g.jpg';
  if (sizeLabel === '1 kg') return '/products/zinc-grains-1kg.jpg';
  return '';
}

function isGemkaBurnerProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('gemka burner');
}

function getGemkaBurnerSizeLabel(product) {
  const match = String(product?.name || '').match(/(\d+)$/);
  return match ? match[1] : '';
}

function isSawingBladeProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('sawing blade');
}

function isYellowCottonBuffProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('yellow cotton buff');
}

function getYellowCottonBuffSizeLabel(product) {
  const match = String(product?.name || '').toLowerCase().match(/yellow cotton buff\s*(?:\(([^)]+)\))?\s*\(([^)]+)\)/);
  if (!match) return '';

  const descriptor = String(match[1] || '').trim();
  const size = String(match[2] || '').trim();
  return descriptor ? `${descriptor} ${size}` : size;
}

function isWhiteCottonBuffProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('white cotton buff');
}

function getWhiteCottonBuffSizeLabel(product) {
  const match = String(product?.name || '').toLowerCase().match(/white cotton buff\s*(?:\(([^)]+)\))?\s*\(([^)]+)\)/);
  if (!match) return '';

  const descriptor = String(match[1] || '').trim();
  const size = String(match[2] || '').trim();
  return descriptor ? `${descriptor} ${size}` : size;
}

function getSawingBladeSizeLabel(product) {
  const match = String(product?.name || '').match(/(\d+(?:\.\d+)?)$/);
  return match ? match[1] : '';
}

function isSolderingSheetProduct(product) {
  return String(product?.name || '').toLowerCase().startsWith('soldering sheet');
}

function getSolderingSheetSizeLabel(product) {
  const match = String(product?.name || '').match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function isHiddenLegacyProduct(product) {
  const name = String(product?.name || '').trim().toLowerCase();
  return (
    name === 'net/mesh (jalee in indian)' ||
    name === 'rhoduna 275 black (100ml)' ||
    name === 'auruna 264 (100ml)' ||
    name === 'aurum 264 (100ml)' ||
    name === 'silver jewelry cleaner liquid'
  );
}

export default function NewOrderPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [activeGemstoneSubcategory, setActiveGemstoneSubcategory] = useState(ALL_GEMSTONES_OPTION);
  const [activeToolSubcategory, setActiveToolSubcategory] = useState(ALL_TOOLS_OPTION);
  const [sortBy, setSortBy] = useState('name-a-z');
  const [searchTerm, setSearchTerm] = useState('');
  const [gemstoneModalProduct, setGemstoneModalProduct] = useState(null);
  const [gemstoneModalGrams, setGemstoneModalGrams] = useState('1');
  const [pieceModalProduct, setPieceModalProduct] = useState(null);
  const [pieceModalQuantity, setPieceModalQuantity] = useState('1');
  const [bundleModalProduct, setBundleModalProduct] = useState(null);
  const [selectedBundleOptionId, setSelectedBundleOptionId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [bundlePreviewOptionIds, setBundlePreviewOptionIds] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedProductName, setAddedProductName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getAll();
        setProducts(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(err?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categorizedProducts = useMemo(() => {
    const withCategories = products.map((product) => ({
      ...product,
      image: getResolvedProductImage(product),
      mainCategory: inferMainCategory(product)
    }));

    const groupedProducts = [];
    const solderingWaterVariants = [];
    const graphiteCrucibleVariants = [];
    const roundCoralVariants = [];
    const roundTurquoiseVariants = [];
    const vanCliffMalakiteVariants = [];
    const copperGrainsVariants = [];
    const zincVariants = [];
    const gemkaBurnerVariants = [];
    const sawingBladeVariants = [];
    const yellowCottonBuffVariants = [];
    const whiteCottonBuffVariants = [];
    const solderingSheetVariants = [];

    withCategories.forEach((product) => {
      if (isHiddenLegacyProduct(product)) {
        return;
      }
      if (isSolderingWaterProduct(product)) {
        solderingWaterVariants.push(product);
        return;
      }
      if (isGraphiteCrucibleProduct(product)) {
        graphiteCrucibleVariants.push(product);
        return;
      }
      if (isRoundCoralProduct(product)) {
        roundCoralVariants.push(product);
        return;
      }
      if (isRoundTurquoiseProduct(product)) {
        roundTurquoiseVariants.push(product);
        return;
      }
      if (isVanCliffMalakiteProduct(product)) {
        vanCliffMalakiteVariants.push(product);
        return;
      }
      if (isCopperGrainsProduct(product)) {
        copperGrainsVariants.push(product);
        return;
      }
      if (isZincProduct(product)) {
        zincVariants.push(product);
        return;
      }
      if (isLegacyCopperProduct(product)) {
        copperGrainsVariants.push({
          ...product,
          _id: 'copper-grains-1kg-legacy',
          name: 'Copper Grains (1 kg)',
          price: 13
        });
        return;
      }
      if (isGemkaBurnerProduct(product)) {
        gemkaBurnerVariants.push(product);
        return;
      }
      if (isSawingBladeProduct(product)) {
        sawingBladeVariants.push(product);
        return;
      }
      if (isYellowCottonBuffProduct(product)) {
        yellowCottonBuffVariants.push(product);
        return;
      }
      if (isWhiteCottonBuffProduct(product)) {
        whiteCottonBuffVariants.push(product);
        return;
      }
      if (isSolderingSheetProduct(product)) {
        solderingSheetVariants.push(product);
        return;
      }
      groupedProducts.push(product);
    });

    if (solderingWaterVariants.length) {
      const variants = [...solderingWaterVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getSolderingWaterSizeLabel(product)
        }))
        .sort((a, b) => {
          const aIndex = SOLDERING_WATER_ORDER.indexOf(a.sizeLabel);
          const bIndex = SOLDERING_WATER_ORDER.indexOf(b.sizeLabel);
          const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return safeA - safeB;
        });

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'soldering-water',
        name: 'Soldering Water',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred size before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Comes in the following sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (graphiteCrucibleVariants.length) {
      const variants = [...graphiteCrucibleVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getGraphiteCrucibleSizeLabel(product),
          dimensionLabel: getGraphiteCrucibleDimensionLabel(product),
          baseDescription: getGraphiteCrucibleBaseDescription(product)
        }))
        .sort((a, b) => {
          const aIndex = GRAPHITE_CRUCIBLE_ORDER.indexOf(a.sizeLabel);
          const bIndex = GRAPHITE_CRUCIBLE_ORDER.indexOf(b.sizeLabel);
          const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return safeA - safeB;
        });

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);
      const baseDescription = variants.find((variant) => variant.baseDescription)?.baseDescription || 'Graphite crucible';

      groupedProducts.push({
        ...firstVariant,
        _id: 'graphite-crucible',
        name: 'Graphite Crucible',
        image: '/products/4.jpg',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: `${baseDescription}.`,
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'crucible number',
        bundleDescription: `${baseDescription}.`
      });
    }

    if (roundCoralVariants.length) {
      const variants = [...roundCoralVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getRoundGemstoneSizeLabel(product)
        }))
        .sort((a, b) => {
          const aIndex = ROUND_GEMSTONE_SIZE_ORDER.indexOf(a.sizeLabel);
          const bIndex = ROUND_GEMSTONE_SIZE_ORDER.indexOf(b.sizeLabel);
          const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return safeA - safeB;
        });

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'coral-round',
        name: 'Coral Round',
        image: getBundleCoverImage(variants),
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred coral size before choosing how many grams to add to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (roundTurquoiseVariants.length) {
      const variants = [...roundTurquoiseVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getRoundGemstoneSizeLabel(product)
        }))
        .sort((a, b) => {
          const aIndex = ROUND_GEMSTONE_SIZE_ORDER.indexOf(a.sizeLabel);
          const bIndex = ROUND_GEMSTONE_SIZE_ORDER.indexOf(b.sizeLabel);
          const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return safeA - safeB;
        });

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'turquoise-round',
        name: 'Turquoise Round',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred turquoise size before choosing how many grams to add to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (vanCliffMalakiteVariants.length) {
      const variants = [...vanCliffMalakiteVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getVanCliffMalakiteSizeLabel(product)
        }))
        .sort((a, b) => a.sizeLabel.localeCompare(b.sizeLabel, undefined, { numeric: true }));

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'van-cliff-malakite',
        name: 'Van Cliff Malakite',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred size before choosing how many pieces to add to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (copperGrainsVariants.length) {
      const variants = [...copperGrainsVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getCopperGrainsSizeLabel(product),
          image: getCopperGrainsVariantImage(product)
        }))
        .sort((a, b) => a.price - b.price);

      const firstVariant = variants[0];
      const coverImage =
        variants.find((variant) => getCopperGrainsSizeLabel(variant).toLowerCase() === '1 kg')?.image ||
        variants.find((variant) => String(variant?.image || '').trim())?.image ||
        '';
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'copper-grains',
        name: 'Copper Grains',
        image: coverImage,
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred weight before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following weights: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (zincVariants.length) {
      const variants = [...zincVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getZincSizeLabel(product),
          image: getZincVariantImage(product)
        }))
        .sort((a, b) => a.price - b.price);

      const firstVariant = variants[0];
      const coverImage =
        variants.find((variant) => getZincSizeLabel(variant).toLowerCase() === '1 kg')?.image ||
        variants.find((variant) => String(variant?.image || '').trim())?.image ||
        '';
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'zinc',
        name: 'Zinc',
        image: coverImage,
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred weight before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following weights: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (gemkaBurnerVariants.length) {
      const variants = [...gemkaBurnerVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getGemkaBurnerSizeLabel(product)
        }))
        .sort((a, b) => Number(a.sizeLabel || 0) - Number(b.sizeLabel || 0));

      const firstVariant = variants[0];
      const preferredVariant =
        variants.find((variant) => String(variant.sizeLabel || '').trim() === '3939') || firstVariant;
      const coverImage =
        variants.find((variant) => String(variant?.image || '').trim())?.image ||
        String(preferredVariant?.image || '').trim() ||
        '';
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'gemka-burner',
        name: preferredVariant?.name || 'Gemka Burner',
        image: coverImage,
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred burner type before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following burner types: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (sawingBladeVariants.length) {
      const variants = [...sawingBladeVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getSawingBladeSizeLabel(product)
        }))
        .sort((a, b) => Number(a.sizeLabel || 0) - Number(b.sizeLabel || 0));

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'sawing-blade',
        name: 'Sawing Blade',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred blade size before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following blade sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (yellowCottonBuffVariants.length) {
      const variants = [...yellowCottonBuffVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getYellowCottonBuffSizeLabel(product)
        }))
        .sort((a, b) => {
          const aIndex = YELLOW_COTTON_BUFF_ORDER.indexOf(a.sizeLabel.toLowerCase());
          const bIndex = YELLOW_COTTON_BUFF_ORDER.indexOf(b.sizeLabel.toLowerCase());
          const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return safeA - safeB;
        });

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'yellow-cotton-buff',
        name: 'Yellow cotton buff',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred yellow cotton buff size before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (whiteCottonBuffVariants.length) {
      const variants = [...whiteCottonBuffVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getWhiteCottonBuffSizeLabel(product)
        }))
        .sort((a, b) => {
          const aIndex = WHITE_COTTON_BUFF_ORDER.indexOf(a.sizeLabel.toLowerCase());
          const bIndex = WHITE_COTTON_BUFF_ORDER.indexOf(b.sizeLabel.toLowerCase());
          const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return safeA - safeB;
        });

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'white-cotton-buff',
        name: 'White cotton buff',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred white cotton buff size before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    if (solderingSheetVariants.length) {
      const variants = [...solderingSheetVariants]
        .map((product) => ({
          ...product,
          sizeLabel: getSolderingSheetSizeLabel(product)
        }))
        .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

      const firstVariant = variants[0];
      const lowestPrice = variants.reduce((min, variant) => Math.min(min, Number(variant.price) || 0), Infinity);

      groupedProducts.push({
        ...firstVariant,
        _id: 'soldering-sheet',
        name: 'Soldering Sheet',
        image: firstVariant?.image || '',
        price: Number.isFinite(lowestPrice) ? lowestPrice : Number(firstVariant?.price) || 0,
        description: 'Select your preferred sheet size before adding to cart.',
        isBundleProduct: true,
        bundleOptions: variants,
        bundleLabel: 'size',
        bundleDescription: `Available in the following sheet sizes: ${variants.map((variant) => variant.sizeLabel).join(', ')}.`
      });
    }

    return groupedProducts;
  }, [products]);

  const categoryFilteredProducts = useMemo(() => {
    if (activeCategory === 'All Products') return categorizedProducts;
    return categorizedProducts.filter((product) => product.mainCategory === activeCategory);
  }, [activeCategory, categorizedProducts]);

  const subcategoryFilteredProducts = useMemo(() => {
    if (activeCategory === 'Gemstones' && activeGemstoneSubcategory !== ALL_GEMSTONES_OPTION) {
      return categoryFilteredProducts.filter(
        (product) => inferGemstoneSubcategory(product) === activeGemstoneSubcategory
      );
    }
    if (activeCategory === 'Tools' && activeToolSubcategory !== ALL_TOOLS_OPTION) {
      return categoryFilteredProducts.filter(
        (product) => inferToolSubcategory(product) === activeToolSubcategory
      );
    }
    return categoryFilteredProducts;
  }, [activeCategory, activeGemstoneSubcategory, activeToolSubcategory, categoryFilteredProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return subcategoryFilteredProducts;

    return subcategoryFilteredProducts.filter((product) => {
      const haystack = [product.name, product.description, product.category, product.subcategory]
        .concat(product.isBundleProduct ? product.bundleOptions.map((variant) => variant.sizeLabel) : [])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [subcategoryFilteredProducts, searchTerm]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    const getTimestamp = (product) => {
      const value = product?.createdAt || product?.updatedAt;
      const time = value ? new Date(value).getTime() : NaN;
      return Number.isFinite(time) ? time : 0;
    };

    const getPrice = (product) => {
      const price = Number(product?.price);
      return Number.isFinite(price) ? price : 0;
    };

    const getName = (product) => String(product?.name || '').toLocaleLowerCase();

    switch (sortBy) {
      case 'name-a-z':
        return list.sort((a, b) => getName(a).localeCompare(getName(b)));
      case 'name-z-a':
        return list.sort((a, b) => getName(b).localeCompare(getName(a)));
      case 'oldest':
        return list.sort((a, b) => getTimestamp(a) - getTimestamp(b));
      case 'price-low-high':
        return list.sort((a, b) => getPrice(a) - getPrice(b));
      case 'price-high-low':
        return list.sort((a, b) => getPrice(b) - getPrice(a));
      case 'latest':
      default:
        return list.sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }
  }, [filteredProducts, sortBy]);

  const categoryCounts = useMemo(
    () =>
      MAIN_CATEGORIES.reduce((acc, category) => {
        acc[category] =
          category === 'All Products'
            ? categorizedProducts.length
            : categorizedProducts.filter((product) => product.mainCategory === category).length;
        return acc;
      }, {}),
    [categorizedProducts]
  );

  const gemstoneSubcategoryCounts = useMemo(
    () =>
      GEMSTONE_SUBCATEGORIES.reduce((acc, subcategory) => {
        acc[subcategory] = categorizedProducts.filter(
          (product) =>
            product.mainCategory === 'Gemstones' && inferGemstoneSubcategory(product) === subcategory
        ).length;
        return acc;
      }, {}),
    [categorizedProducts]
  );

  const toolSubcategoryCounts = useMemo(
    () =>
      TOOL_SUBCATEGORIES.reduce((acc, subcategory) => {
        acc[subcategory] = categorizedProducts.filter(
          (product) => product.mainCategory === 'Tools' && inferToolSubcategory(product) === subcategory
        ).length;
        return acc;
      }, {}),
    [categorizedProducts]
  );

  useEffect(() => {
    if (activeCategory !== 'Gemstones') {
      setActiveGemstoneSubcategory(ALL_GEMSTONES_OPTION);
    }
    if (activeCategory !== 'Tools') {
      setActiveToolSubcategory(ALL_TOOLS_OPTION);
    }
  }, [activeCategory]);

  useEffect(() => {
    const resolveItemsPerPage = () => {
      if (window.innerWidth <= 620) return 6;
      if (window.innerWidth <= 1200) return 9;
      return 16;
    };

    const handleResize = () => {
      setItemsPerPage(resolveItemsPerPage());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeGemstoneSubcategory, activeToolSubcategory, sortBy, searchTerm, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPageSafe, itemsPerPage, sortedProducts]);

  function handleAddToCart(product) {
    if (!product) return;
    const isGemstone = product.mainCategory === 'Gemstones';
    const requiresPieceQuantitySelection =
      product.unit === 'piece' && product.requiresQuantitySelection;

    if (product.isBundleProduct) {
      const firstVariant = product.bundleOptions?.[0] || null;
      setBundleModalProduct(product);
      setSelectedBundleOptionId(firstVariant?._id || '');
      return;
    }

    if (requiresPieceQuantitySelection) {
      setPieceModalProduct(product);
      setPieceModalQuantity('1');
      return;
    }

    if (!isGemstone) {
      onAddToCart?.(product);
      setAddedProductName(product?.name || 'Product');
      return;
    }

    setGemstoneModalProduct(product);
    setGemstoneModalGrams('1');
  }

  function closeGemstoneModal() {
    setGemstoneModalProduct(null);
    setGemstoneModalGrams('1');
  }

  function closePieceModal() {
    setPieceModalProduct(null);
    setPieceModalQuantity('1');
  }

  function closeBundleModal() {
    setBundleModalProduct(null);
    setSelectedBundleOptionId('');
  }

  function openProductDetails(product) {
    if (!product) return;
    if (product.isBundleProduct) {
      const firstVariant = product.bundleOptions?.[0] || null;
      setSelectedBundleOptionId(firstVariant?._id || '');
    }
    setSelectedProduct(product);
  }

  function handleConfirmGemstoneAddToCart() {
    if (!gemstoneModalProduct) return;

    const parsed = Number(gemstoneModalGrams);
    const safeGrams = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const grams = Math.round(Math.max(0.1, safeGrams) * 10) / 10;
    const pricePerGram = Number(gemstoneModalProduct.price) || 0;
    const computedPrice = Math.round(pricePerGram * grams * 1000) / 1000;
    const gramsLabel = Number.isInteger(grams) ? String(grams) : grams.toFixed(1).replace(/\.0$/, '');

    onAddToCart?.({
      ...gemstoneModalProduct,
      _id: `${gemstoneModalProduct._id}__${gramsLabel}g`,
      name: `${gemstoneModalProduct.name} (${gramsLabel} g)`,
      price: computedPrice,
      pricePerGram,
      grams
    });
    setAddedProductName(`${gemstoneModalProduct.name} (${gramsLabel} g)`);
    closeGemstoneModal();
  }

  function handleConfirmPieceAddToCart() {
    if (!pieceModalProduct) return;

    const parsed = Number(pieceModalQuantity);
    const qty = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;

    onAddToCart?.({
      ...pieceModalProduct,
      qty
    });
    setAddedProductName(
      `${pieceModalProduct.name} (${qty} piece${qty === 1 ? '' : 's'})`
    );
    closePieceModal();
  }

  function handleConfirmBundleAddToCart() {
    if (!bundleModalProduct) return;

    const selectedVariant = bundleModalProduct.bundleOptions?.find(
      (variant) => variant._id === selectedBundleOptionId
    );

    if (!selectedVariant) return;

    const isGemstoneByWeight =
      selectedVariant.mainCategory === 'Gemstones' && selectedVariant.unit !== 'piece';

    if (isGemstoneByWeight) {
      setGemstoneModalProduct(selectedVariant);
      setGemstoneModalGrams('1');
      closeBundleModal();
      return;
    }

    if (selectedVariant.unit === 'piece' && selectedVariant.requiresQuantitySelection) {
      setPieceModalProduct(selectedVariant);
      setPieceModalQuantity('1');
      closeBundleModal();
      return;
    }

    onAddToCart?.({
      ...selectedVariant,
      qty: 1
    });
    setAddedProductName(selectedVariant.name || bundleModalProduct.name || 'Product');
    closeBundleModal();
  }

  function handleConfirmSelectedBundleAddToCart() {
    if (!selectedProduct?.isBundleProduct) return;

    const selectedVariant = selectedProduct.bundleOptions?.find(
      (variant) => variant._id === selectedBundleOptionId
    );

    if (!selectedVariant) return;

    const isGemstoneByWeight =
      selectedVariant.mainCategory === 'Gemstones' && selectedVariant.unit !== 'piece';

    if (isGemstoneByWeight) {
      setGemstoneModalProduct(selectedVariant);
      setGemstoneModalGrams('1');
      setSelectedProduct(null);
      setSelectedBundleOptionId('');
      return;
    }

    if (selectedVariant.unit === 'piece' && selectedVariant.requiresQuantitySelection) {
      setPieceModalProduct(selectedVariant);
      setPieceModalQuantity('1');
      setSelectedProduct(null);
      setSelectedBundleOptionId('');
      return;
    }

    onAddToCart?.({
      ...selectedVariant,
      qty: 1
    });
    setAddedProductName(selectedVariant.name || selectedProduct.name || 'Product');
    setSelectedProduct(null);
    setSelectedBundleOptionId('');
  }

  function handleCheckout() {
    setAddedProductName('');
    navigate('/orders');
  }

  function handleContinueShopping() {
    setAddedProductName('');
  }

  function showBundlePreview(productId, optionId) {
    if (!productId || !optionId) return;
    setBundlePreviewOptionIds((current) => ({
      ...current,
      [productId]: optionId
    }));
  }

  function clearBundlePreview(productId) {
    if (!productId) return;
    setBundlePreviewOptionIds((current) => {
      if (!(productId in current)) return current;
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  const selectedProductInStock = selectedProduct && Number(selectedProduct.countInStock || 0) > 0;
  const activeBundleVariant = bundleModalProduct?.bundleOptions?.find(
    (variant) => variant._id === selectedBundleOptionId
  ) || bundleModalProduct?.bundleOptions?.[0] || null;
  const activeSelectedBundleVariant = selectedProduct?.bundleOptions?.find(
    (variant) => variant._id === selectedBundleOptionId
  ) || selectedProduct?.bundleOptions?.[0] || null;

  return (
    <main className={styles.NewOrderPage}>
      <section className={styles.productIntro}>
        <h1>Where Craftsmanship Begins</h1>
        <p>
          From high-quality gemstones to precision tools and machines, we provide everything you need
          to bring your jewellery creations to life.
        </p>
      </section>

      <section className={styles.categorySection}>
        <div className={styles.searchBar}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        <div className={styles.catalogLayout}>
          <aside className={styles.categorySidebar} aria-label="Product categories">
            <h2>Categories</h2>
            <label className={styles.mobileCategorySelectWrap}>
              <span className={styles.mobileCategorySelectLabel}>Choose category</span>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className={styles.mobileCategorySelect}
                aria-label="Choose product category"
              >
                {MAIN_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category} ({categoryCounts[category] || 0})
                  </option>
                ))}
              </select>
            </label>
            <ul>
              {MAIN_CATEGORIES.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={activeCategory === category ? styles.activeCategoryButton : ''}
                  >
                    <span>{category}</span>
                    <span>{categoryCounts[category] || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.productsPanel}>
            {loading && <p className={styles.statusText}>Loading products...</p>}
            {error && !loading && <p className={styles.errorText}>{error}</p>}

            {!loading && !error && (
              <>
                <div className={styles.productsToolbar}>
                  <h2>{activeCategory}</h2>
                  <div className={styles.toolbarControls}>
                    {(activeCategory === 'Gemstones' || activeCategory === 'Tools') && (
                      <label className={styles.sortControl}>
                        <span>Sub-category</span>
                        <select
                          value={
                            activeCategory === 'Gemstones'
                              ? activeGemstoneSubcategory
                              : activeToolSubcategory
                          }
                          onChange={(e) => {
                            if (activeCategory === 'Gemstones') {
                              setActiveGemstoneSubcategory(e.target.value);
                            } else {
                              setActiveToolSubcategory(e.target.value);
                            }
                          }}
                          className={styles.sortSelect}
                        >
                          {activeCategory === 'Gemstones' ? (
                            <>
                              <option value={ALL_GEMSTONES_OPTION}>{ALL_GEMSTONES_OPTION}</option>
                              {GEMSTONE_SUBCATEGORIES.map((subcategory) => (
                                <option key={subcategory} value={subcategory}>
                                  {subcategory} ({gemstoneSubcategoryCounts[subcategory] || 0})
                                </option>
                              ))}
                            </>
                          ) : (
                            <>
                              <option value={ALL_TOOLS_OPTION}>{ALL_TOOLS_OPTION}</option>
                              {TOOL_SUBCATEGORIES.map((subcategory) => (
                                <option key={subcategory} value={subcategory}>
                                  {subcategory} ({toolSubcategoryCounts[subcategory] || 0})
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </label>
                    )}
                    <label className={styles.sortControl}>
                      <span>Sort</span>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
                        <option value="name-a-z">Name: A to Z</option>
                        <option value="name-z-a">Name: Z to A</option>
                        <option value="latest">Latest items</option>
                        <option value="oldest">Oldest items</option>
                        <option value="price-low-high">Price: Lowest to Highest</option>
                        <option value="price-high-low">Price: Highest to Lowest</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className={styles.productsGrid}>
                  {paginatedProducts.map((product) => {
                    const isGemstone = product.mainCategory === 'Gemstones';
                    const pricePerGram = Number(product.price) || 0;
                    const allowBundleCardPreview = product._id !== 'graphite-crucible';
                    const previewVariant = product.isBundleProduct
                      ? product.bundleOptions?.find(
                          (variant) => variant._id === bundlePreviewOptionIds[product._id]
                        ) || null
                      : null;
                    const productCardImage =
                      allowBundleCardPreview ? (previewVariant?.image || product.image) : product.image;
                    const productCardImageSrc = getVersionedProductImageSrc(
                      productCardImage,
                      previewVariant?.updatedAt || product.updatedAt || previewVariant?._id || product._id
                    );
                    const isGramBasedGemstoneBundle =
                      product.isBundleProduct &&
                      product.mainCategory === 'Gemstones' &&
                      product.bundleOptions?.some((variant) => variant.unit !== 'piece');
                    const productPriceLabel = product._id === 'copper-grains'
                      ? 'BHD 13 per kg'
                      : product._id === 'zinc'
                        ? 'BHD 23 per kg'
                      : isGramBasedGemstoneBundle
                        ? '0.5 - 2 BD per gram'
                      : product.isBundleProduct
                        ? `From ${formatPrice(product.price)}`
                        : isGemstone
                        ? `${formatPrice(pricePerGram)} / ${product.unit === 'piece' ? 'piece' : 'g'}`
                        : formatPrice(product.price);
                    return (
                    <article
                      key={product._id}
                      className={styles.productCard}
                      onClick={() => openProductDetails(product)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openProductDetails(product);
                        }
                      }}
                    >
                      <div className={styles.productImagePlaceholder} aria-hidden="true">
                        {productCardImageSrc ? <img src={productCardImageSrc} alt="" /> : 'Image Placeholder'}
                      </div>
                      <h3>{product.name}</h3>
                      <p className={styles.productCategory}>
                        {product.mainCategory === 'Gemstones' && inferGemstoneSubcategory(product)
                          ? `${product.mainCategory} - ${inferGemstoneSubcategory(product)}`
                          : product.mainCategory === 'Tools' && inferToolSubcategory(product)
                            ? `${product.mainCategory} - ${inferToolSubcategory(product)}`
                          : product.mainCategory || 'Uncategorized'}
                      </p>
                      <p className={styles.productPrice}>
                        {productPriceLabel}
                      </p>
                      {product.isBundleProduct && (
                        <div
                          className={styles.productVariantHints}
                          aria-label="Available sizes"
                          onMouseLeave={() => clearBundlePreview(product._id)}
                          onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                              clearBundlePreview(product._id);
                            }
                          }}
                        >
                          {product.bundleOptions.map((variant) => (
                            <span
                              key={variant._id}
                              className={styles.productVariantChip}
                              onMouseEnter={() => {
                                if (allowBundleCardPreview) {
                                  showBundlePreview(product._id, variant._id);
                                }
                              }}
                              onFocus={() => {
                                if (allowBundleCardPreview) {
                                  showBundlePreview(product._id, variant._id);
                                }
                              }}
                              tabIndex={0}
                            >
                              {variant.sizeLabel}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.addToCartButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </button>
                    </article>
                    );
                  })}
                </div>

                {sortedProducts.length > itemsPerPage && (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      className={styles.pageButton}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPageSafe === 1}
                    >
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {currentPageSafe} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className={styles.pageButton}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPageSafe === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}

                {sortedProducts.length === 0 && (
                  <p className={styles.statusText}>No products found in this category.</p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {gemstoneModalProduct && (
        <div className={styles.modalOverlay} onClick={closeGemstoneModal} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gemstone-grams-title"
          >
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={closeGemstoneModal}
              aria-label="Close dialog"
            >
              ×
            </button>
            <h2 id="gemstone-grams-title">How many grams?</h2>
            <p className={styles.gemstoneModalProductName}>{gemstoneModalProduct.name}</p>
            <p className={styles.gemstoneModalRate}>
              Price: {formatPrice(Number(gemstoneModalProduct.price) || 0)} / g
            </p>
            <label className={styles.gemstoneModalField}>
              <span>Grams</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={gemstoneModalGrams}
                onChange={(e) => setGemstoneModalGrams(e.target.value)}
                autoFocus
              />
            </label>
            <p className={styles.gemstoneModalTotal}>
              Total:{' '}
              {formatPrice(
                Math.round(
                  (Number(gemstoneModalProduct.price) || 0) *
                    Math.max(0.1, Number(gemstoneModalGrams) || 1) *
                    1000
                ) / 1000
              )}
            </p>
            <div className={styles.gemstoneModalActions}>
              <button type="button" className={styles.continueShoppingButton} onClick={closeGemstoneModal}>
                Cancel
              </button>
              <button type="button" className={styles.checkoutButton} onClick={handleConfirmGemstoneAddToCart}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {pieceModalProduct && (
        <div className={styles.modalOverlay} onClick={closePieceModal} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="piece-quantity-title"
          >
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={closePieceModal}
              aria-label="Close dialog"
            >
              ×
            </button>
            <h2 id="piece-quantity-title">How many pieces?</h2>
            <p className={styles.gemstoneModalProductName}>{pieceModalProduct.name}</p>
            <p className={styles.gemstoneModalRate}>
              Price: {formatPrice(Number(pieceModalProduct.price) || 0)} / piece
            </p>
            <label className={styles.gemstoneModalField}>
              <span>Pieces</span>
              <input
                type="number"
                min="1"
                step="1"
                value={pieceModalQuantity}
                onChange={(e) => setPieceModalQuantity(e.target.value)}
                autoFocus
              />
            </label>
            <p className={styles.gemstoneModalTotal}>
              Total:{' '}
              {formatPrice((Number(pieceModalProduct.price) || 0) * Math.max(1, Math.floor(Number(pieceModalQuantity) || 1)))}
            </p>
            <div className={styles.gemstoneModalActions}>
              <button type="button" className={styles.continueShoppingButton} onClick={closePieceModal}>
                Cancel
              </button>
              <button type="button" className={styles.checkoutButton} onClick={handleConfirmPieceAddToCart}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {bundleModalProduct && activeBundleVariant && (
        <div className={styles.modalOverlay} onClick={closeBundleModal} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bundle-option-title"
          >
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={closeBundleModal}
              aria-label="Close dialog"
            >
              ×
            </button>
            <div className={styles.modalImagePlaceholder} aria-hidden="true">
              {activeBundleVariant.image ? (
                <img
                  src={getVersionedProductImageSrc(
                    activeBundleVariant.image,
                    activeBundleVariant.updatedAt || bundleModalProduct.updatedAt || activeBundleVariant._id
                  )}
                  alt=""
                />
              ) : 'Image Placeholder'}
            </div>

            <h2 id="bundle-option-title">Choose an option</h2>
            <p className={styles.gemstoneModalProductName}>{bundleModalProduct.name}</p>
            <p className={styles.modalBundleDescription}>
              {bundleModalProduct.bundleDescription}
            </p>
            <label className={styles.gemstoneModalField}>
              <span>{bundleModalProduct.bundleLabel === 'crucible number' ? 'Crucible number' : 'Size'}</span>
              <select
                value={selectedBundleOptionId}
                onChange={(e) => setSelectedBundleOptionId(e.target.value)}
              >
                {bundleModalProduct.bundleOptions.map((variant) => (
                  <option key={variant._id} value={variant._id}>
                    {variant.sizeLabel} - {formatPrice(Number(variant.price) || 0)}
                    {variant.dimensionLabel ? ` (${variant.dimensionLabel})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <p className={styles.gemstoneModalTotal}>
              Price: {formatPrice(Number(activeBundleVariant.price) || 0)}
            </p>
            <div className={styles.gemstoneModalActions}>
              <button type="button" className={styles.continueShoppingButton} onClick={closeBundleModal}>
                Cancel
              </button>
              <button type="button" className={styles.checkoutButton} onClick={handleConfirmBundleAddToCart}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={() => setSelectedProduct(null)}
              aria-label="Close dialog"
            >
              ×
            </button>
            <div className={styles.modalImagePlaceholder} aria-hidden="true">
              {(activeSelectedBundleVariant?.image || selectedProduct.image) ? (
                <img
                  src={getVersionedProductImageSrc(
                    activeSelectedBundleVariant?.image || selectedProduct.image,
                    activeSelectedBundleVariant?.updatedAt ||
                      selectedProduct.updatedAt ||
                      activeSelectedBundleVariant?._id ||
                      selectedProduct._id
                  )}
                  alt=""
                />
              ) : 'Image Placeholder'}
            </div>

            <h2 id="product-modal-title">{selectedProduct.name}</h2>

            <div className={styles.modalMeta}>
              <p>
                <strong>Price:</strong>{' '}
                {selectedProduct.isBundleProduct
                  ? formatPrice(Number(activeSelectedBundleVariant?.price) || 0)
                  : selectedProduct.mainCategory === 'Gemstones'
                  ? `${formatPrice(selectedProduct.price)} / ${selectedProduct.unit === 'piece' ? 'piece' : 'g'}`
                  : formatPrice(selectedProduct.price)}
              </p>
              <p>
                <strong>Stock:</strong>{' '}
                <span className={selectedProductInStock ? styles.inStock : styles.outOfStock}>
                  {selectedProductInStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
            </div>

            <p>
              {selectedProduct.isBundleProduct
                ? selectedProduct.bundleDescription
                : (selectedProduct.description || 'No description available.')}
            </p>
            {selectedProduct.isBundleProduct && activeSelectedBundleVariant ? (
              <>
                <label className={styles.gemstoneModalField}>
                  <span>{selectedProduct.bundleLabel === 'crucible number' ? 'Crucible number' : 'Size'}</span>
                  <select
                    value={selectedBundleOptionId}
                    onChange={(e) => setSelectedBundleOptionId(e.target.value)}
                  >
                    {selectedProduct.bundleOptions.map((variant) => (
                      <option key={variant._id} value={variant._id}>
                        {variant.sizeLabel} - {formatPrice(Number(variant.price) || 0)}
                        {variant.dimensionLabel ? ` (${variant.dimensionLabel})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.gemstoneModalActions}>
                  <button type="button" className={styles.checkoutButton} onClick={handleConfirmSelectedBundleAddToCart}>
                    Add selected option
                  </button>
                </div>
              </>
            ) : (
              null
            )}
          </div>
        </div>
      )}

      {addedProductName && (
        <div className={styles.cartSuccessOverlay} onClick={handleContinueShopping} role="presentation">
          <div
            className={styles.cartSuccessCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-success-title"
          >
            <h2 id="cart-success-title">{addedProductName} added to cart successfully!</h2>
            <div className={styles.cartSuccessActions}>
              <button type="button" className={styles.checkoutButton} onClick={handleCheckout}>
                Checkout
              </button>
              <button type="button" className={styles.continueShoppingButton} onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
