# gatsby-plugin-react-helmet-canonical-urls

This can be use as a drop in replacement of [`gatsby-plugin-canonical-urls`](https://www.npmjs.com/package/gatsby-plugin-canonical-urls).

Add canonical links to HTML pages Gatsby generates using react helmet.

This implementation is primarily helpful for distinguishing between https/http,
www/no-www but could possibly be extended to help with when sites add multiple
paths to the same page.

## Motivation

`gatsby-plugin-canonical-urls` and `gatsby-plugin-react-helmet` are plugins that do not always play well together.
The first one always inserts a default canonical url, but doesn't allow to override that value in an easy way.
When trying to use react helmet to override `gatsby-plugin-canonical-urls` default url, you will end up with
two canonical tags.

This plugin, as writes the default canonical url using react helmet, allows to override default canonical url just
using the standard react helmet api.

## Install

`npm install --save gatsby-plugin-react-helmet gatsby-plugin-react-helmet-canonical-urls`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-react-helmet`,
  {
    resolve: `gatsby-plugin-react-helmet-canonical-urls`,
    options: {
      siteUrl: `https://www.example.com`,
    },
  },
]
```

With the above configuration, the plugin will add to the head of every HTML page
a `rel=canonical` e.g.

```html
<link rel="canonical" href="http://www.example.com/about-us/" />
```

#### `options`

##### `siteUrl`
- **Type:** `string`
- **Required**
- The root address of your site (e.g., `https://www.example.com`). This is required to generate the full canonical URL. The plugin will do nothing if this is not provided.

##### `include`
- **Type:** `(string | RegExp)[]`
- **Default:** `undefined`
- If provided, the plugin operates in **whitelist mode**. A canonical URL will be generated **only** for paths that match a pattern in this array. If this option is used, `exclude` is ignored. Note that strings are treated as regular expression patterns.
  - **Example:** `include: ['/products/']` will match `/products/cool-item` but not `/about-us`.

##### `exclude`
- **Type:** `(string | RegExp)[]`
- **Default:** `undefined`
- If `include` is not used, the plugin operates in **blacklist mode**. This option allows you to exclude specific paths from receiving a canonical URL. This is useful for pages with other SEO tags like `noindex`.

> #### ⚠️ Breaking Change in v2.0.0
> String patterns in the `exclude` and `include` arrays are now treated as **Regular Expressions** instead of exact string matches. This provides more powerful and predictable matching.
>
> **Old Behavior (v1.x.x):**
> `exclude: ['/admin']` would only block the exact path `/admin`. It would **not** block `/admin/login`.
>
> **New Behavior (v2.x.x):**
> `exclude: ['/admin']` now functions like a regex and will block any path that **contains** the string `/admin`, including `/admin` itself, `/admin/login`, and `/some/other/admin/page`.
>
> **✅ How to Restore Old Behavior:**
> To match an exact path only, use start (`^`) and end (`$`) anchors in your string:
> `exclude: ['^/admin$']`

##### `noTrailingSlash`
- **Type:** `boolean`
- **Default:** `false`
- If `true`, removes the trailing slash from the generated canonical URL. This should be used if your site enforces a no-trailing-slash policy, for example, by using `gatsby-plugin-remove-trailing-slashes`.

##### `noQueryString`
- **Type:** `boolean`
- **Default:** `false`
- If `true`, removes query parameters (e.g., `?id=123`) from the generated canonical URL.

##### `noHash`
- **Type:** `boolean`
- **Default:** `false`
- If `true`, removes the hash fragment (e.g., `#section-one`) from the generated canonical URL.
