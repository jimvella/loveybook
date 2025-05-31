# Loveybook

A web based PDF reader for children. Presents PDFs as a horizontally scrolling carousel for a fun way of turning the page.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

Deployment is via Github pages. svelte.config.js has been configured to output the built static site to /docs for Github pages. Publishing is a matter of committing the changes to /docs and pushing to Github.
