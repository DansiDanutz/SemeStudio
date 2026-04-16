"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, ExternalLink, Unlink, Users, Video, Eye } from "lucide-react";

const CHANNELS = [
  {
    id: "1",
    name: "SemeBitcoin",
    handle: "@semebitcoin",
    subscribers: "23.1K",
    videos: 142,
    views: "2.4M",
    connected: true,
  },
  {
    id: "2",
    name: "Tech Reviews",
    handle: "@techreviews",
    subscribers: "5.2K",
    videos: 34,
    views: "320K",
    connected: true,
  },
];

export default function ChannelsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">YouTube Channels</h1>
          <p className="text-sm text-[#52525B] mt-1">Connect and manage your YouTube channels</p>
        </div>
        <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Connect Channel
        </Button>
      </div>

      <div className="space-y-4">
        {CHANNELS.map((channel) => (
          <Card key={channel.id} className="border-[#222] bg-[#111]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-[#FF0000]/10 text-[#FF0000] text-lg font-bold">
                    {channel.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#FAFAFA]">{channel.name}</h3>
                    <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 text-[10px]">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-[#52525B] mb-4">{channel.handle}</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="h-4 w-4 text-[#52525B]" />
                      <span className="text-[#A1A1AA] font-medium">{channel.subscribers}</span>
                      <span className="text-[#52525B]">subs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Video className="h-4 w-4 text-[#52525B]" />
                      <span className="text-[#A1A1AA] font-medium">{channel.videos}</span>
                      <span className="text-[#52525B]">videos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Eye className="h-4 w-4 text-[#52525B]" />
                      <span className="text-[#A1A1AA] font-medium">{channel.views}</span>
                      <span className="text-[#52525B]">views</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#222] text-[#A1A1AA] hover:text-[#FAFAFA] text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/10 text-xs"
                  >
                    <Unlink className="h-3 w-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-[#222] bg-transparent">
        <CardContent className="p-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-3">
            <Plus className="h-5 w-5 text-[#52525B]" />
          </div>
          <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">Connect another channel</h3>
          <p className="text-xs text-[#52525B] mb-4">
            Link your YouTube channel to start managing content
          </p>
          <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white text-sm">
            Connect with YouTube
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
