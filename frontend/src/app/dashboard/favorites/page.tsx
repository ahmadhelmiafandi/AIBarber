"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Scissors, Droplets, Loader2 } from "lucide-react"
import { useCustomerFavorites, useToggleFavoriteMutation } from "@/hooks/use-customer"

const initialFavoritesFallback = [
  { id: "1", hairstyle_id: "h1", name: "Textured Crop", category: "Modern", match: 95, maintenance: "Rendah" },
  { id: "2", hairstyle_id: "h2", name: "Undercut", category: "Klasik Modern", match: 92, maintenance: "Sedang" },
  { id: "3", hairstyle_id: "h3", name: "Pompadour", category: "Klasik", match: 88, maintenance: "Tinggi" },
]

const maintenanceColor: Record<string, "success" | "warning" | "destructive"> = {
  Rendah: "success",
  Sedang: "warning",
  Tinggi: "destructive",
}

export default function FavoritesPage() {
  const { data: apiFavorites, isLoading } = useCustomerFavorites()
  const toggleMutation = useToggleFavoriteMutation()

  const favorites = apiFavorites && apiFavorites.length > 0
    ? apiFavorites.map((f) => ({
        id: f.id,
        hairstyle_id: f.hairstyle_id,
        name: f.hairstyle?.name || "Hairstyle Favorit",
        category: f.hairstyle?.category || "Style Pria",
        match: 90,
        maintenance: f.hairstyle?.maintenance_level || "Sedang",
      }))
    : initialFavoritesFallback

  const removeFavorite = async (hairstyleId: string) => {
    try {
      await toggleMutation.mutateAsync(hairstyleId)
    } catch {
      // Handled by query invalidation
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
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
                disabled={toggleMutation.isPending}
                onClick={() => removeFavorite(style.hairstyle_id)}
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
                    maintenanceColor[style.maintenance] || "success"
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
