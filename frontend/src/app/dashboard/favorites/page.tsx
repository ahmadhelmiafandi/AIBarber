"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Scissors, Droplets } from "lucide-react"

const initialFavorites = [
  {
    id: 1,
    name: "Textured Crop",
    category: "Modern",
    match: 95,
    maintenance: "Rendah",
  },
  {
    id: 2,
    name: "Undercut",
    category: "Klasik Modern",
    match: 92,
    maintenance: "Sedang",
  },
  {
    id: 3,
    name: "Pompadour",
    category: "Klasik",
    match: 88,
    maintenance: "Tinggi",
  },
  {
    id: 4,
    name: "Buzz Cut Fade",
    category: "Minimalis",
    match: 85,
    maintenance: "Rendah",
  },
  {
    id: 5,
    name: "Side Part",
    category: "Klasik",
    match: 82,
    maintenance: "Sedang",
  },
  {
    id: 6,
    name: "French Crop",
    category: "Modern",
    match: 80,
    maintenance: "Rendah",
  },
]

const maintenanceColor: Record<string, string> = {
  Rendah: "success",
  Sedang: "warning",
  Tinggi: "destructive",
} as const

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites)

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Belum ada favorit</p>
          <p className="text-sm text-muted-foreground">
            Simpan gaya rambut yang kamu suka dari rekomendasi AI.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((style) => (
        <Card key={style.id}>
          <div className="aspect-[4/3] rounded-t-[20px] bg-muted" />
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{style.name}</p>
                <p className="text-sm text-muted-foreground">{style.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeFavorite(style.id)}
              >
                <Heart className="h-4 w-4 fill-destructive text-destructive" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Match {style.match}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                <Badge
                  variant={
                    maintenanceColor[style.maintenance] as
                      | "success"
                      | "warning"
                      | "destructive"
                  }
                >
                  {style.maintenance}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
