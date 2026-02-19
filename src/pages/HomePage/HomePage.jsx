import { Link } from 'react-router-dom';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const clients = [
    'AL ZAIN',
    'Client 02',
    'AL ALAWY JEWELLERS',
    'DAR ALMEEM JEWELERY',
    'RAFIE JEWELLERS',
    'DEVJI',
    'ARAYA',
    'AL SHABIB JEWELRIES'
  ];

  return (
    <>
      <section className={styles.hero}>
        <h1>Welcome to our website!</h1>

        <label className={styles.searchBar} htmlFor="home-search">
          <input
            id="home-search"
            type="search"
            placeholder="Search items here..."
            aria-label="Search items"
          />
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </label>

        <p className={styles.introText}>
          <span className={styles.introLineTop}>Find the finest goldsmith materials and gemstones</span>
          <span className={styles.introSubline}>
            with <strong>Dar Altawawish.</strong>
          </span>
        </p>

        <div className={styles.actions}>
          <Link to="/orders/new" className={styles.buyNow}>Buy now</Link>
          <Link to="/contact" className={styles.contact}>Contact</Link>
        </div>
      </section>

      <section className={styles.numbersSection}>
        <h2>Dar Altawawish in Numbers</h2>
        <p className={styles.numbersText}>
          With more than 36 years of knowledge and expertise, we offer tailor-made solutions becoming
          the leading gemstones and jewelry supply in the Gulf and profile Bahrain as the preferred
          service location for the GCC
        </p>

        <div className={styles.statsGrid}>
          <article className={styles.statItem}>
            <div className={styles.statIconPlaceholder} aria-hidden="true">Icon 01</div>
            <h3>3000+</h3>
            <p>Products Available</p>
          </article>

          <article className={styles.statItem}>
            <div className={styles.statIconPlaceholder} aria-hidden="true">Icon 02</div>
            <h3>36</h3>
            <p>Years of Service</p>
          </article>

          <article className={styles.statItem}>
            <div className={styles.statIconPlaceholder} aria-hidden="true">Icon 03</div>
            <h3>90%</h3>
            <p>Customer Satisfaction</p>
          </article>
        </div>
      </section>

      <section className={styles.clientsSection}>
        <h2>Our trusted clients</h2>
        <p>
          With more than 36 years of operation, we offer products for several Jewellery and Goldsmith
          clients thus making us their preferred supplier in Bahrain.
        </p>

        <div className={styles.clientsGrid}>
          {clients.map((client) => (
            <article key={client} className={styles.clientCard}>
              <div className={styles.clientLogo} aria-hidden="true">
                {client}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
