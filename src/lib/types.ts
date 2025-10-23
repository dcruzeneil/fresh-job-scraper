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