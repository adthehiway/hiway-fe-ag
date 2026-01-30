"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Permission } from "@/lib/permissions";

interface AccessDeniedProps {
  requiredPermission?: Permission | Permission[];
  message?: string;
}

export function AccessDenied({
  requiredPermission,
  message,
}: AccessDeniedProps) {
  const permissions = requiredPermission
    ? Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission]
    : [];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            {message || `You don't have permission to access this page.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            If you believe this is an error, please contact your administrator.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
