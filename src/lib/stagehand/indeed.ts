import type { Job, JobFilter, ScraperResults } from "../types";
import { jobExtractionSchema } from "../types";
import { getKernelBrowser } from "../kernel/browserManager";
import { agentStepInstructions } from "../utils";
import { createStagehand } from "../initializations";

const INDEED_PERSISTENCE_ID = "indeed";

export async function runIndeedWithStagehand(filters: JobFilter): Promise<ScraperResults> {
	const { kernelBrowser, browser } = await getKernelBrowser(INDEED_PERSISTENCE_ID);
	
	const stagehand = createStagehand(kernelBrowser.cdp_ws_url);

	try {
		await stagehand.init();

		const page = stagehand.context.pages()[0];

		await page.goto("https://www.indeed.com/");
		
		/* prompt construction */
		const steps = agentStepInstructions(filters);

		for (const step of steps) {
			await stagehand.act(step);
			await new Promise((resolve) => setTimeout(resolve, 250));
		}

		const extracted: any = await stagehand.extract({
			instruction: "Extract up to 10 jobs with title, company, location, and the absolute job link.",
			schema: jobExtractionSchema as any,
		} as any);

		const jobsRaw = ((extracted && extracted.results) || []) as any[];
		const jobs: Job[] = jobsRaw.map((j: any) => {
			const link = j.link?.startsWith("http") ? j.link : `https://www.indeed.com${j.link || ""}`;
			return {
				title: j.title?.trim() || "",
				company: (j.company || "").trim(),
				location: (j.location || "").trim(),	
				link,
				source: "Indeed",
			} as Job;
		}).filter((j: Job) => j.title !== "" && j.link !== "");

		return { jobs, liveViewUrl: kernelBrowser.browser_live_view_url };
	} finally {
		await stagehand.close();
		await browser.close();
	}
}