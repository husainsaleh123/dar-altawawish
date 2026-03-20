import styles from './NewOrderPage.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { getAll } from '../../utilities/products-api';
import { useNavigate } from 'react-router-dom';
import {
  ALL_GEMSTONES_OPTION,
  ALL_TOOLS_OPTION,
  GEMSTONE_SUBCATEGORIES,
  MAIN_CATEGORIES,
  TOOL_SUBCATEGORIES
} from '../../shared/productCatalog';

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

export default function NewOrderPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [activeGemstoneSubcategory, setActiveGemstoneSubcategory] = useState(ALL_GEMSTONES_OPTION);
  const [activeToolSubcategory, setActiveToolSubcategory] = useState(ALL_TOOLS_OPTION);
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [gemstoneModalProduct, setGemstoneModalProduct] = useState(null);
  const [gemstoneModalGrams, setGemstoneModalGrams] = useState('1');
  const [pieceModalProduct, setPieceModalProduct] = useState(null);
  const [pieceModalQuantity, setPieceModalQuantity] = useState('1');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
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
      return products.map((product) => ({
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

    switch (sortBy) {
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
                    return (
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
                      <p className={styles.productCategory}>
                        {product.mainCategory === 'Gemstones' && inferGemstoneSubcategory(product)
                          ? `${product.mainCategory} - ${inferGemstoneSubcategory(product)}`
                          : product.mainCategory === 'Tools' && inferToolSubcategory(product)
                            ? `${product.mainCategory} - ${inferToolSubcategory(product)}`
                          : product.mainCategory || 'Uncategorized'}
                      </p>
                      <p className={styles.productPrice}>
                        {isGemstone
                          ? `${formatPrice(pricePerGram)} / ${product.unit === 'piece' ? 'piece' : 'g'}`
                          : formatPrice(product.price)}
                      </p>
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
                <strong>Price:</strong>{' '}
                {selectedProduct.mainCategory === 'Gemstones'
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
