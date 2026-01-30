"use client";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Copy,
  Users,
  TrendingUp,
  Gift,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import userService from "@/services/user";
import { IUserReferral } from "@/types";

const ReferralsPage = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { data: user } = useUser();

  // Fetch referral history
  const { data: referrals, isLoading: isReferralsLoading } = useQuery({
    queryKey: ["user-referrals"],
    queryFn: () => userService.getReferrals(),
  });

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      <PageTitle
        title="Referrals"
        description="Share your referral code and earn rewards when friends sign up"
      />

      <div className="space-y-6">
        {/* Referral Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share your referral code and link to earn rewards when friends
              sign up!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted/50 border rounded-lg px-3 py-2 font-mono text-sm">
                    {user?.referralCode}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(user?.referralCode || "", "code")
                    }
                  >
                    {copiedCode ? (
                      <CheckCircle className="h-4 w-4 " />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Referral Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted/50 border rounded-lg px-3 py-2 font-mono text-sm truncate">
                    {process.env.NEXT_PUBLIC_APP_URL}?ref=
                    {user?.referralCode}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        `${process.env.NEXT_PUBLIC_APP_URL}?ref=${user?.referralCode}`,
                        "link"
                      )
                    }
                  >
                    {copiedLink ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-semibold text-accent mb-3">How it works</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  Share your code or link with friends
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  They sign up using your referral
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  You both earn rewards!
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Referral History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Referral History
            </CardTitle>
            <CardDescription>
              Track the users who signed up using your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isReferralsLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[200px]" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : referrals && referrals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral: IUserReferral) => (
                    <TableRow key={referral.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={referral.avatar}
                              alt={referral.name}
                            />
                            <AvatarFallback>
                              {referral.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{referral.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {referral.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            referral.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {referral.status === "active" ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Inactive
                            </div>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(referral.joinedDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your referral code to start earning rewards!
                </p>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      `${process.env.NEXT_PUBLIC_APP_URL}?ref=${user?.referralCode}`,
                      "link"
                    )
                  }
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Referral Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReferralsPage;
