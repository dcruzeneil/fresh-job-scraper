import { Kernel } from "@onkernel/sdk";

export function kernelClient() {
    const apiKey = process.env.KERNEL_API_KEY;
    if (!apiKey) {
        throw new Error("Missing KERNEL_API_KEY environment variable!");
    }
    return new Kernel({ apiKey });
}