import styles from './AboutPage.module.scss';
import 'font-awesome/css/font-awesome.min.css';
import aboutImage from '../../assets/images/about.jpg';

const CORE_VALUES = [
  {
    title: 'Agility',
    description:
      'The ability to quickly adapt to market changes, customer needs, and new opportunities, ensuring flexibility and speed in decision-making and implementation.'
  },
  {
    title: 'Excellence',
    description:
      'Delivering superior quality in every product, service, and interaction, ensuring the highest standards across all aspects of the business.'
  },
  {
    title: 'Innovation',
    description: 'Continuously looking for creative solutions and new ideas to improve products, services, and business operations.'
  },
  {
    title: 'Integrity',
    description:
      'Maintaining honesty and strong ethical principles in all business practices. This builds trust and credibility with customers and partners.'
  },
  {
    title: 'Ownership',
    description:
      'Taking full responsibility for the quality of products, services, and customer experiences, ensuring accountability in every action and decision made.'
  }
];

export default function AboutPage() {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1>Who are we?</h1>
            <p>
              Dar AlTawawish supplies high-quality gemstones, precious metals, precision scales, goldsmith tools,
              machines, and packaging materials for jewellery manufacturers, goldsmiths, designers, shop owners,
              gemstone dealers, and artisans. We offer reliable products at competitive prices, available in both bulk
              and retail quantities through direct and in-store orders.
            </p>
          </div>
          <img className={styles.imagePlaceholder} src={aboutImage} alt="About Dar AlTawawish" />
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.valuesContainer}>
          <div className={styles.valueBlock}>
            <h2>
              Our Vision <i className="fa fa-eye" aria-hidden="true" />
            </h2>
            <p>
              To be the leading regional supplier of high-quality goldsmith materials and gemstones, empowering
              jewelers to craft timeless masterpieces.
            </p>
          </div>

          <div className={styles.valueBlock}>
            <h2>
              Our Mission <i className="fa fa-bullseye" aria-hidden="true" />
            </h2>
            <p>
              To provide jewellery professionals with reliable, high-quality gemstones, precious metals, tools, and
              machinery at competitive prices, delivering consistent supply, trusted service, and innovative solutions
              that support excellence in craftsmanship.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.coreValuesSection}>
        <div className={styles.coreValuesContainer}>
          <h2>Our values</h2>
          <div className={styles.coreValuesGrid}>
            {CORE_VALUES.map((value) => (
              <article key={value.title} className={styles.valueCard}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
