import type { JobFilter } from './types';

export function buildLinkedInSearchURL(filters: JobFilter): string {
  const { role, location, timeWindow, yoe, education } = filters;

  const f_TPR = `r${timeWindow * 3600}`;

  /* LinkedIn levels: 1 = Internship, 2 = Entry, 3 = Associate, 4 = Mid-Senior, 5 = Director, 6 = Executive */
  let f_E = '';
  if (yoe <= 0) f_E = '1';             // internship
  else if (yoe <= 2) f_E = '2';        // entry-level
  else if (yoe <= 5) f_E = '3';        // associate
  else if (yoe <= 10) f_E = '4';       // mid-senior
  else if (yoe <= 15) f_E = '5';       // director
  else f_E = '6';                      // executive / 15+ YOE

  // Education bias (no official filter)
  const eduKeyword =
    education && education !== ''
      ? ` ${education.toLowerCase()} degree`
      : '';

  const base = new URL('https://www.linkedin.com/jobs/search/?');
  base.searchParams.set('keywords', `${role}${eduKeyword}`);
  base.searchParams.set('location', location);
  base.searchParams.set('f_TPR', f_TPR);
  if (f_E) base.searchParams.set('f_E', f_E);

  return base.toString();
}

export function buildIndeedSearchURL(filters: JobFilter): string {
  const { role, location, timeWindow, yoe, education } = filters;

  const fromage = Math.max(1, Math.round(timeWindow / 24));

  const eduKeyword = 
    education && education !== ''
    ? ` ${education.toLowerCase()} degree`
    : '';
  
  let explvl = '';
  if (yoe <= 0) explvl = 'INTERN';
  else if (yoe <= 2) explvl = 'ENTRY_LEVEL';
  else if (yoe <= 5) explvl = 'MID_LEVEL';
  else if (yoe <= 10) explvl = 'SENIOR_LEVEL';

  const base = new URL('https://www.indeed.com/jobs?');

  base.searchParams.set('q', `${role}${eduKeyword}`);
  base.searchParams.set('l', location);
  base.searchParams.set('radius', '50');
  base.searchParams.set('fromage', fromage.toString());
  base.searchParams.set('sort', 'date');

  if (explvl) base.searchParams.set('sc', `0kf:explvl(${explvl});`);

  return base.toString();
}

export function agentStepInstructions(filters: JobFilter): string[] {
  const role = filters.role?.trim() || "";
  const location = filters.location?.trim() || "";

  const steps: string[] = [
    `click the input labeled 'Job title, keywords, or company', type "${role}"`,
    `click the input labeled 'Where' or 'Location', type "${location}"`,
    `click the button labeled 'Find jobs' or press Enter in the job title input`,
    `click 'Apply' or close the 'Date posted' panel`,
  ];

  return steps;
}