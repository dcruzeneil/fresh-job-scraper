import { chromium } from "playwright-core";
import { kernelClient } from "@/lib/initializations";

export async function getKernelBrowser(persistenceId : string) {
    const client = kernelClient();
    const kernelBrowser = await client.browsers.create({
        persistence: { id: persistenceId },
    });

    const browser = await chromium.connectOverCDP(kernelBrowser.cdp_ws_url);
    const context = browser.contexts()[0] || (await browser.newContext());
    const page = context.pages()[0] || (await context.newPage());

    return { client, kernelBrowser, browser, page };
} 