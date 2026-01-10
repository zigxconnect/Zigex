import { Metadata } from 'next';
import ProgramDetailsClient from './ProgramDetailsClient.tsx';

async function getProgram(id: string) {
  try {
    const res = await fetch(`https://www.zigexconnect.com/api/students/programs?id=${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const program = await getProgram(resolvedParams.id);

  if (!program) {
    return {
      title: 'Program Not Found | Zigex',
    };
  }

  const title = `${program.title} | Zigex Programs`;
  const description = program.description?.substring(0, 160) || `Enroll in the ${program.title} program today via Zigex.`;
  const image = program.program_picture_url || "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.zigexconnect.com/programs/${program.id}`,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: any }) {
  const resolvedParams = await params;
  return <ProgramDetailsClient id={resolvedParams.id} />;
}