import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputEnhanced from "@/components/ui/input-enhanced";
import { TabsContent } from "@/components/ui/tabs";
import { useUpload } from "@/contexts/upload";
import { useUpdateUser, useUser } from "@/hooks/useUser";
import {
  cn,
  formatCurrencyAmount,
  formatNumber,
  handleFileSelection,
} from "@/lib/utils";
import userService from "@/services/user";
import { IUser } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  User2
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const ProfileTab = () => {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => userService.getStats(),
  });
  const [image, setImage] = useState<File | null>(null);
  const { data: user, isLoading, refetch } = useUser();
  const { mutate: updateUser, isPending: isSaving } = useUpdateUser();
  const [imageErrors, setImageErrors] = useState<string | string[]>([]);
  const [form, setForm] = useState<Partial<IUser>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    username: "",
  });
  const { uploadS3 } = useUpload();
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user]);
  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  const handleSave = async () => {
    if (!form.username) {
      toast.error("Username is required");
      return;
    }

    const data = {
      ...form,
    };

    if (image) {
      const url = await uploadS3(image);
      if (url) {
        data.image = url;
      }
    }

    updateUser(data, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileSelection({
      files,
      allowedFormats: [".png", ".jpg", ".jpeg"],
      maxSize: 1024 * 1024 * 2, // 2MB
      onSuccess: (files) => {
        setImage(files[0]);
        setImageErrors([]);
      },
      onError: (error) => setImageErrors(error),
    });
  };

  return (
    <TabsContent value="profile" className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="inline-flex items-center gap-2">
              <User2 className="w-5 h-5 " /> Personal Information
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {user?.image || image ? (
                <Image
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : user?.image || "/images/default.png"
                  }
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover size-full"
                />
              ) : (
                <>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </>
              )}
            </div>
            <div>
              <label
                htmlFor="image-input"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "mb-1",
                  "cursor-pointer"
                )}
              >
                Change Photo
              </label>
              <input
                id="image-input"
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
              <div className="text-xs text-muted-foreground">
                JPG, PNG or JPEG. Max size 2MB.
              </div>
              {imageErrors && (
                <div className="text-xs text-red-500">
                  {Array.isArray(imageErrors)
                    ? imageErrors.join(", ")
                    : imageErrors}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            <InputEnhanced
              label="First Name"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
            <InputEnhanced
              label="Last Name"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4"> */}
          <InputEnhanced
            label="Username"
            placeholder="Username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
          {/* <InputEnhanced
                label="Email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              /> */}
          {/* </div> */}
          <InputEnhanced
            label="Phone"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mb-4"
          />
          <InputEnhanced
            label="Location"
            placeholder="Location"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="mb-4"
          />
          <InputEnhanced
            label="Bio"
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            textarea
            className="mb-6"
          />
          <Button className="mt-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
      {/* Preferences Section */}
      {/* <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Choose what notifications you want to receive and program
              participation
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-muted-foreground/10">
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-semibold">Email Notifications</div>
                  <div className="text-muted-foreground text-sm">
                    Receive updates via email
                  </div>
                </div>
                <Switch
                  checked={prefs.email}
                  onCheckedChange={(v) => handlePrefChange("email", v)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-semibold">Push Notifications</div>
                  <div className="text-muted-foreground text-sm">
                    Receive push notifications
                  </div>
                </div>
                <Switch
                  checked={prefs.push}
                  onCheckedChange={(v) => handlePrefChange("push", v)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-semibold">Marketing Updates</div>
                  <div className="text-muted-foreground text-sm">
                    Receive marketing and promotional content
                  </div>
                </div>
                <Switch
                  checked={prefs.marketing}
                  onCheckedChange={(v) => handlePrefChange("marketing", v)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-semibold">Weekly Reports</div>
                  <div className="text-muted-foreground text-sm">
                    Get weekly performance summaries
                  </div>
                </div>
                <Switch
                  checked={prefs.weekly}
                  onCheckedChange={(v) => handlePrefChange("weekly", v)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-semibold">Beta Tester</div>
                    <div className="text-muted-foreground text-sm">
                      Do you want to be part of our beta program?
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <Switch
                  checked={prefs.beta}
                  onCheckedChange={(v) => handlePrefChange("beta", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card> */}
      {/* Account Status Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/40 text-green-400 border border-green-700">
                  <BadgeCheck className="w-4 h-4 mr-1" /> Verified
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted/40 text-blue-300 border border-blue-700">
                  Beta Tester
                </span>
              </div>
              <div className="mb-1">
                <span className="font-semibold">Member since</span>
                <span className="ml-2 text-muted-foreground">January 2023</span>
              </div>
              <div>
                <span className="font-semibold">Plan</span>
                <span className="ml-2 text-muted-foreground">Pro Plan</span>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Crown className="w-4 h-4" /> Upgrade Account
            </Button>
          </div>
        </CardContent>
      </Card> */}
      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total Views</span>
              <span className="text-lg font-semibold text-right md:text-left">
                {formatNumber(stats?.totalViews)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Content Pieces</span>
              <span className="text-lg font-semibold text-right md:text-left">
                {formatNumber(stats?.contentPieces)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Subscribers</span>
              <span className="text-lg font-semibold text-right md:text-left">
                {formatNumber(stats?.subscribers)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total Earnings</span>
              <span className="text-lg font-semibold text-right md:text-left">
                {stats?.totalEarnings
                  ? formatCurrencyAmount(stats?.totalEarnings, "USD")
                  : "$0"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Account Actions Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start gap-2">
              <Download className="w-4 h-4" /> Export Data
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Eye className="w-4 h-4" /> Privacy Settings
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 text-red-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </TabsContent>
  );
};

export default ProfileTab;
