import SEO from '../../components/common/SEO';
import styles from './LegalPage.module.css';

const PrivacyPage = () => (
  <div className={styles.page}>
    <SEO title="Privacy policy" url="https://halfsec.co.za/privacy" />
    <div className="container">
      <div className={styles.content}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section className={styles.section}>
          <h2>1. Information we collect</h2>
          <p>When you create an account or place an order on Halfsec, we collect:</p>
          <ul>
            <li>Your name and email address</li>
            <li>Your delivery address and phone number</li>
            <li>Order history and payment status</li>
          </ul>
          <p>We do <strong>not</strong> store your card details. Payments are processed securely by Yoco.</p>
        </section>

        <section className={styles.section}>
          <h2>2. How we use your information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process and fulfil your orders</li>
            <li>Send you order confirmation and shipping updates</li>
            <li>Respond to your enquiries</li>
            <li>Improve our service</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Data security</h2>
          <p>Your data is stored securely in our database. Passwords are hashed using bcrypt and are never stored in plain text. We use HTTPS encryption on all pages.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Cookies</h2>
          <p>We use a single secure, HTTP-only cookie to keep you logged in. This cookie cannot be accessed by JavaScript and expires after 7 days.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Third parties</h2>
          <p>We share your data with:</p>
          <ul>
            <li><strong>Yoco</strong> — to process card payments</li>
            <li><strong>Cloudinary</strong> — to store product images</li>
            <li><strong>Resend</strong> — to send transactional emails</li>
            <li>Your chosen courier — to deliver your order</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Your rights</h2>
          <p>You may request to view, update or delete your personal data at any time by emailing us at <a href="mailto:hello@halfsec.co.za">hello@halfsec.co.za</a>.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Contact</h2>
          <p>For any privacy concerns, contact us at <a href="mailto:hello@halfsec.co.za">hello@halfsec.co.za</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPage;