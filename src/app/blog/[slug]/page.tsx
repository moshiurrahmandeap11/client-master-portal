import React from 'react';
import { Metadata } from 'next';
import SingleBlogClient from '@/components/guides_components/SingleBlogClient';
import { blogPostsData } from '@/data/preparationData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params?.slug || '';
  const post = blogPostsData.find(p => p.slug === slug) || blogPostsData[0];

  return {
    title: `${post.title} | চাকরি সেবা ব্লগ`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | চাকরি সেবা`,
      description: post.excerpt,
    },
  };
}

export default async function SingleBlogPage(props: PageProps) {
  const params = await props.params;
  const slug = params?.slug || '';

  return <SingleBlogClient slug={slug} />;
}
