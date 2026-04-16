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
import { Palette, Plus, Download, RefreshCw, Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useThumbnailGenerate } from "@/hooks/useThumbnailGenerate";
import type { ThumbnailStyle } from "@/types";

const STYLES: { label: string; value: ThumbnailStyle }[] = [
  { label: "Minimal", value: "minimal" },
  { label: "Bold", value: "bold" },
  { label: "Face + Text", value: "face_text" },
  { label: "Cinematic", value: "cinematic" },
  { label: "Meme", value: "meme" },
  { label: "Tutorial", value: "tutorial" },
];

const COLORS = [
  "#FF0000", "#7C3AED", "#3B82F6", "#22C55E", "#F59E0B", "#EC4899",
  "#06B6D4", "#F97316", "#FAFAFA", "#080808",
];

interface GeneratedThumb {
  url: string;
  variantIndex: number;
  revisedPrompt: string;
  title: string;
  style: string;
}

export default function ThumbnailsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<ThumbnailStyle>("bold");
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [generated, setGenerated] = useState<GeneratedThumb[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const mutation = useThumbnailGenerate();

  const handleGenerate = async () => {
    if (!title.trim()) return;
    const result = await mutation.mutateAsync({
      title,
      style,
      colorTheme: selectedColor,
      variants: 3,
    });
    const newThumbs: GeneratedThumb[] = result.variants.map((v) => ({
      ...v,
      title,
      style: STYLES.find((s) => s.value === style)?.label ?? style,
    }));
    setGenerated((prev) => [...newThumbs, ...prev]);
    setSheetOpen(false);
    setTitle("");
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA] placeholder:text-[#52525B]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#A1A1AA]">Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as ThumbnailStyle)}>
                  <SelectTrigger className="border-[#222] bg-[#0a0a0a] text-[#FAFAFA]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#222] bg-[#111] text-[#FAFAFA]">
                    {STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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

              {mutation.isError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {mutation.error instanceof Error ? mutation.error.message : "Generation failed"}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={mutation.isPending || !title.trim()}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11"
              >
                {mutation.isPending ? (
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

      {generated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {generated.map((thumb, idx) => (
            <Card key={idx} className="border-[#222] bg-[#111] overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb.url}
                  alt={thumb.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-white/10 backdrop-blur-sm text-white border-white/20 text-xs hover:bg-white/20"
                    onClick={() => window.open(thumb.url, "_blank")}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className={`text-white text-xs ${
                      selectedId === idx ? "bg-[#22C55E]" : "bg-white/10 hover:bg-[#22C55E]/80"
                    }`}
                    onClick={() => setSelectedId(idx)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </div>
                {selectedId === idx && (
                  <div className="absolute top-2 right-2">
                    <span className="rounded-full bg-[#22C55E] px-2 py-0.5 text-[10px] font-bold text-white">Selected</span>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-[#A1A1AA] truncate">{thumb.title}</p>
                <p className="text-[10px] text-[#52525B] mt-0.5">Variant {thumb.variantIndex + 1} · {thumb.style}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
            <Palette className="h-7 w-7 text-[#52525B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-1">No thumbnails yet</h3>
          <p className="text-sm text-[#52525B] max-w-sm">
            Generate AI thumbnails with DALL-E 3. Each generation creates 3 variants optimized for YouTube CTR.
          </p>
          <Button
            className="mt-6 bg-[#FF0000] hover:bg-[#CC0000] text-white"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate First Thumbnail
          </Button>
        </div>
      )}

      {generated.length > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            className="text-[#52525B] hover:text-[#FAFAFA] text-sm"
            onClick={() => setSheetOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate more
          </Button>
        </div>
      )}
    </div>
  );
}
