import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import SEO from '../../components/common/SEO';
import styles from './HowItWorksPage.module.css';

const STEPS = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: '1. List your item',
    desc: 'Snap a few clear photos, add a title, description, category and your price. Listing is free — there\'s no charge to publish an item.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: '2. A buyer pays securely',
    desc: 'When someone buys your item, their payment is held safely in escrow — it doesn\'t land in your account yet. This is what keeps both of you protected.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: '3. Ship it',
    desc: 'Pack the item and mark the order as shipped with a courier and tracking number, so the buyer can follow it every step of the way.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: '4. Get paid',
    desc: 'Once the buyer confirms the item arrived OK — or automatically after 7 days — the funds are released to your Halfsec balance. Request a payout to your bank account anytime.',
  },
];

const FAQS = [
  {
    q: 'How much does it cost to sell?',
    a: 'Nothing. Listing is free and Halfsec doesn\'t take a commission — you keep 100% of your sale price. Buyers pay a small buyer protection fee on top of your price, which is what covers the secure escrow and support.',
  },
  {
    q: 'When exactly do I get my money?',
    a: 'As soon as the buyer marks the order as received, the sale amount moves into your Halfsec balance. If they don\'t respond, it releases automatically 7 days after delivery. From your balance, you can request a payout to your bank account whenever you like.',
  },
  {
    q: 'What if the buyer says there\'s a problem?',
    a: 'If a buyer raises an issue before the funds are released, our team steps in to review it before anything is paid out or refunded — so you\'re never just left to sort it out alone.',
  },
  {
    q: 'Do I need approval to start selling?',
    a: 'Yes — a quick one-time application. Tell us a bit about what you sell and add your banking details for payouts. Most applications are reviewed within 1-2 business days.',
  },
  {
    q: 'Can buyers negotiate on price?',
    a: 'Buyers can send you offers on your listings, which you\'re free to accept, decline, or counter. Accepted offers are paid and protected the same way as a regular purchase.',
  },
];

const HowItWorksPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.page}>
      <SEO
        title="How selling works"
        description="A simple, step-by-step guide to selling on Halfsec — from listing an item to getting paid."
        url="https://halfsec.co.za/how-it-works"
      />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.badge}>For sellers</span>
          <h1 className={styles.title}>Selling on Halfsec, made simple</h1>
          <p className={styles.sub}>
            List an item, get paid when it sells. No selling fees, no complicated setup —
            here's exactly how it works from start to finish.
          </p>
          <Link to={isAuthenticated ? '/sell' : '/register'} className="btn btn-primary btn-lg">
            {isAuthenticated ? 'Start selling' : 'Create a free account'}
          </Link>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Four steps, start to finish</h2>
          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.title} className={styles.stepCard}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it's safe ── */}
      <section className={`${styles.section} ${styles.trustSection}`}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div>
              <h2 className={styles.sectionTitle}>Why sellers trust Halfsec</h2>
              <p className={styles.trustLead}>
                Every sale is protected by escrow, so payment is guaranteed to be there
                before you ship — and you're never left chasing a buyer for money.
              </p>
            </div>
            <ul className={styles.trustList}>
              <li>
                <strong>Zero selling fees</strong>
                <span>Keep 100% of your listing price. We never take a commission.</span>
              </li>
              <li>
                <strong>Payment held in escrow</strong>
                <span>Funds are secured the moment a buyer pays, before you even ship.</span>
              </li>
              <li>
                <strong>Fast payouts</strong>
                <span>Released to your balance on delivery confirmation, or after 7 days automatically.</span>
              </li>
              <li>
                <strong>Support if something goes wrong</strong>
                <span>Our team reviews any dispute before funds are paid out or refunded.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Common questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <details key={faq.q} className={styles.faqItem}>
                <summary className={styles.faqQ}>{faq.q}</summary>
                <p className={styles.faqA}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaContent}`}>
          <h2 className={styles.ctaTitle}>Ready to turn your closet into cash?</h2>
          <p className={styles.ctaSub}>It only takes a few minutes to list your first item.</p>
          <Link to={isAuthenticated ? '/sell' : '/register'} className="btn btn-primary btn-lg">
            {isAuthenticated ? 'Start selling' : 'Create a free account'}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
