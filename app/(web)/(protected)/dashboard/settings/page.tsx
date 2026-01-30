"use client";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import MonetizationTab from "@/components/dashboard/settings/MonetizationTab";
import ProfileTab from "@/components/dashboard/settings/ProfileTab";
import SettingsTab from "@/components/dashboard/settings/SettingsTab";
import ApiIntegrationTab from "@/components/dashboard/settings/ApiIntegrationTab";
import BillingTab from "@/components/dashboard/settings/BillingTab";
import MembersTab from "@/components/dashboard/settings/MembersTab";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/useUser";
import { useEffectiveRole } from "@/hooks/useUserRole";
import {
  canManageBilling,
  canInviteUsers,
  canAccessMonetization,
  hasPermission,
} from "@/lib/permissions";
import { useEffect, useState } from "react";
import SecurityTab from "@/components/dashboard/settings/SecurityTab";

const ProfilePage = () => {
  const { isLoading, data: user } = useUser();
  const effectiveRole = useEffectiveRole();
  const [tab, setTab] = useState<string>("profile");

  // Check permissions for each tab
  const canAccessBilling = effectiveRole
    ? canManageBilling(effectiveRole, user || undefined)
    : false;
  const canAccessMembers = effectiveRole
    ? canInviteUsers(effectiveRole, user || undefined)
    : false;
  // Members can read but not edit business profile
  const canAccessBusinessProfile = effectiveRole
    ? hasPermission(effectiveRole, "company:read", user || undefined) ||
      hasPermission(effectiveRole, "company:write", user || undefined) ||
      hasPermission(effectiveRole, "company:*", user || undefined)
    : false;
  const canEditBusinessProfile = effectiveRole
    ? hasPermission(effectiveRole, "company:write", user || undefined) ||
      hasPermission(effectiveRole, "company:*", user || undefined)
    : false;
  const canAccessMonetizationTab = effectiveRole
    ? canAccessMonetization(effectiveRole, user || undefined)
    : false;
  useEffect(() => {
    const storedTab = localStorage.getItem("tabValue");
    if (storedTab) {
      // Check if stored tab is accessible, otherwise default to profile
      const accessibleTabs: Record<string, boolean> = {
        profile: true, // Always accessible
        "api-integration": true, // Always accessible
        settings: canAccessBusinessProfile, // Read access for members, write for owners/admins
        members: canAccessMembers,
        monetization: canAccessMonetizationTab,
        billing: canAccessBilling,
        security: true, // Always accessible (if enabled)
      };

      if (accessibleTabs[storedTab]) {
        localStorage.removeItem("tabValue");
        setTab(storedTab);
      } else {
        localStorage.removeItem("tabValue");
        setTab("profile");
      }
    }
  }, [
    canAccessBilling,
    canAccessMembers,
    canAccessBusinessProfile,
    canAccessMonetizationTab,
  ]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <PageTitle
        title="Account"
        description="Manage your account settings and billing information."
        content={null}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value)}
        className="w-full"
      >
        <TabsList className="flex items-center justify-start flex-wrap h-auto  p-1  gap-2 w-full">
          <TabsTrigger value="profile" className="h-10">
            Personal Profile
          </TabsTrigger>

          {canAccessBusinessProfile && (
            <TabsTrigger value="settings" className="h-10">
              Business Profile
            </TabsTrigger>
          )}
          {canAccessMembers && (
            <TabsTrigger value="members" className="h-10">
              Members
            </TabsTrigger>
          )}
          {canAccessMonetizationTab && (
            <TabsTrigger value="monetization" className="h-10">
              Monetisation
            </TabsTrigger>
          )}
          {canAccessBilling && (
            <TabsTrigger value="billing" className="h-10">
              Billing
            </TabsTrigger>
          )}
          <TabsTrigger value="api-integration" className="h-10">
            API
          </TabsTrigger>
          {/* <TabsTrigger value="security" className="h-10">
            Security
          </TabsTrigger> */}
        </TabsList>

        <ProfileTab />
        <ApiIntegrationTab />
        {canAccessBusinessProfile && (
          <SettingsTab canEdit={canEditBusinessProfile} />
        )}
        {canAccessMembers && <MembersTab />}
        {canAccessMonetizationTab && <MonetizationTab />}
        {canAccessBilling && <BillingTab />}
        <SecurityTab />
      </Tabs>
    </>
  );
};

export default ProfilePage;
