# Checklists App

A personal project checklist web app. Built with React + Vite. No backend — all data lives in localStorage.


## Local Development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### One-time setup

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under *Source*, select **GitHub Actions**
4. Done — the workflow in `.github/workflows/deploy.yml` handles everything automatically on every push to `main`

### ⚠️ Important: update the base URL

In `vite.config.js`, change the `base` value to match your repo name:

```js
base: '/YOUR-REPO-NAME/',
```

For example, if your repo is `github.com/alice/my-checklists`:

```js
base: '/my-checklists/',
```

If you're deploying to a **custom domain** or your repo is named `<username>.github.io`, set:

```js
base: '/',
```

## Build manually

```bash
npm run build
# output goes to dist/
```
