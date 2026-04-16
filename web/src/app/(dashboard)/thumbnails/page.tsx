"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Palette, Plus, Download, RefreshCw, Check, Sparkles, Loader2 } from "lucide-react";

const MOCK_THUMBNAILS = [
  { id: "1", title: "Bitcoin ETF Explained", style: "Bold", color: "#FF0000" },
  { id: "2", title: "Top 5 Altcoins 2026", style: "Face + Text", color: "#7C3AED" },
  { id: "3", title: "DCA Complete Guide", style: "Minimal", color: "#22C55E" },
  { id: "4", title: "Solana vs Ethereum", style: "Cinematic", color: "#3B82F6" },
  { id: "5", title: "Hardware Wallet Setup", style: "Tutorial", color: "#F59E0B" },
  { id: "6", title: "Crypto Tax Guide", style: "Bold", color: "#EC4899" },
];

const STYLES = ["Minimal", "Bold", "Face + Text", "Cinematic", "Meme", "Tutorial"];

const COLORS = [
  "#FF0000", "#7C3AED", "#3B82F6", "#22C55E", "#F59E0B", "#EC4899",
  "#06B6D4", "#F97316", "#FAFAFA", "#080808",
];

export default function ThumbnailsPage() {
  const [generating, setGenerating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FF0000");

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setGenerating(false);
    setSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Thumbnails</h1>
          <p className="text-sm text-[#52525B] mt-1">AI-generated thumbnails designed to maximize CTR</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Thumbnail
          </SheetTrigger>
          <SheetContent className="border-[#222] bg-[#111] text-[#FAFAFA] w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="text-[#FAFAFA]">Generate Thumbnails</SheetTitle>
            </SheetHeader>
            <div className="space-y-5 mt-6">
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Video Title</Label>
                <Input
                  placeholder="What's the video about?"
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Style</Label>
                <Select defaultValue="bold">
                  <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                    {STYLES.map((style) => (
                      <SelectItem key={style} value={style.toLowerCase().replace(/\s/g, "_")}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Color Theme</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-lg border-2 transition-all ${
                        selectedColor === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating 3 variants...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate 3 Variants (3 credits)
                  </>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_THUMBNAILS.map((thumb) => (
          <Card key={thumb.id} className="border-[#222] bg-[#111] overflow-hidden group">
            <div
              className="aspect-video relative flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${thumb.color}20 0%, ${thumb.color}05 100%)`,
              }}
            >
              <div className="text-center px-6">
                <Palette className="h-8 w-8 mx-auto mb-2" style={{ color: thumb.color }} />
                <p className="text-sm font-bold text-[#FAFAFA]">{thumb.title}</p>
                <p className="text-xs text-[#52525B] mt-1">{thumb.style}</p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" className="bg-white/10 backdrop-blur-sm text-white border-white/20 text-xs hover:bg-white/20">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Redo
                </Button>
                <Button size="sm" className="bg-white/10 backdrop-blur-sm text-white border-white/20 text-xs hover:bg-white/20">
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" className="bg-[#22C55E]/80 text-white text-xs hover:bg-[#22C55E]">
                  <Check className="h-3 w-3 mr-1" />
                  Use
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs text-[#A1A1AA] truncate">{thumb.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
