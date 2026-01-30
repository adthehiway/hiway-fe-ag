import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TwoFactorSettingsWidget } from "@/components/auth/two-factor-settings.widget";

const SecurityTab = () => {
  return (
    <TabsContent value="security" className="space-y-6">
      <TwoFactorSettingsWidget />
    </TabsContent>
  );
};

export default SecurityTab;
