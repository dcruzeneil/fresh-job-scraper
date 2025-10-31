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
    if (board === 'Indeed') return 'border-l-sky-500';
    if (board === 'Handshake') return 'border-l-yellow-400';
    return 'border-l-gray-300';
  };

  const getLogoSrc = (board: string) => {
    if (board === 'LinkedIn') return '/logos/linkedin.png';
    if (board === 'Indeed') return '/logos/indeed.png';
    if (board === 'Handshake') return '/logos/handshake.png';
    return '/logos/default.png';
  };

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-[480px] bg-white border-r border-gray-200 shadow-sm p-8 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Job Finder Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Search fresh roles across top job boards - powered by {' '}
              <a
                href="https://www.onkernel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                OnKernel
              </a>
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-5">
            {/* Agentic Mode Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-medium text-gray-700">Agentic Mode (Stagehand)</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={agenticMode} onChange={() => setAgenticMode(v => !v)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative" />
              </label>
            </div>
            {/* Role + Location */}
            {[{ label: 'Role', name: 'role', type: 'text', placeholder: 'Software Engineer' },
              { label: 'Location', name: 'location', type: 'text', placeholder: 'Philadelphia, PA' }].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1 text-gray-700">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={(filters as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            ))}

            {/* Time Window */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Time Window</label>
              <select
                name="timeWindow"
                value={filters.timeWindow}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={48}>Last 48 hours</option>
              </select>
            </div>

            {/* YOE */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Years of Experience</label>
              <input
                type="number"
                name="yoe"
                value={filters.yoe}
                onChange={handleChange}
                placeholder="0"
                min={0}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Education</label>
              <select
                name="education"
                value={filters.education}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Any</option>
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            {/* Job Boards */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Job Boards</label>
              <div className="grid grid-cols-2 gap-2">
                {(['LinkedIn', 'Indeed', 'Handshake'] as JobBoard[]).map(board => (
                  <label
                    key={board}
                    className={`flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2 hover:bg-gray-100 cursor-pointer transition ${
                      filters.jobBoards.includes(board) ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.jobBoards.includes(board)}
                      onChange={() => handleJobBoardToggle(board)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{board}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !filters.role}
          className="mt-8 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white py-3 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading && <Loader2 className="animate-spin h-4 w-4" />}
          {loading ? 'Searching…' : 'Search Jobs'}
        </button>

        {/* Persistent Live Views */}
        <div className="mt-6 space-y-2">
          <KernelLiveView board="LinkedIn" />
          <KernelLiveView board="Indeed" />
        </div>
      </aside>

      {/* Results */}
      <section className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Search Results</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading && (
          <div className="flex items-center justify-center text-gray-500 h-40">
            <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading jobs...
          </div>
        )}

        {!loading && (
          <ul className="space-y-4">
            {jobs.map((job, idx) => (
              <li
                key={idx}
                className={`border-l-4 ${getAccentColor(job.source)} bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src={getLogoSrc(job.source)}
                    alt={job.source}
                    width={28}
                    height={28}
                    className="rounded"
                  />
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-gray-900 hover:text-blue-700 transition"
                  >
                    {job.title}
                  </a>
                </div>
                <p className="text-sm text-gray-600">
                  {job.company} • {job.location}
                </p>
              </li>
            ))}
            {!loading && jobs.length === 0 && (
              <p className="text-gray-500 italic">No jobs found yet. Try adjusting your filters.</p>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}