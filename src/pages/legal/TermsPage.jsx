import SEO from '../../components/common/SEO';
import styles from './LegalPage.module.css';

const TermsPage = () => (
  <div className={styles.page}>
    <SEO title="Terms of service" url="https://halfsec.co.za/terms" />
    <div className="container">
      <div className={styles.content}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section className={styles.section}>
          <h2>1. About Halfsec</h2>
          <p>Halfsec is a South African second-hand online store operated by a single seller. All items are personally inspected before listing.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Products</h2>
          <p>All products on Halfsec are second-hand. Condition is clearly stated as "like new", "good", "fair" or "poor". Photos accurately represent the item. We do not sell counterfeit goods.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Ordering</h2>
          <p>By placing an order you confirm that you are 18 years or older. Orders are subject to stock availability. We reserve the right to cancel any order at our discretion.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Payment</h2>
          <p>We accept card payments via Yoco and EFT. For EFT orders, goods will only be shipped after payment is confirmed. Prices are in South African Rand (ZAR) and include VAT where applicable.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Shipping</h2>
          <p>We ship nationwide via courier. Orders are typically processed within 1-2 business days. Delivery takes 2-5 business days depending on your location. Free shipping applies to orders over R500.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Liability</h2>
          <p>Halfsec is not liable for delays caused by courier services, incorrect delivery addresses or events beyond our control.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Contact</h2>
          <p>For any questions email us at <a href="mailto:hello@halfsec.co.za">hello@halfsec.co.za</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsPage;