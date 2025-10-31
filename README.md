## Kernel-based Fresh Job Scraper

A job scraper built using [Kernel](https://onkernel.com)'s Browser-as-a-Service APIs to scrape jobs from sites like LinkedIn and Indeed. This project creates a persistent remote browser instance per integration. This means you only have to log in once. Each remote browser instance runs Playwright automation (or Stagehand automation), so that you can fetch recent jobs concurrently from multiple job boards without running local browsers.

## 🎥 Watch Demo
<p align="center">
  <a href="https://youtu.be/28HtA0H1J3c">
    <img src="https://img.youtube.com/vi/28HtA0H1J3c/hqdefault.jpg" alt="Watch the Demo" width="640">
  </a>
</p>

## 🌱 What it Does
- Launches remote browser sessions on Kernel
- Uses `playwright-core` to automate LinkedIn/Indeed searches
- Supports filters like role, location, time window, YOE, and education
- Reuses sessions via persistent browser IDs
- First LinkedIn run requires manual login (accessed via live view link)

## 🤖 Agentic Mode
- Optional Agentic Mode through Stagehand (currently supporting Indeed), which allows expression of tasks in natural language, and thereby facilitates agentic automation (requires LLM API)

## ⚙️ Set Up
1. Clone the Repo
```bash
git clone git@github.com:dcruzeneil/fresh-job-scraper.git fresh-job-scraper
cd fresh-job-scraper
```

2. Install Dependencies
```bash
npm install
```

3. Add your API key
```bash
echo "KERNEL_API_KEY=your_api_key_here" > .env.local
echo "OPENAI_API_KEY=your_api_key_here" >> .env.local
```

4. Run
```bash
npm run dev
```

**Note:** to create an account and obtain an API key (there is also a free-tier), you can visit [OnKernel](https://onkernel.com/) and create an account.
