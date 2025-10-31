import { z } from "zod";

export type JobBoard = 'LinkedIn' | 'Indeed' | 'Handshake';

export type JobFilter = {
    role: string;
    location: string;
    timeWindow: number;
    yoe: number;
    education: string;
    jobBoards: JobBoard[];
};

export type Job = {
    title: string;
    company: string;
    location: string;
    link: string;
    jobId?: string;
    source: JobBoard;
}

export type ScraperResults = {
    jobs: Job[];
    liveViewUrl: string | undefined;
};

export const jobExtractionSchema = z.object({
    results: z.array(
        z.object({
            title: z.string().min(1),
            company: z.string().min(1).catch(""),
            location: z.string().catch(""),
            link: z.string().url().or(z.string().min(1)),
        })
    )
});