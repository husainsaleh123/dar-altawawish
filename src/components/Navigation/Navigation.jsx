import styles from './Navigation.module.scss';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import logoImage from '../../assets/images/Logo_design_final_PNG.png';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/orders/new' },
  { label: 'Contact', to: '/contact' }
];

export default function Navigation({ cartCount = 0 }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`${styles.navbar} ${isMenuOpen ? styles.navOpen : ''}`} aria-label="Primary">
      <NavLink className={styles.brand} to="/" aria-label="Home">
        <img className={styles.brandLogo} src={logoImage} alt="Dar Altawawish logo" />
      </NavLink>

      <div className={styles.headerControls}>
        <Link to="/orders" className={`${styles.cartBtn} ${styles.mobileCartBtn}`} aria-label="Cart">
          <i className="fa fa-shopping-cart" aria-hidden="true" />
          {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="primary-menu" className={`${styles.menuPanel} ${isMenuOpen ? styles.menuPanelOpen : ''}`}>
        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => {
            const isProductsRoute = item.to === '/orders/new' && location.pathname.startsWith('/orders');
            return (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive || isProductsRoute ? styles.navLinkActive : ''}`.trim()
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.languageBtn} aria-label="Current language EN">
            EN
          </button>
          <Link to="/orders" className={`${styles.cartBtn} ${styles.desktopCartBtn}`} aria-label="Cart">
            <i className="fa fa-shopping-cart" aria-hidden="true" />
            {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
