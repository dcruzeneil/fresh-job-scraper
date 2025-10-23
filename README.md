## Kernel-based Fresh Job Scraper

<video controls width="600">
  <source src="https://github.com/dcruzeneil/fresh-job-scraper/raw/main/assets/demo.mp4" type="video/mp4">
  Your browser does not support playback
</video>

A job scraper built using [OnKernel](https://onkernel.com)'s Browser-as-a-Service APIs to scrape jobs from sites like LinkedIn and Indeed. This project creates a persistent remote browser instance per integration. This means you only have to log in once. Each remote browser instance runs Playwright automation, so that you can fetch recent jobs concurrently from multiple job boards without running local browsers.

## 🤖 What it Does
- Launches remote browser sessions on Kernel
- Uses `playwright-core` to automate LinkedIn/Indeed searches
- Supports filters like role, location, time window, YOE, and education
- Reuses sessions via persistent browser IDs
- First LinkedIn run requires manual login (accessed via live view link)

## ⚙️ Set Up
1. Clone the Repo
```bash
git clone git@github.com:dcruzeneil/fresh-job-scraper.git fresh-job-scraper
cd fresh-job-scraper
```

2. Install Dependencies
```bash
pnpm install
```

3. Add your API key
```bash
echo "KERNEL_API_KEY=your_api_key_here" > .env.local
```

4. Run
```bash
pnpm run dev
```

**Note:** to create an account and obtain an API key (there is also a free-tier), you can visit [OnKernel](https://onkernel.com/) and create an account.
