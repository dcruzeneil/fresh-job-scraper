export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import type { JobFilter } from "@/lib/types";
import { runIndeedWithStagehand } from "@/lib/stagehand/indeed";

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

        // Support LinkedIn and Indeed via Stagehand. Others fall back to empty for now.
        const results = await Promise.all(
            jobBoards.map(async (board) => {
                switch (board) {
                    case "Indeed":
                        return runIndeedWithStagehand(body);
                    default:
                        return { jobs: [], liveViewUrl: undefined };
                }
            })
        );

        const jobs = results.flatMap(r => r.jobs);
        const liveViews = results
            .map((r, i) => ({ board: jobBoards[i], url: r.liveViewUrl }))
            .filter(r => !!r.url);

        return NextResponse.json({ jobs, liveViews });
    } catch (err: unknown) {
        console.error("Agent Search API Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}


