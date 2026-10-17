"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatCard from "@/components/stat-card";
import {
  apiGet,
  apiPatch,
  apiPatchForm,
  apiPost,
  getErrorMessage,
} from "@/lib/api";
import { formatBnDate, toBn } from "@/lib/constants";
import { useAuthStore } from "@/store/auth";
import type { Profile } from "@/lib/types";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await apiGet<Profile>("/user/my-profile")).data,
  });

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const res = await apiPatch<Profile>("/user/update-profile", { name });
      return res.data;
    },
    onSuccess: (updated) => {
      setUser({ name: updated.name });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("প্রোফাইল আপডেট হয়েছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateAvatar = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      const res = await apiPatchForm<Profile>("/user/update-profile", form);
      return res.data;
    },
    onSuccess: (updated) => {
      setUser({ avatar: updated.avatar });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("প্রোফাইল ছবি আপডেট হয়েছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("শুধু ছবি আপলোড করা যাবে।");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("ছবির সাইজ ৫ MB এর বেশি হতে পারবে না।");
      return;
    }
    updateAvatar.mutate(file);
  };

  const changePassword = useMutation({
    mutationFn: async () => {
      await apiPost("/auth/change-password", { oldPassword, newPassword });
    },
    onSuccess: () => {
      setOldPassword("");
      setNewPassword("");
      toast.success("পাসওয়ার্ড বদলেছে।");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">প্রোফাইল</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-20">
                {profile?.avatar && (
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                )}
                <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                  {profile?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateAvatar.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {updateAvatar.isPending ? "আপলোড হচ্ছে..." : "ছবি পরিবর্তন"}
              </Button>
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{profile?.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {profile?.email}
              </p>
              {profile?.createdAt && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  যোগদান: {formatBnDate(profile.createdAt)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="পয়েন্ট" value={toBn(profile?.total_points ?? 0)} />
        <StatCard label="পরীক্ষা" value={toBn(profile?.total_attempts ?? 0)} />
        <StatCard label="র‍্যাঙ্ক" value={`#${toBn(profile?.rank ?? 0)}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">নাম পরিবর্তন</CardTitle>
          <CardDescription>আপনার প্রদর্শিত নাম আপডেট করুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={
                updateProfile.isPending ||
                !name.trim() ||
                name.trim() === profile?.name
              }
            >
              {updateProfile.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">পাসওয়ার্ড পরিবর্তন</CardTitle>
          <CardDescription>
            নিরাপত্তার জন্য পুরনো পাসওয়ার্ড দিয়ে যাচাই করতে হবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordTooShort) return;
              changePassword.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="oldPassword">পুরনো পাসওয়ার্ড</Label>
              <Input
                id="oldPassword"
                type="password"
                required
                dir="ltr"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={8}
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={passwordTooShort}
              />
              <p
                className={
                  passwordTooShort
                    ? "text-xs text-destructive"
                    : "text-xs text-muted-foreground"
                }
              >
                কমপক্ষে ৮ অক্ষর।
              </p>
            </div>
            <Button
              type="submit"
              disabled={
                changePassword.isPending ||
                passwordTooShort ||
                !oldPassword ||
                !newPassword
              }
            >
              {changePassword.isPending ? "সেভ হচ্ছে..." : "পাসওয়ার্ড বদলান"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
