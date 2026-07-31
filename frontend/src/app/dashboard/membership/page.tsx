"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Crown, Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const tiers = [
  {
    name: "Bronze",
    price: "Rp 99.000",
    period: "/bulan",
    highlight: false,
    benefits: [
      "Diskon 5% setiap potong",
      "Booking prioritas",
      "Akses AI Consultant dasar",
      "Poin reward 1x",
    ],
  },
  {
    name: "Silver",
    price: "Rp 199.000",
    period: "/bulan",
    highlight: true,
    benefits: [
      "Diskon 10% setiap potong",
      "Booking prioritas tinggi",
      "Akses AI Consultant lengkap",
      "Poin reward 2x",
      "Gratis 1x potong/bulan",
      "Produk styling diskon 15%",
    ],
  },
  {
    name: "Gold",
    price: "Rp 349.000",
    period: "/bulan",
    highlight: false,
    benefits: [
      "Diskon 20% setiap potong",
      "Booking VIP tanpa antri",
      "AI Consultant premium + riwayat",
      "Poin reward 3x",
      "Gratis 2x potong/bulan",
      "Produk styling diskon 25%",
      "Akses lounge eksklusif",
      "Home service 1x/bulan",
    ],
  },
]

export default function MembershipPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-accent/10">
              <Crown className="h-7 w-7 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Silver Member</p>
                <Badge>Aktif</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Berlaku hingga 15 Agustus 2026
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Poin Reward</span>
              <span className="font-medium">1.250 / 2.000</span>
            </div>
            <Progress value={1250} max={2000} className="w-full sm:w-48" />
            <p className="text-xs text-muted-foreground">750 poin lagi ke Gold</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Pilih Paket Membership</h3>
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative",
                tier.highlight && "border-accent"
              )}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground">
                    <Star className="mr-1 h-3 w-3" />
                    Populer
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 p-6">
                <ul className="space-y-3">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                >
                  {tier.name === "Silver" ? "Paket Aktif" : "Pilih Paket"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
