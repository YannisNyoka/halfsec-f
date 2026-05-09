import SEO from '../../components/common/SEO';
import styles from './LegalPage.module.css';

const ReturnsPage = () => (
  <div className={styles.page}>
    <SEO title="Returns policy" url="https://halfsec.co.za/returns" />
    <div className="container">
      <div className={styles.content}>
        <h1 className={styles.title}>Returns Policy</h1>
        <p className={styles.updated}>Last updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section className={styles.section}>
          <h2>Our policy</h2>
          <p>Because all items at Halfsec are second-hand, we take great care to accurately describe and photograph each item before listing it. We want you to be completely happy with your purchase.</p>
        </section>

        <section className={styles.section}>
          <h2>When returns are accepted</h2>
          <p>We accept returns in the following cases:</p>
          <ul>
            <li>The item received is significantly different from what was described</li>
            <li>The item is damaged during shipping</li>
            <li>The wrong item was sent</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>How to request a return</h2>
          <ol>
            <li>Email us at <a href="mailto:hello@halfsec.co.za">hello@halfsec.co.za</a> within <strong>48 hours</strong> of receiving your order</li>
            <li>Include your order number and photos of the item</li>
            <li>We will respond within 1 business day</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Refunds</h2>
          <p>If a return is approved, a full refund will be processed to your original payment method within 3-5 business days. Return shipping costs are covered by Halfsec for approved returns.</p>
        </section>

        <section className={styles.section}>
          <h2>Non-returnable items</h2>
          <p>Items that have been used after delivery, or that were accurately described as "fair" or "poor" condition, are generally not eligible for returns unless damaged in transit.</p>
        </section>

        <section className={styles.section}>
          <h2>Contact us</h2>
          <p>For any return enquiries: <a href="mailto:hello@halfsec.co.za">hello@halfsec.co.za</a></p>
        </section>
      </div>
    </div>
  </div>
);

export default ReturnsPage;