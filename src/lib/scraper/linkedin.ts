import { getKernelBrowser } from '../kernel/browserManager';
import { JobFilter, Job, ScraperResults } from '../types';
import { buildLinkedInSearchURL } from '../utils';

const PERSISTENCE_ID = 'linkedin';

export async function scrapeLinkedIn(filters : JobFilter): Promise<ScraperResults> {
    const { kernelBrowser, browser, page } = await getKernelBrowser(PERSISTENCE_ID);

    try {
        /* Login Check */
        await page.goto('https://linkedin.com/feed', { 
            waitUntil : 'domcontentloaded', 
            timeout: 30000 
        });
        if (page.url().includes('/login')) {
            console.warn('Not Logged In. Please login manually!');
            return { jobs: [], liveViewUrl: kernelBrowser.browser_live_view_url };
        }

        /* Logged In: Continue with Search Functionality */
        const searchURL = buildLinkedInSearchURL(filters);
        await page.goto(searchURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        await page.waitForSelector('.scaffold-layout__list-item', { timeout: 60000 });
        await page.waitForTimeout(2000); 

        const jobsRaw : Job[] = await page.$$eval('.scaffold-layout__list-item', els => 
            els.map(el => {
                const titleEl = el.querySelector('.job-card-container__link');
                const title = titleEl?.textContent?.replace(/\s+/g, ' ').trim() || '';
                const companyEl = el.querySelector('.artdeco-entity-lockup__subtitle span');
                const company = companyEl?.textContent?.trim() || '';
                const locationEl = el.querySelector('.artdeco-entity-lockup__caption .job-card-container__metadata-wrapper li span');
                const location = locationEl?.textContent?.trim() || '';
                const linkEl = el.querySelector('.job-card-container__link');
                const link = linkEl?.getAttribute('href') || '';
                const jobCardEl = el.querySelector('[data-job-id]');
                const jobId = jobCardEl?.getAttribute('data-job-id') || '';

                return {
                    title,
                    company,
                    location,
                    link: link ? `https://www.linkedin.com${link}` : '',
                    jobId,
                    source: "LinkedIn",
                };
            })
        )
        
        const jobs : Job[] = jobsRaw.filter(job => job.title !== '');

        return { jobs, liveViewUrl: kernelBrowser.browser_live_view_url };
    } finally {
        await browser.close();
    }
}