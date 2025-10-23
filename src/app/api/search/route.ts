import { NextRequest, NextResponse } from "next/server";
import type { JobFilter } from "@/lib/types";
import { scrapeLinkedIn } from "@/lib/scraper/linkedin";
import { scrapeIndeed } from "@/lib/scraper/indeed";

export async function POST(request: NextRequest) {
    try {
        const body : JobFilter = await request.json();
        const { role, location, jobBoards } = body;
        
        if (!role || !location) {
            return NextResponse.json(
                { error: "missing role/location in request body"},
                { status: 400 }
            );
        }

        if (!Array.isArray(jobBoards) || jobBoards.length == 0) {
            return NextResponse.json(
                { error: "select at least one job board" },
                { status: 400 }
            );
        }

        // running the scrapers concurrently
        const scraperResults = await Promise.all(
            jobBoards.map(async (board) => {
                switch (board) { 
                    case "LinkedIn":
                        return scrapeLinkedIn(body);
                    case "Indeed":
                        return scrapeIndeed(body);
                    default: 
                        return { jobs: [], liveViewUrl: null };
                }
            })
        );

            
        const jobs = scraperResults.flatMap(r => r.jobs);
        const liveViews = scraperResults
            .map((r, i) => ({ board: jobBoards[i], url: r.liveViewUrl }))
            .filter(r => !!r.url)
        
        return NextResponse.json({ jobs, liveViews });

    } catch (err: unknown) {
        console.error('Search API Error: ', err);
        return NextResponse.json(
            { error : "Internal Server Error"},
            { status: 500 }
        );
    }
}