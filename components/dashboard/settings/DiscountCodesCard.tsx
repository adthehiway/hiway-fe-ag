"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Percent, MoreVertical } from "lucide-react";
import { useState } from "react";
import { CreateDiscountCodeModal } from "./CreateDiscountCodeModal";
import { useCoupons, useDeleteCoupon } from "@/hooks/useMonetization";
import { CouponResponse, DiscountType } from "@/types";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export function DiscountCodesCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
  const { data: coupons, isLoading } = useCoupons();
  const deleteCouponMutation = useDeleteCoupon();

  const handleDelete = async () => {
    if (deleteCouponId) {
      try {
        await deleteCouponMutation.mutateAsync(deleteCouponId);
        setDeleteCouponId(null);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  const formatDiscount = (coupon: CouponResponse) => {
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      return `${coupon.percentOff}% off`;
    } else {
      const amount = (coupon.amountOff || 0) / 100;
      return `$${amount.toFixed(2)} off`;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle>Discount Codes</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Create and manage discount codes for your products
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Percent className="w-4 h-4 mr-2" />
              Create Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !coupons || coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No discount codes yet. Create your first one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-muted/40 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{coupon.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDiscount(coupon)} ·{" "}
                      {coupon.maxRedemptions || "Unlimited"} redemptions
                    </div>
                    {coupon.expiresAt && (
                      <div className="text-xs text-muted-foreground">
                        Expires:{" "}
                        {format(new Date(coupon.expiresAt), "MM/dd/yyyy")}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDeleteCouponId(coupon.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateDiscountCodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />

      <AlertDialog
        open={!!deleteCouponId}
        onOpenChange={(open) => !open && setDeleteCouponId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCouponMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteCouponMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
