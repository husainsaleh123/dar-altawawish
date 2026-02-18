import styles from './Navigation.module.scss';
import { Link, NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/orders/new' },
  { label: 'Contact', to: '/contact' }
];

function BrandIcon() {
  return (
    <svg
      className={styles.brandIcon}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M32 6l20 10v18L32 58 12 34V16L32 6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M20 22h24M20 30h24M24 38h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navigation({ user }) {
  const location = useLocation();

  return (
    <nav className={styles.navbar} aria-label="Primary">
      <NavLink className={styles.brand} to="/">
        <BrandIcon />
      </NavLink>

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
        {!user && (
          <>
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
            <Link to="/signup" className={styles.signupBtn}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
