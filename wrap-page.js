"use strict";

var React = require('react');

var _require = require('react-helmet'),
    Helmet = _require.Helmet;

var defaultPluginOptions = {
  noTrailingSlash: false,
  noQueryString: false,
  noHash: false
};
/**
 * Checks if a given pathname matches any of the provided patterns.
 *
 * @param {(string|RegExp)[]} patterns - An array of strings or regular expressions to match against.
 * @param {string} pathname - The URL pathname to test.
 * @returns {boolean} - True if a match is found, otherwise false.
 */

var isMatch = function isMatch(patterns, pathname) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return false;
  } // Normalize the pathname to ensure it starts with a / and has no trailing slash.


  var processedPathname = "/" + (pathname || '').replace(/^\/|\/$/g, '');
  return patterns.some(function (pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(processedPathname);
    }

    if (typeof pattern === 'string') {
      try {
        // Attempt to convert string patterns to RegExp.
        var regex = new RegExp(pattern);
        return regex.test(processedPathname);
      } catch (e) {
        console.error("[gatsby-plugin-react-helmet-canonical-urls] Invalid regex pattern provided: \"" + pattern + "\"");
        return false;
      }
    } // Ignore patterns that are not strings or RegExp.


    return false;
  });
};
/**
 * Gatsby SSR API to wrap the page element.
 */


module.exports = function (_ref, pluginOptions) {
  var element = _ref.element,
      location = _ref.props.location;

  if (pluginOptions === void 0) {
    pluginOptions = {};
  }

  var options = Object.assign({}, defaultPluginOptions, pluginOptions);
  var siteUrl = options.siteUrl,
      include = options.include,
      exclude = options.exclude;

  if (!siteUrl) {
    console.warn('[gatsby-plugin-react-helmet-canonical-urls] `siteUrl` is not configured in your gatsby-config.js. Canonical URLs will not be generated.');
    return element;
  } // Determine the logic mode: "include" (whitelist) or "exclude" (blacklist).


  var hasIncludes = Array.isArray(include) && include.length > 0;
  var patterns = hasIncludes ? include : exclude;
  var pathIsMatched = isMatch(patterns, location.pathname); // In include mode, generate if the path matches.
  // In exclude mode, generate if the path does NOT match.

  var shouldGenerateCanonical = hasIncludes ? pathIsMatched : !pathIsMatched;

  if (shouldGenerateCanonical) {
    var pathname = location.pathname || '/'; // Remove trailing slash if configured.

    if (options.noTrailingSlash && pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    } // Construct the full canonical URL.


    var canonicalUrl = "" + siteUrl + pathname;

    if (!options.noQueryString) {
      canonicalUrl += location.search;
    }

    if (!options.noHash) {
      canonicalUrl += location.hash;
    }

    return React.createElement(React.Fragment, null, React.createElement(Helmet, {
      link: [{
        rel: 'canonical',
        key: canonicalUrl,
        href: canonicalUrl
      }]
    }), element);
  }

  return element;
};