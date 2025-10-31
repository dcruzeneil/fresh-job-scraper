'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import type { JobFilter, JobBoard, Job } from '@/lib/types';
import KernelLiveView from '@/components/KernelLiveView';

export default function HomePage() {
  const [filters, setFilters] = useState<JobFilter>({
    role: '',
    location: '',
    timeWindow: 24,
    yoe: 0,
    education: '',
    jobBoards: ['LinkedIn'],
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agenticMode, setAgenticMode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: ['timeWindow', 'yoe'].includes(name) ? Number(value) : value,
    }));
  };

  const handleJobBoardToggle = (board: JobBoard) => {
    setFilters(prev => ({
      ...prev,
      jobBoards: prev.jobBoards.includes(board)
        ? prev.jobBoards.filter(b => b !== board)
        : [...prev.jobBoards, board],
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = agenticMode ? '/api/agent-search' : '/api/search';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.liveViews && Array.isArray(data.liveViews)) {
        data.liveViews.forEach((lv: { board: string, url: string}) => {
          if (!lv.url) return;
          const key = `kernelLiveViewUrl_${lv.board.toLowerCase()}`;
          localStorage.setItem(key, lv.url);
        });
      }

      setJobs(data.jobs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccentColor = (board: string) => {
    if (board === 'LinkedIn') return 'border-l-blue-500';
    if (board === 'Indeed') return 'border-l-cyan-500';
    if (board === 'Handshake') return 'border-l-amber-500';
    return 'border-l-slate-300';
  };

  const getLogoSrc = (board: string) => {
    if (board === 'LinkedIn') return '/logos/linkedin.png';
    if (board === 'Indeed') return '/logos/indeed.png';
    if (board === 'Handshake') return '/logos/handshake.png';
    return '/logos/default.png';
  };

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar */}
      <aside className="w-[400px] bg-white border-r border-slate-200 p-8 flex flex-col justify-between">
        <div>
          <div className="mb-10 pb-8 border-b border-slate-100">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Job Finder
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Search fresh roles across top job boards — powered by {' '}
              <a
                href="https://www.onkernel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 hover:text-slate-900 font-medium underline underline-offset-2 transition-colors"
              >
                OnKernel
              </a>
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-6">
            {/* Agentic Mode Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 transition-colors">
              <span className="text-sm font-medium text-slate-700">Agentic Mode (Stagehand)</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={agenticMode} onChange={() => setAgenticMode(v => !v)} />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 relative" />
              </label>
            </div>
            
            {/* Role + Location */}
            {[{ label: 'Role', name: 'role', type: 'text', placeholder: 'Software Engineer' },
              { label: 'Location', name: 'location', type: 'text', placeholder: 'Philadelphia, PA' }].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-medium mb-2 text-slate-600 uppercase tracking-wide">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={(filters as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>
            ))}

            {/* Time Window */}
            <div>
              <label className="block text-xs font-medium mb-2 text-slate-600 uppercase tracking-wide">Time Window</label>
              <select
                name="timeWindow"
                value={filters.timeWindow}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={48}>Last 48 hours</option>
              </select>
            </div>

            {/* YOE */}
            <div>
              <label className="block text-xs font-medium mb-2 text-slate-600 uppercase tracking-wide">Years of Experience</label>
              <input
                type="number"
                name="yoe"
                value={filters.yoe}
                onChange={handleChange}
                placeholder="0"
                min={0}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-medium mb-2 text-slate-600 uppercase tracking-wide">Education</label>
              <select
                name="education"
                value={filters.education}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value="">Any</option>
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            {/* Job Boards */}
            <div>
              <label className="block text-xs font-medium mb-2.5 text-slate-600 uppercase tracking-wide">Job Boards</label>
              <div className="grid grid-cols-3 gap-2">
                {(['LinkedIn', 'Indeed', 'Handshake'] as JobBoard[]).map(board => (
                  <label
                    key={board}
                    className={`flex items-center justify-center rounded-lg border transition-all cursor-pointer px-3 py-2.5 ${
                      filters.jobBoards.includes(board)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.jobBoards.includes(board)}
                      onChange={() => handleJobBoardToggle(board)}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium">{board}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || !filters.role}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white py-3 px-4 text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? 'Searching…' : 'Search Jobs'}
          </button>

          {/* Persistent Live Views */}
          <div className="mt-6 space-y-2">
            <KernelLiveView board="LinkedIn" />
            <KernelLiveView board="Indeed" />
          </div>
        </div>
      </aside>

      {/* Results */}
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">Search Results</h2>
            {jobs.length > 0 && (
              <p className="text-sm text-slate-500 font-medium">
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
              </p>
            )}
          </div>
          
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center text-slate-500 h-64">
              <Loader2 className="animate-spin h-5 w-5 mr-3" />
              <span className="text-sm">Loading jobs...</span>
            </div>
          )}

          {!loading && (
            <ul className="space-y-3">
              {jobs.map((job, idx) => (
                <li
                  key={idx}
                  className={`border-l-[3px] ${getAccentColor(job.source)} bg-white border border-slate-200 rounded-lg p-5 hover:shadow-sm hover:border-slate-300 transition-all group`}
                >
                  <div className="flex items-start gap-3.5 mb-2.5">
                    <div className="flex-shrink-0 mt-0.5">
                      <Image
                        src={getLogoSrc(job.source)}
                        alt={job.source}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-slate-900 hover:text-slate-700 transition-colors block truncate"
                      >
                        {job.title}
                      </a>
                      <p className="text-sm text-slate-500 mt-1">
                        {job.company} <span className="text-slate-400">•</span> {job.location}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {!loading && jobs.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-sm">No jobs found yet. Try adjusting your filters.</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}