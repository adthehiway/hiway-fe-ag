import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const PageTitle = ({
  title,
  description,
  content,
  showBack = false,
  onBack,
}: {
  title: string;
  description?: string;
  content?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}) => {
  const router = useRouter();
  const handleBack = onBack || (() => router.back());

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          {description && (
            <p className="text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {content}
    </div>
  );
};

export default PageTitle;
