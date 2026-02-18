import styles from './Footer.module.scss';
import 'font-awesome/css/font-awesome.min.css';

const SOCIAL_LINKS = [
  { label: 'WhatsApp (+973 39145546)', href: 'https://wa.me/97339145546', iconClass: 'fa fa-whatsapp' },
  { label: 'Instagram (dar.altawawish)', href: 'https://www.instagram.com/dar.altawawish/', iconClass: 'fa fa-instagram' },
  { label: 'Gmail (dar.altawawish@gmail.com)', href: 'mailto:dar.altawawish@gmail.com', iconClass: 'fa fa-envelope-o' },
  { label: 'Facebook', href: '#', iconClass: 'fa fa-facebook-square' }
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.quote}>“Shaping the Future of Goldsmith with Every Detail.”</p>

      <div className={styles.socials}>
        {SOCIAL_LINKS.map(({ label, href, iconClass }) => (
          <a key={label} href={href} aria-label={label} className={styles.socialLink} target="_blank" rel="noreferrer">
            <i className={iconClass} aria-hidden="true" />
          </a>
        ))}
      </div>

      <p className={styles.copy}>Dar Altawawish © all rights reserved 2026.</p>
    </footer>
  );
}
