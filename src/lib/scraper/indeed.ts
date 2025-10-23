import { getKernelBrowser } from '../kernel/browserManager';
import { JobFilter, Job, ScraperResults } from '../types';
import { buildIndeedSearchURL } from '../utils';

const PERSISTENCE_ID = 'indeed';

export async function scrapeIndeed(filters : JobFilter): Promise<ScraperResults> {
    const { kernelBrowser, browser, page } = await getKernelBrowser(PERSISTENCE_ID);

    try {
        /* Indeed Does not Require LogIn: Continue with Search Functionality */
        const searchURL = buildIndeedSearchURL(filters);
        await page.goto(searchURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        await page.waitForSelector('.job_seen_beacon', { timeout: 60000 });
        await page.waitForTimeout(2000); 

        const jobsRaw : Job[] = await page.$$eval('.job_seen_beacon', els => 
            els.map(el => {
                const titleAnchor = el.querySelector('h2.jobTitle a.jcs-JobTitle');
                const title = titleAnchor?.textContent?.replace(/\s+/g, ' ').trim() || '';
                const href = titleAnchor?.getAttribute('href') || '';

                const companyEl = el.querySelector('[data-testid="company-name"]');
                const company = companyEl?.textContent?.trim() || '';

                const locationEl = el.querySelector('[data-testid="text-location"]');
                const location = locationEl?.textContent?.trim() || '';

        
                const jobId = titleAnchor?.getAttribute('data-jk') || el.getAttribute('data-jk') || '';

                return {
                    title,
                    company,
                    location,
                    link: href.startsWith('http')
                        ? href
                        : `https://www.indeed.com${href}`,
                    jobId,
                    source: "Indeed",
                };
            })
        );

        const jobs: Job[] = jobsRaw.filter((job) => job.title.trim().length > 0);

        return { jobs, liveViewUrl: kernelBrowser.browser_live_view_url };
    } finally {
        await browser.close();
    }
}