import WatchPageContent from "@/components/watch/WatchPageContent";
import SeoMetadataService from "@/services/seo-metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { s } = await searchParams;
  if (!s) {
    return notFound();
  }

  try {
    // Fetch SEO metadata for the smartlink using server-compatible method
    const seoData = await SeoMetadataService.getSmartLinkSeoMetadata(
      s as string
    );
    return {
      title: `${seoData.title}`,
      description: seoData.description,
      openGraph: {
        title: seoData.title,
        description: seoData.description,
        type: "website",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/watch?s=${s}`,
        images: [
          {
            url: seoData.image,
            alt: seoData.title,
            ...(seoData.width && { width: seoData.width }),
            ...(seoData.height && { height: seoData.height }),
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: seoData.title,
        description: seoData.description,
        images: [seoData.image],
      },
    };
  } catch (error) {
    return notFound();
  }
}

const page = async ({ searchParams }: Props) => {
  const { s } = await searchParams;
  return <WatchPageContent slug={s as string | undefined} />;
};

export default page;
