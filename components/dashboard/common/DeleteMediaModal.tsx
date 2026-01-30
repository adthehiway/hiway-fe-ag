"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Trash2,
  Eye,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { IMedia, ISmartLink, SmartLinkAccess } from "@/types";
import { formatNumber, getSmartLinkUrl } from "@/lib/utils";
import moment from "moment";
import Link from "next/link";

interface DeleteMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  media: IMedia | null;
  smartlinks: ISmartLink[];
  isLoading?: boolean;
}

export default function DeleteMediaModal({
  isOpen,
  onClose,
  onConfirm,
  media,
  smartlinks,
  isLoading = false,
}: DeleteMediaModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmationText("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (confirmationText === "DELETE" && !isDeleting) {
      setIsDeleting(true);
      try {
        await onConfirm();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && confirmationText === "DELETE") {
      handleConfirm();
    }
  };

  if (!media) return null;

  // Calculate total analytics from smartlinks
  const totalViews = smartlinks.reduce(
    (sum, link) => sum + (link.totalViews || 0),
    0
  );
  const totalRevenue = smartlinks.reduce(
    (sum, link) => sum + (link.totalRevenue || 0),
    0
  );

  const isConfirmEnabled = confirmationText === "DELETE" && !isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <DialogTitle className="text-xl text-white">
                Delete Content - Warning
              </DialogTitle>
              <DialogDescription className="text-sm">
                You are about to permanently delete this content. This action
                cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-3">
            {/* Content to be deleted */}
            <Card className="bg-muted/50">
              <CardContent>
                <div className="text-sm text-muted-foreground mb-1">
                  Content to be deleted:
                </div>
                <div className="font-semibold text-white">
                  {media.metadata?.title || media.name}
                </div>
              </CardContent>
            </Card>

            {/* Smart Links Will Be Affected */}
            <Card className="bg-muted/50">
              <CardHeader className="">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg text-white">
                      Smart Links Will Be Affected
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Deleting this content will make {smartlinks.length} smart
                      link(s) inactive. This could impact your traffic and
                      revenue.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Eye className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {formatNumber(totalViews)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Views
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            ${totalRevenue.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Revenue
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Affected Smart Links List */}
                {smartlinks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white mb-2">
                      Affected Smart Links:
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {smartlinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 bg-background/30 rounded-lg border"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-4 h-4 border border-muted-foreground rounded" />
                            <div className="flex-1">
                              <div className="font-medium text-white text-sm">
                                {link.name || "Unnamed Link"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatNumber(link.totalViews || 0)} views •{" "}
                                {link.access === SmartLinkAccess.PAYWALL ? (
                                  <span className="text-green-400">
                                    ${link.totalRevenue?.toFixed(2)} revenue
                                  </span>
                                ) : (
                                  <span> {link.access} access</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {moment(link.createdAt).fromNow()}
                            </div>
                            <Link
                              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/smartlinks/${link.id}/edit`}
                              target="_blank"
                            >
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirmation Input */}
            <Card>
              <CardContent>
                <div className="text-sm text-white mb-2">
                  Type "DELETE" to confirm permanent deletion:
                </div>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type DELETE here"
                  className="bg-background/50 border-muted-foreground/30"
                  disabled={isDeleting}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
