import { Helmet } from "react-helmet-async";

const BASE_URL = "https://quickmeet-ag.vercel.app";

/**
 * SEO Component - Manages per-page meta tags for better search engine optimization.
 *
 * @param {Object} props
 * @param {string} props.title - Page title (appended with " | QuickMeet")
 * @param {string} props.description - Meta description for the page
 * @param {string} [props.path="/"] - URL path for canonical and og:url
 * @param {string} [props.type="website"] - Open Graph type
 * @param {boolean} [props.noIndex=false] - Set true for pages that shouldn't be indexed
 */
const SEO = ({
  title,
  description,
  path = "/",
  type = "website",
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | QuickMeet` : "QuickMeet - Quick and Reliable Video Meetings";
  const url = `${BASE_URL}${path}`;
  const imageUrl = `${BASE_URL}/og-image.png`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
