import styles from './NewOrderPage.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { getAll } from '../../utilities/products-api';
import { useNavigate } from 'react-router-dom';

const MAIN_CATEGORIES = [
  'All Products',
  'Gemstones',
  'Tools',
  'Machines',
  'Minerals',
  'Plastic',
  'Threads'
];

const MONEY_COUNTING_MACHINE = {
  _id: 'money-counting-machine',
  name: 'Money Counting Machine',
  category: 'Machines',
  subcategory: null,
  description:
    'A reliable money counting machine for fast and accurate cash handling, built for jewellery counters and daily retail operations.',
  price: 249.0,
  image: '',
  countInStock: 8
};

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

  if (source.includes('gem')) return 'Gemstones';
  if (source.includes('tool') || source.includes('crucible') || source.includes('file') || source.includes('solder')) return 'Tools';
  if (source.includes('machine') || source.includes('scale')) return 'Machines';
  if (source.includes('mineral')) return 'Minerals';
  if (source.includes('plastic')) return 'Plastic';
  if (source.includes('thread')) return 'Threads';
  return null;
}

function formatPrice(value) {
  if (typeof value !== 'number') return value || '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(value);
}

export default function NewOrderPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [searchTerm, setSearchTerm] = useState('');
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

  const categorizedProducts = useMemo(
    () => {
      const hasMoneyCountingMachine = products.some(
        (product) => String(product?.name || '').toLowerCase() === 'money counting machine'
      );
      const list = hasMoneyCountingMachine ? products : [MONEY_COUNTING_MACHINE, ...products];
      return list.map((product) => ({
        ...product,
        mainCategory: inferMainCategory(product)
      }));
    },
    [products]
  );

  const categoryFilteredProducts = useMemo(() => {
    if (activeCategory === 'All Products') return categorizedProducts;
    return categorizedProducts.filter((product) => product.mainCategory === activeCategory);
  }, [activeCategory, categorizedProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categoryFilteredProducts;

    return categoryFilteredProducts.filter((product) => {
      const haystack = [product.name, product.description, product.category, product.subcategory]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [categoryFilteredProducts, searchTerm]);

  function handleAddToCart(product) {
    onAddToCart?.(product);
    setAddedProductName(product?.name || 'Product');
  }

  function handleCheckout() {
    setAddedProductName('');
    navigate('/orders');
  }

  function handleContinueShopping() {
    setAddedProductName('');
  }

  const selectedProductInStock = selectedProduct && Number(selectedProduct.countInStock || 0) > 0;

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

        <div className={styles.categoryTabs}>
          {MAIN_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`${styles.categoryTab} ${activeCategory === category ? styles.activeTab : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && <p className={styles.statusText}>Loading products...</p>}
        {error && !loading && <p className={styles.errorText}>{error}</p>}

        {!loading && !error && (
          <>
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <article
                  key={product._id}
                  className={styles.productCard}
                  onClick={() => setSelectedProduct(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProduct(product);
                    }
                  }}
                >
                  <div className={styles.productImagePlaceholder} aria-hidden="true">
                    {product.image ? <img src={product.image} alt="" /> : 'Image Placeholder'}
                  </div>
                  <h3>{product.name}</h3>
                  <p className={styles.productCategory}>{product.mainCategory || 'Uncategorized'}</p>
                  <p className={styles.productPrice}>{formatPrice(product.price)}</p>
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
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className={styles.statusText}>No products found in this category.</p>
            )}
          </>
        )}
      </section>

      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className={styles.modalImagePlaceholder} aria-hidden="true">
              {selectedProduct.image ? <img src={selectedProduct.image} alt="" /> : 'Image Placeholder'}
            </div>

            <h2 id="product-modal-title">{selectedProduct.name}</h2>

            <div className={styles.modalMeta}>
              <p>
                <strong>Price:</strong> {formatPrice(selectedProduct.price)}
              </p>
              <p>
                <strong>Stock:</strong>{' '}
                <span className={selectedProductInStock ? styles.inStock : styles.outOfStock}>
                  {selectedProductInStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
            </div>

            <p>{selectedProduct.description || 'No description available.'}</p>
            <button type="button" className={styles.closeModalButton} onClick={() => setSelectedProduct(null)}>
              Close
            </button>
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
