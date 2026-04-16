"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Settings saved");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Settings</h1>
        <p className="text-sm text-[#52525B] mt-1">Manage your account and preferences</p>
      </div>

      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-[#7C3AED] text-white text-xl font-bold">DS</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center hover:bg-[#222] transition-colors">
                <Camera className="h-3 w-3 text-[#A1A1AA]" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">Dan Semenescu</p>
              <p className="text-xs text-[#52525B]">Pro Plan &middot; Member since Jan 2026</p>
            </div>
          </div>

          <Separator className="bg-[#1a1a1a]" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-[#A1A1AA]">Full Name</Label>
              <Input
                defaultValue="Dan Semenescu"
                className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#A1A1AA]">Email</Label>
              <Input
                defaultValue="dan@semebitcoin.com"
                className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-[#A1A1AA]">Default AI Language</Label>
            <Input
              defaultValue="English"
              className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Upload complete", desc: "Get notified when a video finishes uploading" },
            { label: "Credit alerts", desc: "Alert when credits drop below 20%" },
            { label: "Weekly analytics", desc: "Receive a weekly performance summary" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#FAFAFA]">{item.label}</p>
                <p className="text-xs text-[#52525B]">{item.desc}</p>
              </div>
              <button
                className="relative h-6 w-11 rounded-full bg-[#22C55E] transition-colors"
                aria-label={`Toggle ${item.label}`}
              >
                <span className="absolute top-0.5 left-[22px] h-5 w-5 rounded-full bg-white transition-transform shadow-sm" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-[#EF4444]/20 bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#EF4444]">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#52525B] mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="outline" className="border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
