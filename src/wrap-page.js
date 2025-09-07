const React = require('react');
const { Helmet } = require('react-helmet');

const defaultPluginOptions = {
  noTrailingSlash: false,
  noQueryString: false,
  noHash: false,
};

/**
 * Checks if a given pathname matches any of the provided patterns.
 *
 * @param {(string|RegExp)[]} patterns - An array of strings or regular expressions to match against.
 * @param {string} pathname - The URL pathname to test.
 * @returns {boolean} - True if a match is found, otherwise false.
 */
const isMatch = (patterns, pathname) => {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return false;
  }

  // Normalize the pathname to ensure it starts with a / and has no trailing slash.
  const processedPathname = `/${(pathname || '').replace(/^\/|\/$/g, '')}`;

  return patterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(processedPathname);
    }

    if (typeof pattern === 'string') {
      try {
        // Attempt to convert string patterns to RegExp.
        const regex = new RegExp(pattern);
        return regex.test(processedPathname);
      } catch (e) {
        console.error(
          `[gatsby-plugin-react-helmet-canonical-urls] Invalid regex pattern provided: "${pattern}"`
        );
        return false;
      }
    }
    // Ignore patterns that are not strings or RegExp.
    return false;
  });
};

/**
 * Gatsby SSR API to wrap the page element.
 */
module.exports = (
  { element, props: { location } },
  pluginOptions = {}
) => {
  const options = Object.assign({}, defaultPluginOptions, pluginOptions);
  const { siteUrl, include, exclude } = options;

  if (!siteUrl) {
    console.warn(
      '[gatsby-plugin-react-helmet-canonical-urls] `siteUrl` is not configured in your gatsby-config.js. Canonical URLs will not be generated.'
    );
    return element;
  }

  // Determine the logic mode: "include" (whitelist) or "exclude" (blacklist).
  const hasIncludes = Array.isArray(include) && include.length > 0;
  const patterns = hasIncludes ? include : exclude;
  const pathIsMatched = isMatch(patterns, location.pathname);

  // In include mode, generate if the path matches.
  // In exclude mode, generate if the path does NOT match.
  const shouldGenerateCanonical = hasIncludes ? pathIsMatched : !pathIsMatched;

  if (shouldGenerateCanonical) {
    let pathname = location.pathname || '/';

    // Remove trailing slash if configured.
    if (
      options.noTrailingSlash &&
      pathname.length > 1 &&
      pathname.endsWith('/')
    ) {
      pathname = pathname.slice(0, -1);
    }

    // Construct the full canonical URL.
    let canonicalUrl = `${siteUrl}${pathname}`;

    if (!options.noQueryString) {
      canonicalUrl += location.search;
    }

    if (!options.noHash) {
      canonicalUrl += location.hash;
    }

    return (
      <React.Fragment>
        <Helmet
          link={[
            {
              rel: 'canonical',
              key: canonicalUrl,
              href: canonicalUrl,
            },
          ]}
        />
        {element}
      </React.Fragment>
    );
  }

  return element;
};