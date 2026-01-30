import RoomWatchPageContent from "@/components/watch/RoomWatchPageContent";
import React from "react";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  return <RoomWatchPageContent slug={slug} />;
};

export default page;
