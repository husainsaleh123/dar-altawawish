import styles from './OrderHistoryPage.module.scss';
import { useNavigate } from 'react-router-dom';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(Number(value) || 0);
}

export default function OrderHistoryPage({ cartItems = [], onUpdateQty, onRemoveItem }) {
  const navigate = useNavigate();
  const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0), 0);

  function handleProceedCheckout() {
    navigate('/checkout/access');
  }

  return (
    <main className={styles.OrderHistoryPage}>
      <section className={styles.cartContainer}>
        <header className={styles.header}>
          <h1>Your Cart</h1>
          <p>{cartItems.length ? `${cartItems.length} product(s)` : 'No products in cart yet.'}</p>
        </header>

        {!cartItems.length && <p className={styles.empty}>Your cart is empty.</p>}

        {cartItems.length > 0 && (
          <>
            <div className={styles.list}>
              {cartItems.map((item) => (
                <article key={item._id} className={styles.itemRow}>
                  <div className={styles.imageWrap} aria-hidden="true">
                    {item.image ? <img src={item.image} alt="" /> : 'Image Placeholder'}
                  </div>

                  <div className={styles.itemInfo}>
                    <h2>{item.name}</h2>
                    <p className={styles.price}>{formatPrice(item.price)}</p>
                  </div>

                  <div className={styles.qtyControls}>
                    <button type="button" onClick={() => onUpdateQty?.(item._id, item.qty - 1)}>
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => onUpdateQty?.(item._id, item.qty + 1)}>
                      +
                    </button>
                  </div>

                  <div className={styles.itemActions}>
                    <p>{formatPrice((Number(item.price) || 0) * (item.qty || 0))}</p>
                    <button type="button" onClick={() => onRemoveItem?.(item._id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <footer className={styles.totalBar}>
              <div>
                <span>Total</span>
                <strong>{formatPrice(totalPrice)}</strong>
              </div>
              <button type="button" className={styles.checkoutCta} onClick={handleProceedCheckout}>
                Proceed to checkout
              </button>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}
