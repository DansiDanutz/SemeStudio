"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Coins,
  CreditCard,
  ArrowUpRight,
  Zap,
  Crown,
} from "lucide-react";

const CURRENT_PLAN = {
  name: "Pro",
  price: 29,
  credits: 500,
  remaining: 45,
  renewDate: "May 1, 2026",
};

const PLANS = [
  { name: "Free", price: 0, credits: 10, current: false },
  { name: "Starter", price: 9, credits: 100, current: false },
  { name: "Pro", price: 29, credits: 500, current: true },
  { name: "Agency", price: 79, credits: 2000, current: false },
];

const CREDIT_PACKS = [
  { credits: 50, price: 4, perCredit: "$0.08" },
  { credits: 200, price: 14, perCredit: "$0.07" },
  { credits: 500, price: 29, perCredit: "$0.058" },
];

const TRANSACTIONS = [
  { date: "Apr 16", action: "AI Script Generation", amount: -5 },
  { date: "Apr 15", action: "AI Thumbnail Generation", amount: -3 },
  { date: "Apr 15", action: "SEO Optimization", amount: -2 },
  { date: "Apr 14", action: "Topic Research", amount: -1 },
  { date: "Apr 14", action: "AI Script Generation", amount: -5 },
  { date: "Apr 13", action: "Shorts Factory", amount: -6 },
  { date: "Apr 12", action: "Credit Pack Purchase", amount: 50 },
  { date: "Apr 1", action: "Monthly Subscription Reset", amount: 500 },
];

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Billing & Credits</h1>
        <p className="text-sm text-[#52525B] mt-1">Manage your subscription, credits, and payments</p>
      </div>

      {/* Current Plan */}
      <Card className="border-[#FF0000]/20 bg-[#111] glow-red">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#FF0000]/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-[#FF0000]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#FAFAFA]">{CURRENT_PLAN.name} Plan</h3>
                  <Badge className="bg-[#FF0000] text-white border-0 text-[10px]">Current</Badge>
                </div>
                <p className="text-sm text-[#52525B]">
                  ${CURRENT_PLAN.price}/month &middot; Renews {CURRENT_PLAN.renewDate}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#222] text-[#A1A1AA] hover:text-[#FAFAFA] text-sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A1A1AA]">Credits Used</span>
                <span className="text-sm font-bold text-[#FAFAFA]">
                  {CURRENT_PLAN.credits - CURRENT_PLAN.remaining} / {CURRENT_PLAN.credits}
                </span>
              </div>
              <Progress
                value={((CURRENT_PLAN.credits - CURRENT_PLAN.remaining) / CURRENT_PLAN.credits) * 100}
                className="h-2 bg-[#1a1a1a]"
              />
              <p className="text-xs text-[#52525B] mt-1">
                {CURRENT_PLAN.remaining} credits remaining
              </p>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-4xl font-black text-[#FAFAFA] tracking-tight">{CURRENT_PLAN.remaining}</p>
                <p className="text-xs text-[#52525B]">credits left</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packs */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#7C3AED]" />
            Buy Credit Packs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className="rounded-xl border border-[#222] bg-[#0a0a0a] p-5 text-center hover:border-[#7C3AED]/30 transition-colors"
              >
                <Zap className="h-5 w-5 text-[#7C3AED] mx-auto mb-2" />
                <p className="text-2xl font-black text-[#FAFAFA] tracking-tight">{pack.credits}</p>
                <p className="text-xs text-[#52525B] mb-3">credits</p>
                <p className="text-lg font-bold text-[#FAFAFA]">${pack.price}</p>
                <p className="text-[10px] text-[#52525B] mb-3">{pack.perCredit}/credit</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs"
                >
                  Purchase
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Compare Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-4 text-center ${
                  plan.current
                    ? "border-[#FF0000]/30 bg-[#FF0000]/5"
                    : "border-[#222] bg-[#0a0a0a]"
                }`}
              >
                <p className="text-sm font-bold text-[#FAFAFA] mb-1">{plan.name}</p>
                <p className="text-2xl font-black text-[#FAFAFA] tracking-tight">
                  ${plan.price}
                  <span className="text-xs text-[#52525B] font-normal">/mo</span>
                </p>
                <p className="text-xs text-[#52525B] mt-1 mb-3">{plan.credits} credits</p>
                {plan.current ? (
                  <Badge className="bg-[#FF0000] text-white border-0 text-[10px]">Current</Badge>
                ) : plan.price > 29 ? (
                  <Button size="sm" className="bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs w-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Upgrade
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-[#222] text-[#52525B] text-xs w-full" disabled>
                    Downgrade
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-[#222] bg-[#111]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#FAFAFA]">Credit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#1a1a1a]">
            {TRANSACTIONS.map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      tx.amount > 0 ? "bg-[#22C55E]/10" : "bg-[#52525B]/10"
                    }`}
                  >
                    <Coins
                      className="h-4 w-4"
                      style={{ color: tx.amount > 0 ? "#22C55E" : "#52525B" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-[#FAFAFA]">{tx.action}</p>
                    <p className="text-xs text-[#52525B]">{tx.date}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    tx.amount > 0 ? "text-[#22C55E]" : "text-[#A1A1AA]"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}{tx.amount} cr
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
