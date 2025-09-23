// /app/api/fupro-ai/company/route.ts

import { NextResponse } from 'next/server';

// This list can be expanded or fetched from a database in the future.
// Ensure you have corresponding logo images in your /public/logos/ directory.
const suggestedCompanies = [
  { id: 'seed', name: 'Seed', logo: '/seed.png' },
  { id: 'google', name: 'Google', logo: '/sky8.png' },
  { id: 'microsoft', name: 'Microsoft', logo: '/civil.png' },
  { id: 'meta', name: 'Meta', logo: '/tratz.png' },
  { id: 'zixtech', name: 'Zixtech Corporation', logo: '/nervtech.png' },
  { id: 'tratz', name: 'Tratz', logo: '/gita.png' },
  { id: 'mtn', name: 'MTN Cameroon', logo: '/google.png' },
  { id: 'orange', name: 'Orange Cameroun', logo: '/valley.png' },
];

export async function GET() {
  try {
    // Simulate a short network delay for a better loading experience
    await new Promise(resolve => setTimeout(resolve, 400));
    return NextResponse.json(suggestedCompanies);
  } catch (error) {
    console.error('[SUGGEST COMPANIES API ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch company suggestions' }, { status: 500 });
  }
}