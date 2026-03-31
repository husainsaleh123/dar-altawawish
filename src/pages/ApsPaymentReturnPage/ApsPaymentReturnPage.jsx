import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './ApsPaymentReturnPage.module.scss';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(Number(value) || 0);
}

export default function ApsPaymentReturnPage({ onCheckoutComplete }) {
  const [params] = useSearchParams();
  const isSuccess = params.get('success') === '1';
  const message = params.get('message') || '';
  const orderNumber = params.get('orderNumber') || '';
  const total = params.get('total') || '0';
  const confettiPieces = Array.from({ length: 20 }, (_, index) => index);

  useEffect(() => {
    if (isSuccess) {
      onCheckoutComplete?.();
    }
  }, [isSuccess, onCheckoutComplete]);

  return (
    <main className={styles.page}>
      {isSuccess ? (
        <div className={styles.confettiLayer} aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece}
              className={styles.confetti}
              style={{
                left: `${(piece * 5) % 100}%`,
                animationDelay: `${(piece % 6) * 110}ms`
              }}
            />
          ))}
        </div>
      ) : null}
      <section className={styles.card}>
        <span className={styles.eyebrow}>Amazon Payment Services</span>
        <h1>{isSuccess ? 'Payment completed' : 'Payment not completed'}</h1>
        <p>
          {isSuccess
            ? `Order ${orderNumber} has been paid and confirmed.`
            : message || 'We could not complete the payment.'}
        </p>

        {isSuccess ? (
          <div className={styles.meta}>
            <div>
              <span>Order</span>
              <strong>{orderNumber}</strong>
            </div>
            <div>
              <span>Total paid</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
        ) : null}

        <div className={styles.actions}>
          <Link to={isSuccess ? '/orders/new' : '/checkout'} className={styles.primaryButton}>
            {isSuccess ? 'Continue shopping' : 'Return to checkout'}
          </Link>
          <Link to={isSuccess ? '/profile' : '/orders'} className={styles.secondaryButton}>
            {isSuccess ? 'View profile' : 'Back to cart'}
          </Link>
        </div>
      </section>
    </main>
  );
}
