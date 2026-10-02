# Live Local Himalaya

Static, multi-page website for Live Local Himalaya.

## Project layout

- The HTML files in the project root are the public page routes. Keeping them there preserves the existing page URLs.
- `css/` contains the shared stylesheet and page-specific stylesheets.
- `js/` contains shared site behavior and the blog article routing.
- `details.html` and `js/details.js` provide matching detail pages for experiences, stays and packages.
- `components/` contains the reusable navigation and footer fragments.
- `images/` contains the website's images and video.
- `reference/captured-site/` contains the saved reference website and its companion files.

Serve the project root over HTTP when previewing the site so the shared header and footer fragments can load in the browser.
