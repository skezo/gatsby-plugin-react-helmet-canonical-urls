const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Helmet } = require('react-helmet');
const wrapPageElement = require('./wrap-page');

Helmet.canUseDOM = false;

describe('gatsby-plugin-react-helmet-canonical-urls', () => {
  // Reset Helmet's static state before each test to prevent side-effects
  beforeEach(() => {
    Helmet.renderStatic();
  });

  const runPlugin = (location, options) => {
    const element = wrapPageElement(
      {
        element: React.createElement('div', null, 'Page Element'),
        props: { location },
      },
      options
    );
    ReactDOMServer.renderToString(element);
    return Helmet.renderStatic().link.toComponent();
  };

  describe('Core Functionality', () => {
    it('should generate a full canonical URL with all parts', () => {
      const location = {
        pathname: '/pathname/',
        search: '?search',
        hash: '#hash',
      };
      const options = { siteUrl: 'https://my-site.com' };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(1);
      expect(linkTags[0].props.href).toBe(
        'https://my-site.com/pathname/?search#hash'
      );
    });

    it('should default to a single "/" for a falsy pathname', () => {
      const location = { pathname: '', search: '?q=1', hash: '' };
      const options = { siteUrl: 'https://my-site.com' };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(1);
      expect(linkTags[0].props.href).toBe('https://my-site.com/?q=1');
    });
  });

  describe('Option Flags', () => {
    test.each([
      ['noTrailingSlash', 'https://my-site.com/pathname?search#hash'],
      ['noQueryString', 'https://my-site.com/pathname/#hash'],
      ['noHash', 'https://my-site.com/pathname/?search'],
    ])('should correctly format URL when `%s` is true', (option, expected) => {
      const location = {
        pathname: '/pathname/',
        search: '?search',
        hash: '#hash',
      };
      const options = {
        siteUrl: 'https://my-site.com',
        [option]: true,
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(1);
      expect(linkTags[0].props.href).toBe(expected);
    });
  });

  describe('Exclude Logic (Blacklist Mode)', () => {
    it('should not generate a canonical URL for an excluded path', () => {
      const location = { pathname: '/excluded-page/' };
      const options = {
        siteUrl: 'https://my-site.com',
        exclude: ['/excluded-page'],
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(0);
    });

    it('should block sub-paths due to regex matching', () => {
      const location = { pathname: '/admin/dashboard' };
      const options = {
        siteUrl: 'https://my-site.com',
        exclude: ['/admin'], // This will match any path containing '/admin'
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(0);
    });

    it('should NOT block sub-paths when using anchors for an exact match', () => {
      const location = { pathname: '/admin/dashboard' };
      const options = {
        siteUrl: 'https://my-site.com',
        exclude: ['^/admin$'], // This will only match the exact '/admin' path
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(1);
      expect(linkTags[0].props.href).toBe(
        'https://my-site.com/admin/dashboard'
      );
    });
  });

  describe('Include Logic (Whitelist Mode)', () => {
    it('should generate a canonical URL for an included path', () => {
      const location = { pathname: '/blog/my-post' };
      const options = {
        siteUrl: 'https://my-site.com',
        include: ['/blog/'],
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(1);
      expect(linkTags[0].props.href).toBe('https://my-site.com/blog/my-post');
    });

    it('should NOT generate a canonical URL for a non-included path', () => {
      const location = { pathname: '/about-us' };
      const options = {
        siteUrl: 'https://my-site.com',
        include: ['/blog/'],
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(0);
    });

    it('should ignore the `exclude` array when `include` is present', () => {
      const location = { pathname: '/blog/my-post' };
      const options = {
        siteUrl: 'https://my-site.com',
        include: ['/blog/'],
        exclude: ['/blog/my-post'], // This should be ignored
      };
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(1); // It should still be included
    });
  });

  describe('Edge Cases', () => {
    it('should not generate a canonical URL if siteUrl is not provided', () => {
      const location = { pathname: '/' };
      const options = {}; // No siteUrl
      const linkTags = runPlugin(location, options);

      expect(linkTags).toHaveLength(0);
    });
  });
});