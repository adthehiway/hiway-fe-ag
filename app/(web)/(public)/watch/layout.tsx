import { Metadata } from "next";
import SeoMetadataService from "@/services/seo-metadata";

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-full w-full">
      <div className="h-full w-full">{children}</div>
    </main>
  );
}
