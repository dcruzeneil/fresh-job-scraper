import { Kernel } from "@onkernel/sdk";
import { Stagehand } from "@browserbasehq/stagehand";

export function kernelClient() {
    const apiKey = process.env.KERNEL_API_KEY;
    if (!apiKey) {
        throw new Error("Missing KERNEL_API_KEY environment variable!");
    }
    return new Kernel({ apiKey });
}

export function createStagehand(cdpUrl: string) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY environment variable!");
    }

    return new Stagehand({
        env: "LOCAL",
        disablePino: true,
        verbose: 1,
        domSettleTimeout: 30000,
        model: "openai/gpt-4.1-mini",
        localBrowserLaunchOptions: { 
            cdpUrl: cdpUrl
        }
    });
}