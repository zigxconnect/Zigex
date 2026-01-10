import { Metadata } from 'next';
import InternshipDetailsClient from './InternshipDetailsClient.tsx';

async function getInternship(id: string) {
  try {
    const res = await fetch(`https://www.zigexconnect.com/api/students/internships?id=${id}`, {
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
  const internship = await getInternship(resolvedParams.id);

  if (!internship) {
    return {
      title: 'Internship Not Found | Zigex',
    };
  }

  const title = `${internship.title} Internship | Zigex`;
  const description = internship.description?.substring(0, 160) || `Apply for the ${internship.title} internship opportunity on Zigex.`;
  const image = internship.internship_picture_url || "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.zigexconnect.com/internships/${internship.id}`,
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
  return <InternshipDetailsClient id={resolvedParams.id} />;
}