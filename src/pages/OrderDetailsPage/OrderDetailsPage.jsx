import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../../utilities/orders-api';
import styles from './OrderDetailsPage.module.scss';

function formatPrice(value) {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-BH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function labelize(value) {
  return String(value || 'N/A')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getOrderById(orderId);
        if (!isMounted) return;
        setOrder(data);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Unable to load this order.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return <main className={styles.OrderDetailsPage}><p className={styles.stateText}>Loading order...</p></main>;
  }

  if (error || !order) {
    return (
      <main className={styles.OrderDetailsPage}>
        <section className={styles.stateCard}>
          <h1>Order unavailable</h1>
          <p>{error || 'This order could not be found.'}</p>
          <Link to="/profile" className={styles.backLink}>Back to profile</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.OrderDetailsPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Order Details</span>
          <h1>{order.orderNumber}</h1>
          <p>Placed on {formatDate(order.createdAt)}.</p>
        </div>
        <Link to="/profile" className={styles.backLink}>Back to profile</Link>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.card}>
          <h2>Status</h2>
          <div className={styles.dataGrid}>
            <div><span>Status</span><strong>{labelize(order.status)}</strong></div>
            <div><span>Payment</span><strong>{labelize(order.paymentMethod)}</strong></div>
            <div><span>Paid</span><strong>{order.isPaid ? 'Yes' : 'No'}</strong></div>
            <div><span>Fulfillment</span><strong>{labelize(order.fulfillmentMethod)}</strong></div>
          </div>
        </article>

        <article className={styles.card}>
          <h2>Customer</h2>
          <div className={styles.dataGrid}>
            <div><span>Name</span><strong>{order.customer?.fullName || 'N/A'}</strong></div>
            <div><span>Email</span><strong>{order.customer?.email || 'N/A'}</strong></div>
            <div><span>Phone</span><strong>{order.customer?.phone || 'N/A'}</strong></div>
            <div><span>Company</span><strong>{order.customer?.company || 'N/A'}</strong></div>
          </div>
        </article>
      </section>

      <section className={styles.card}>
        <h2>Loyalty</h2>
        <div className={styles.dataGrid}>
          <div><span>Points earned</span><strong>{Number(order.loyalty?.pointsEarned) || 0}</strong></div>
          <div><span>Points redeemed</span><strong>{Number(order.loyalty?.pointsRedeemed) || 0}</strong></div>
          <div><span>Discount rate</span><strong>{Number(order.loyalty?.discountRate) ? `${Math.round(Number(order.loyalty.discountRate) * 100)}%` : '0%'}</strong></div>
          <div><span>Discount amount</span><strong>{formatPrice(order.loyalty?.discountAmount)}</strong></div>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Items</h2>
        <div className={styles.itemsList}>
          {(order.orderItems || []).map((item) => (
            <article key={`${item.product}-${item.name}`} className={styles.itemRow}>
              <div>
                <strong>{item.name}</strong>
                <span>Quantity: {item.qty}</span>
              </div>
              <div className={styles.itemPrice}>{formatPrice((Number(item.price) || 0) * (item.qty || 0))}</div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.card}>
          <h2>Delivery</h2>
          <div className={styles.dataGrid}>
            <div><span>Method</span><strong>{labelize(order.fulfillmentMethod)}</strong></div>
            <div><span>Pickup location</span><strong>{order.pickupLocation || 'N/A'}</strong></div>
            <div><span>Address</span><strong>{order.shippingAddress?.address1 || 'N/A'}</strong></div>
            <div><span>City / Country</span><strong>{[order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(', ') || 'N/A'}</strong></div>
          </div>
        </article>

        <article className={styles.card}>
          <h2>Total</h2>
          <div className={styles.dataGrid}>
            <div><span>Items</span><strong>{formatPrice(order.itemsPrice)}</strong></div>
            <div><span>Shipping</span><strong>{formatPrice(order.shippingPrice)}</strong></div>
            <div><span>Loyalty discount</span><strong>-{formatPrice(order.loyalty?.discountAmount)}</strong></div>
            <div><span>Tax</span><strong>{formatPrice(order.taxPrice)}</strong></div>
            <div><span>Total</span><strong>{formatPrice(order.totalPrice)}</strong></div>
          </div>
        </article>
      </section>
    </main>
  );
}
