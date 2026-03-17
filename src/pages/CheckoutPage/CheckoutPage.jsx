import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../../utilities/orders-api';
import { getProfile } from '../../utilities/users-service';
import styles from './CheckoutPage.module.scss';

const DELIVERY_FEE = 1.5;
const FREE_DELIVERY_THRESHOLD = 20;

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(Number(value) || 0);
}

export default function CheckoutPage({ cartItems = [], user, onCheckoutComplete }) {
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(user);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    company: '',
    fulfillmentMethod: 'delivery',
    address: '',
    city: '',
    country: 'Bahrain',
    notes: '',
    paymentMethod: 'cash-on-hand',
    cardName: user?.name || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    saveInfo: false,
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!user) {
        setProfileUser(null);
        return;
      }

      try {
        const data = await getProfile();
        if (!isMounted) return;
        setProfileUser(data?.user || user);
      } catch {
        if (!isMounted) return;
        setProfileUser(user);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0), 0),
    [cartItems]
  );
  const isBahrain = formData.country.trim().toLowerCase() === 'bahrain';
  const deliveryLabel = isBahrain ? 'Delivery' : 'Shipping';
  const qualifiesForFreeDelivery = subtotal > FREE_DELIVERY_THRESHOLD;
  const shipping = subtotal > 0 && formData.fulfillmentMethod === 'delivery' && !qualifiesForFreeDelivery
    ? DELIVERY_FEE
    : 0;
  const availablePoints = Number(profileUser?.points) || 0;
  const loyaltyDiscount = availablePoints >= 100 ? Number((subtotal * 0.1).toFixed(3)) : 0;
  const pointsToEarn = user ? Math.floor(Math.max(subtotal - loyaltyDiscount, 0)) : 0;
  const total = subtotal + shipping - loyaltyDiscount;

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  }

  function validateForm() {
    if (!cartItems.length) return 'Your cart is empty.';
    if (!formData.firstName.trim()) return 'First name is required.';
    if (!formData.lastName.trim()) return 'Last name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.phone.trim()) return 'Phone number is required.';
    if (formData.fulfillmentMethod === 'delivery' && !formData.address.trim()) {
      return 'Address is required for delivery.';
    }
    if (!formData.city.trim()) return 'City is required.';
    if (!formData.country.trim()) return 'Country is required.';
    if (formData.paymentMethod === 'debit-card') {
      if (!formData.cardName.trim()) return 'Name on card is required.';
      if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s+/g, ''))) return 'Enter a valid card number.';
      if (!/^\d{2}\/\d{2}$/.test(formData.expiry.trim())) return 'Expiry must be in MM/YY format.';
      if (!/^\d{3,4}$/.test(formData.cvv.trim())) return 'Enter a valid CVV.';
    }
    if (!formData.agreeToTerms) return 'You must confirm the order details before placing the order.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const createdOrder = await createOrder({
        ...formData,
        items: cartItems
      });

      const order = {
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.totalPrice,
        email: createdOrder.customer?.email || formData.email.trim(),
        itemsCount: createdOrder.orderItems?.reduce((sum, item) => sum + (item.qty || 0), 0)
          || cartItems.reduce((sum, item) => sum + (item.qty || 0), 0),
        pointsEarned: Number(createdOrder.loyalty?.pointsEarned) || 0,
        pointsRedeemed: Number(createdOrder.loyalty?.pointsRedeemed) || 0,
        loyaltyDiscount: Number(createdOrder.loyalty?.discountAmount) || 0
      };

      onCheckoutComplete?.();
      setCompletedOrder(order);
    } catch (err) {
      setError(err.message || 'Checkout could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completedOrder) {
    return (
      <main className={styles.CheckoutPage}>
        <section className={styles.successCard}>
          <span className={styles.successEyebrow}>Order Confirmed</span>
          <h1>Thank you for your order</h1>
          <p>
            Your order <strong>{completedOrder.orderNumber}</strong> has been placed successfully.
            A confirmation will be sent to {completedOrder.email}.
          </p>
          <div className={styles.successMeta}>
            <div>
              <span>Total paid</span>
              <strong>{formatPrice(completedOrder.total)}</strong>
            </div>
            <div>
              <span>Items</span>
              <strong>{completedOrder.itemsCount}</strong>
            </div>
            <div>
              <span>Points earned</span>
              <strong>{completedOrder.pointsEarned}</strong>
            </div>
            <div>
              <span>Loyalty discount</span>
              <strong>{formatPrice(completedOrder.loyaltyDiscount)}</strong>
            </div>
          </div>
          {completedOrder.pointsRedeemed > 0 ? (
            <p className={styles.loyaltyNote}>
              100 points were redeemed on this order for your 10% loyalty discount.
            </p>
          ) : null}
          <div className={styles.successActions}>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/orders/new')}>
              Continue shopping
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate('/orders')}>
              Back to cart
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!cartItems.length) {
    return (
      <main className={styles.CheckoutPage}>
        <section className={styles.emptyCard}>
          <h1>Your cart is empty</h1>
          <p>Add products before continuing to checkout.</p>
          <Link to="/orders/new" className={styles.primaryButton}>
            Browse products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.CheckoutPage}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Secure Checkout</span>
        <h1>Complete your order</h1>
        <p>Enter your customer and payment details below to finish the purchase.</p>
      </section>

      <section className={styles.layout}>
        <form className={styles.checkoutForm} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>01</span>
              <h2>Customer details</h2>
            </div>
            <div className={`${styles.formGrid} ${styles.customerGrid}`}>
              <label>
                <span>First name</span>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required />
              </label>
              <label>
                <span>Last name</span>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+973" required />
              </label>
              <label>
                <span>Company</span>
                <input name="company" value={formData.company} onChange={handleChange} />
              </label>
              <label>
                <span>Country</span>
                <input name="country" value={formData.country} onChange={handleChange} required />
              </label>
              <div className={`${styles.fullWidth} ${styles.fulfillmentSection}`}>
                <span>Order method</span>
                <div className={styles.fulfillmentOptions}>
                  <label className={styles.fulfillmentOption}>
                    <input
                      type="radio"
                      name="fulfillmentMethod"
                      value="delivery"
                      checked={formData.fulfillmentMethod === 'delivery'}
                      onChange={handleChange}
                    />
                    <div>
                      <strong>{deliveryLabel}</strong>
                      <span>
                        {isBahrain
                          ? `Deliver the order to your Bahrain address.${qualifiesForFreeDelivery ? ' Free above BHD 20.000.' : ''}`
                          : `Ship the order to your selected address.${qualifiesForFreeDelivery ? ' Free above BHD 20.000.' : ''}`}
                      </span>
                    </div>
                  </label>
                  <label className={styles.fulfillmentOption}>
                    <input
                      type="radio"
                      name="fulfillmentMethod"
                      value="pickup"
                      checked={formData.fulfillmentMethod === 'pickup'}
                      onChange={handleChange}
                    />
                    <div>
                      <strong>Pickup</strong>
                      <span>Collect the order yourself with no delivery or shipping fee.</span>
                    </div>
                  </label>
                </div>
              </div>
              <label className={styles.fullWidth}>
                <span>Address</span>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required={formData.fulfillmentMethod === 'delivery'}
                  disabled={formData.fulfillmentMethod === 'pickup'}
                  placeholder={formData.fulfillmentMethod === 'pickup' ? 'Not required for pickup' : ''}
                />
              </label>
              <label>
                <span>City</span>
                <input name="city" value={formData.city} onChange={handleChange} required />
              </label>
              <label className={styles.fullWidth}>
                <span>Order notes</span>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" />
              </label>
            </div>
          </div>

          <p className={styles.errorText}>{error || '\u00A0'}</p>

          <div className={styles.mobileSummary}>
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Place order'}
          </button>
        </form>

        <aside className={styles.sideColumn}>
          <section className={styles.paymentCard}>
            <div className={styles.sectionHeader}>
              <span>02</span>
              <h2>Payment details</h2>
            </div>
            <div className={styles.paymentOptions}>
              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash-on-hand"
                  checked={formData.paymentMethod === 'cash-on-hand'}
                  onChange={handleChange}
                />
                <div>
                  <strong>Cash on hand</strong>
                  <span>Pay in cash when the order is collected or delivered.</span>
                </div>
              </label>
              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="debit-card"
                  checked={formData.paymentMethod === 'debit-card'}
                  onChange={handleChange}
                />
                <div>
                  <strong>Debit card</strong>
                  <span>Pay now using your debit card details.</span>
                </div>
              </label>
            </div>

            {formData.paymentMethod === 'debit-card' && (
              <div className={styles.formGrid}>
                <label className={styles.fullWidth}>
                  <span>Name on card</span>
                  <input name="cardName" value={formData.cardName} onChange={handleChange} required />
                </label>
                <label className={styles.fullWidth}>
                  <span>Card number</span>
                  <input
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="4111 1111 1111 1111"
                    required
                  />
                </label>
                <label>
                  <span>Expiry</span>
                  <input name="expiry" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" required />
                </label>
                <label>
                  <span>CVV</span>
                  <input name="cvv" value={formData.cvv} onChange={handleChange} inputMode="numeric" required />
                </label>
              </div>
            )}

            <label className={styles.checkboxRow}>
              <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleChange} />
              <span>Save my details for faster checkout next time.</span>
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <span>I confirm the order details and authorize payment for this purchase.</span>
            </label>
          </section>

          <section className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <span>Order Summary</span>
            <strong>{cartItems.length} product(s)</strong>
          </div>

          {user ? (
            <div className={styles.loyaltyPanel}>
              <strong>{availablePoints} loyalty points available</strong>
              <p>
                {availablePoints >= 100
                  ? `A 10% discount of ${formatPrice(loyaltyDiscount)} will be applied to this order.`
                  : `Earn ${pointsToEarn} point${pointsToEarn === 1 ? '' : 's'} from this order. Delivery fees are excluded. Reach 100 points to unlock a 10% discount on your next order.`}
              </p>
            </div>
          ) : null}

          <div className={styles.summaryItems}>
            {cartItems.map((item) => (
              <article key={item._id} className={styles.summaryItem}>
                <div>
                  <h3>{item.name}</h3>
                  <p>Qty {item.qty}</p>
                </div>
                <strong>{formatPrice((Number(item.price) || 0) * (item.qty || 0))}</strong>
              </article>
            ))}
          </div>

          <div className={styles.summaryTotals}>
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div>
              <span>{deliveryLabel}</span>
              <strong>{formatPrice(shipping)}</strong>
            </div>
            {loyaltyDiscount > 0 ? (
              <div>
                <span>Loyalty discount</span>
                <strong>-{formatPrice(loyaltyDiscount)}</strong>
              </div>
            ) : null}
            <div className={styles.grandTotal}>
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          <Link to="/orders" className={styles.secondaryButton}>
            Back to cart
          </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}
