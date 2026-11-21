import React from 'react';
import { Metadata } from 'next';
import SingleBlogClient from '@/components/guides_components/SingleBlogClient';
import { serverApi } from '@/lib/server-api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params?.slug || '';
  const post = await serverApi.getContentPostBySlug(slug);

  if (!post) {
    return {
      title: 'চাকরি সেবা ব্লগ',
      description: 'সরকারি ও ব্যাংক চাকরি প্রস্তুতি ও ক্যারিয়ার বিশ্লেষণ।',
    };
  }

  return {
    title: `${post.title} | চাকরি সেবা ব্লগ`,
    description: post.excerpt || '',
    openGraph: {
      title: `${post.title} | চাকরি সেবা`,
      description: post.excerpt || '',
    },
  };
}

export default async function SingleBlogPage(props: PageProps) {
  const params = await props.params;
  const slug = params?.slug || '';

  return <SingleBlogClient slug={slug} />;
}
