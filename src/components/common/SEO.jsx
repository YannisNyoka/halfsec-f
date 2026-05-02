import { Helmet } from 'react-helmet-async';

const DEFAULT = {
  title: 'halfsec',
  description:
    'Curated second-hand goods at half the price. Quality checked, fairly priced, delivered anywhere in South Africa.',
  image: 'https://halfsec.co.za/halfsec.png',
  url: 'https://halfsec.co.za',
  siteName: 'halfsec',
  twitterHandle: '@halfsec',
};

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  product,
}) => {
  const fullTitle = title
    ? `${title} | halfsec`
    : DEFAULT.title;

  const metaDescription = description || DEFAULT.description;
  const metaImage = image || DEFAULT.image;
  const metaUrl = url || DEFAULT.url;

  return (
    <Helmet>
      {/* ── Basic ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={metaUrl} />

      {/* ── Open Graph (Facebook, WhatsApp, LinkedIn) ── */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULT.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={metaUrl} />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULT.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* ── Product specific (for product pages) ── */}
      {product && (
        <>
          <meta property="og:type" content="product" />
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="ZAR" />
          <meta
            property="product:availability"
            content={product.stock > 0 ? 'in stock' : 'out of stock'}
          />
          <meta property="product:condition" content={product.condition} />
        </>
      )}

      {/* ── JSON-LD structured data ── */}
      <script type="application/ld+json">
        {JSON.stringify(
          product
            ? {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.name,
                description: product.description,
                image: product.images?.[0]?.url,
                offers: {
                  '@type': 'Offer',
                  price: product.price,
                  priceCurrency: 'ZAR',
                  availability:
                    product.stock > 0
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
                  seller: { '@type': 'Organization', name: 'halfsec' },
                },
              }
            : {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'halfsec',
                url: DEFAULT.url,
                description: DEFAULT.description,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${DEFAULT.url}/shop?search={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
              }
        )}
      </script>
    </Helmet>
  );
};

export default SEO;