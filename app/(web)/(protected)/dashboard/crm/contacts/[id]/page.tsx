"use client";

import { useParams } from "next/navigation";
import {
  useContactDetails,
  useSmartLinksWatched,
  useRevenueHistory,
} from "@/hooks/useCRM";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Eye,
  DollarSign,
  Calendar,
  Clock,
  Edit3,
  ArrowLeft,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function ContactDetailsPage() {
  const params = useParams();
  const contactId = params.id as string;
  const [smartLinksPage, setSmartLinksPage] = useState(1);
  const [revenuePage, setRevenuePage] = useState(1);

  const {
    data: contactDetails,
    isLoading,
    error,
  } = useContactDetails(contactId);

  const {
    data: smartLinksData,
    isLoading: smartLinksLoading,
    error: smartLinksError,
  } = useSmartLinksWatched(contactId, smartLinksPage, 20);

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueHistory(contactId, revenuePage, 20);

  if (isLoading) {
    return (
      <>
        <PageTitle
          title="User Details"
          description="View and manage user information."
        />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 space-y-6">
            <Card>
              <CardContent className="p-6 text-center animate-pulse">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="flex gap-2 justify-center">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded mb-4"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:w-2/3 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="h-6 bg-muted rounded mb-4 m-6"></div>
                <div className="grid grid-cols-3 gap-4 p-6">
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (error || !contactDetails) {
    return (
      <>
        <PageTitle
          title="User Details"
          description="View and manage user information."
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Contact Not Found
              </h2>
              <p className="text-muted-foreground mb-4">
                The contact you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Link href="/dashboard/crm">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to CRM
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy HH:mm");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getCountryName = (countryCode: string) => {
    const countryMap: { [key: string]: string } = {
      us: "United States",
      ca: "Canada",
      gb: "United Kingdom",
      au: "Australia",
      de: "Germany",
      fr: "France",
      es: "Spain",
      it: "Italy",
      nl: "Netherlands",
      se: "Sweden",
      no: "Norway",
      dk: "Denmark",
      fi: "Finland",
      jp: "Japan",
      kr: "South Korea",
      cn: "China",
      in: "India",
      br: "Brazil",
      mx: "Mexico",
      ar: "Argentina",
    };
    return countryMap[countryCode.toLowerCase()] || countryCode.toUpperCase();
  };

  return (
    <>
      <PageTitle
        title="User Details"
        description="View and manage user information."
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - User Profile and Contact Info */}
        <div className="lg:w-1/3 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 rounded-full mx-auto mb-4 object-cover">
                <AvatarImage src={contactDetails.avatar} />
                <AvatarFallback className="text-2xl font-bold text-white">
                  {getInitials(contactDetails.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">
                {contactDetails.name}
              </h2>
              <p className="text-muted-foreground mb-4">
                {contactDetails.email}
              </p>
              <div className="flex gap-2 justify-center">
                <Badge
                  variant={
                    contactDetails.status === "Active" ? "default" : "secondary"
                  }
                  className={
                    contactDetails.status === "Active" ? "bg-accent" : ""
                  }
                >
                  {contactDetails.status}
                </Badge>
                {/* <Badge variant="outline">Basic</Badge> */}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-white">{contactDetails.name}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="text-white">{contactDetails.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="text-white">
                    {contactDetails.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:w-2/3 space-y-6">
          {/* Tabs Section */}
          <Card>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/20">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="smartlinks" className="text-white">
                    SmartLinks
                  </TabsTrigger>
                  <TabsTrigger value="revenue" className="text-white">
                    Revenue
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="tracking-tight text-sm font-medium text-white">
                          Content Items
                        </CardTitle>
                        <Play className="h-4 w-4 text-accent" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-white">
                          {contactDetails.contentItems}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="tracking-tight text-sm font-medium text-white">
                          Total Views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-accent" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-white">
                          {contactDetails.totalViews}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="tracking-tight text-sm font-medium text-white">
                          Total Earnings
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-accent" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-accent">
                          ${contactDetails.totalEarnings}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-white">
                        Account Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 grid  lg:grid-cols-2 gap-4">
                      <div className="flex flex-col  gap-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            User ID
                          </p>
                        </div>
                        <div>
                          <p className="text-white font-mono text-sm">
                            {contactDetails.userId}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Join Date
                          </p>
                        </div>
                        <div>
                          <p className="text-white">
                            {formatDate(contactDetails.joinDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col r gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Last Active
                          </p>
                        </div>
                        <div>
                          <p className="text-white">
                            {formatDateTime(contactDetails.lastActive)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="smartlinks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-white">
                        SmartLinks Watched
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {smartLinksLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                              <div className="h-4 bg-muted rounded mb-2"></div>
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                            </div>
                          ))}
                        </div>
                      ) : smartLinksError ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Failed to load SmartLinks data
                          </p>
                        </div>
                      ) : smartLinksData?.data?.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No SmartLinks watched yet
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left">
                            <thead>
                              <tr className="border-b text-muted-foreground uppercase text-xs">
                                <th className="py-3 px-6 font-semibold">
                                  Content
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Duration
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Views
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Country
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Completion
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Last Watched
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-white text-sm">
                              {smartLinksData?.data?.map((smartLink) => (
                                <tr
                                  key={smartLink.smartLinkId}
                                  className="border-b"
                                >
                                  <td className="py-3 px-6">
                                    <div className="font-medium">
                                      {smartLink.content}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="text-muted-foreground">
                                      {smartLink.duration}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div>{smartLink.views}</div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="text-muted-foreground">
                                      {smartLink.country}{" "}
                                      {getCountryName(smartLink.country)}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <Badge
                                      variant="outline"
                                      className="border-green-500 text-green-500"
                                    >
                                      {smartLink.completion}%
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="text-muted-foreground">
                                      {smartLink.lastWatched}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Pagination */}
                      {smartLinksData?.meta &&
                        smartLinksData.meta.pages > 1 && (
                          <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                              Showing{" "}
                              {(smartLinksData.meta.page - 1) *
                                smartLinksData.meta.limit +
                                1}{" "}
                              to{" "}
                              {Math.min(
                                smartLinksData.meta.page *
                                  smartLinksData.meta.limit,
                                smartLinksData.meta.total
                              )}{" "}
                              of {smartLinksData.meta.total} results
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSmartLinksPage((prev) =>
                                    Math.max(1, prev - 1)
                                  )
                                }
                                disabled={smartLinksPage === 1}
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                              </Button>
                              <div className="flex items-center gap-1">
                                {Array.from(
                                  {
                                    length: Math.min(
                                      5,
                                      smartLinksData.meta.pages
                                    ),
                                  },
                                  (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={
                                          smartLinksPage === pageNum
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          setSmartLinksPage(pageNum)
                                        }
                                        className="w-8 h-8 p-0"
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  }
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSmartLinksPage((prev) =>
                                    Math.min(
                                      smartLinksData.meta.pages,
                                      prev + 1
                                    )
                                  )
                                }
                                disabled={
                                  smartLinksPage === smartLinksData.meta.pages
                                }
                              >
                                Next
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-white">
                        Revenue History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {revenueLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                              <div className="h-4 bg-muted rounded mb-2"></div>
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                            </div>
                          ))}
                        </div>
                      ) : revenueError ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Failed to load revenue data
                          </p>
                        </div>
                      ) : revenueData?.data?.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No revenue history found
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left">
                            <thead>
                              <tr className="border-b text-muted-foreground uppercase text-xs">
                                <th className="py-3 px-6 font-semibold">
                                  Content
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Type
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Amount
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Views
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Purchase Date
                                </th>
                                <th className="py-3 px-6 font-semibold">
                                  Last Watched
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-white text-sm">
                              {revenueData?.data?.map((revenue) => (
                                <tr
                                  key={revenue.smartLinkId}
                                  className="border-b"
                                >
                                  <td className="py-3 px-6">
                                    <div className="font-medium">
                                      {revenue.content}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <Badge
                                      variant={
                                        revenue.type === "Buy"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        revenue.type === "Buy"
                                          ? "bg-accent"
                                          : "bg-muted text-muted-foreground"
                                      }
                                    >
                                      {revenue.type}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="font-semibold text-accent">
                                      {revenue.amount}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div>{revenue.views}</div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="text-muted-foreground">
                                      {revenue.purchaseDate}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="text-muted-foreground">
                                      {revenue.lastWatched}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Pagination */}
                      {revenueData?.meta && revenueData.meta.pages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <div className="text-sm text-muted-foreground">
                            Showing{" "}
                            {(revenueData.meta.page - 1) *
                              revenueData.meta.limit +
                              1}{" "}
                            to{" "}
                            {Math.min(
                              revenueData.meta.page * revenueData.meta.limit,
                              revenueData.meta.total
                            )}{" "}
                            of {revenueData.meta.total} results
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setRevenuePage((prev) => Math.max(1, prev - 1))
                              }
                              disabled={revenuePage === 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from(
                                {
                                  length: Math.min(5, revenueData.meta.pages),
                                },
                                (_, i) => {
                                  const pageNum = i + 1;
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={
                                        revenuePage === pageNum
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setRevenuePage(pageNum)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setRevenuePage((prev) =>
                                  Math.min(revenueData.meta.pages, prev + 1)
                                )
                              }
                              disabled={revenuePage === revenueData.meta.pages}
                            >
                              Next
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
