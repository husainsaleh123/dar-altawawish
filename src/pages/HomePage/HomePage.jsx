import { Link } from 'react-router-dom';
import styles from './HomePage.module.scss';
import productsAvailableImage from '../../assets/images/products_available.png';
import yearsImage from '../../assets/images/Years.png';
import customerSatisfactionImage from '../../assets/images/customer_satisfaction.png';
import alzainLogoImage from '../../assets/images/alzain-logo.png';
import manamaPearlLogoImage from '../../assets/images/manama-pearl-logo.png';
import alalawiJewellersLogoImage from '../../assets/images/alalawi-jewellers-logo.png';
import darAlmeemLogoImage from '../../assets/images/dar-almeem.png';
import rafieJewelleryLogoImage from '../../assets/images/rafie-jewellery.png';
import devjiLogoImage from '../../assets/images/devji.png';
import alrayaJewelleryLogoImage from '../../assets/images/alraya-jewellery.png';
import alshabibJewelleryLogoImage from '../../assets/images/alshabib-jewellery.png';

export default function HomePage() {
  const clients = [
    { name: 'AL ZAIN', logo: alzainLogoImage },
    { name: 'Client 02', logo: manamaPearlLogoImage },
    { name: 'AL ALAWY JEWELLERS', logo: alalawiJewellersLogoImage },
    { name: 'DAR ALMEEM JEWELERY', logo: darAlmeemLogoImage, isLargeLogo: true },
    { name: 'RAFIE JEWELLERS', logo: rafieJewelleryLogoImage, isSlightlyLargeLogo: true },
    { name: 'DEVJI', logo: devjiLogoImage },
    { name: 'ARAYA', logo: alrayaJewelleryLogoImage, isScale120Logo: true },
    { name: 'AL SHABIB JEWELRIES', logo: alshabibJewelleryLogoImage }
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
          With more than 47 years of knowledge and expertise, we offer tailor-made solutions becoming
          the leading gemstones and jewelry supply in the Gulf and profile Bahrain as the preferred
          service location for the GCC.
        </p>

        <div className={styles.statsGrid}>
          <article className={styles.statItem}>
            <div className={`${styles.statIconPlaceholder} ${styles.statIconImageWrap}`} aria-hidden="true">
              <img className={styles.statIconImage} src={productsAvailableImage} alt="" />
            </div>
            <h3>3000+</h3>
            <p>Products Available</p>
          </article>

          <article className={styles.statItem}>
            <div className={`${styles.statIconPlaceholder} ${styles.statIconImageWrap}`} aria-hidden="true">
              <img className={styles.statIconImage} src={yearsImage} alt="" />
            </div>
            <h3>47</h3>
            <p>Years of Service</p>
          </article>

          <article className={styles.statItem}>
            <div className={`${styles.statIconPlaceholder} ${styles.statIconImageWrap}`} aria-hidden="true">
              <img className={styles.statIconImage} src={customerSatisfactionImage} alt="" />
            </div>
            <h3>90%</h3>
            <p>Customer Satisfaction</p>
          </article>
        </div>
      </section>

      <section className={styles.clientsSection}>
        <h2>Our trusted clients</h2>
        <p>
          With more than 47 years of operation, we offer products for several Jewellery and Goldsmith
          clients thus making us their preferred supplier in Bahrain.
        </p>

        <div className={styles.clientsGrid}>
          {clients.map((client) => (
            <article key={client.name} className={styles.clientCard}>
              <div className={`${styles.clientLogo} ${client.logo ? styles.clientLogoNoBorder : ''}`}>
                {client.logo ? (
                  <img
                    className={`${styles.clientLogoImage} ${client.isLargeLogo ? styles.clientLogoImageLarge : ''} ${client.isSlightlyLargeLogo ? styles.clientLogoImageSlightlyLarge : ''} ${client.isScale120Logo ? styles.clientLogoImageScale120 : ''}`}
                    src={client.logo}
                    alt={`${client.name} logo`}
                  />
                ) : (
                  client.name
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
