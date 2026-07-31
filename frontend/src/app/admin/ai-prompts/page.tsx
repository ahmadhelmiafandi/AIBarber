"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Save, Info } from "lucide-react"

const initialPrompts = [
  {
    id: "system",
    title: "System Prompt",
    description: "Prompt utama untuk persona AI barbershop",
    value: `Kamu adalah AI Smart Barbershop Assistant. Kamu membantu pelanggan memilih gaya rambut yang cocok berdasarkan bentuk wajah, preferensi, dan gaya hidup mereka. Selalu ramah, profesional, dan memberikan rekomendasi yang personal. Gunakan bahasa Indonesia yang santai tapi sopan.`,
  },
  {
    id: "chat",
    title: "Chat Prompt",
    description: "Prompt untuk percakapan umum dengan pelanggan",
    value: `Ketika pelanggan bertanya tentang layanan, harga, atau jadwal, berikan informasi yang akurat berdasarkan data yang tersedia. Jika tidak yakin, arahkan pelanggan untuk menghubungi cabang terdekat. Selalu tawarkan untuk membantu booking atau konsultasi gaya rambut.`,
  },
  {
    id: "recommendation",
    title: "Recommendation Prompt",
    description: "Prompt untuk rekomendasi gaya rambut AI",
    value: `Analisis bentuk wajah pelanggan dari foto yang diberikan. Identifikasi bentuk wajah (oval, round, square, heart, oblong). Berdasarkan bentuk wajah, berikan 3-5 rekomendasi gaya rambut yang cocok beserta alasannya. Pertimbangkan juga tekstur rambut, tingkat maintenance, dan gaya hidup pelanggan. Format output: nama gaya rambut, skor kesesuaian (1-100), dan penjelasan singkat.`,
  },
  {
    id: "image-editing",
    title: "Image Editing Prompt",
    description: "Prompt untuk virtual try-on / preview gaya rambut",
    value: `Generate a realistic preview of the selected hairstyle applied to the customer's photo. Maintain the customer's facial features, skin tone, and overall appearance. Only modify the hair to match the selected hairstyle. Ensure natural blending between the new hairstyle and the face. Output should be photorealistic and high quality.`,
  },
]

export default function AIPromptsPage() {
  const [prompts, setPrompts] = useState(initialPrompts)

  const updatePrompt = (id: string, value: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Prompts</h1>
        <p className="text-sm text-muted-foreground">Kelola prompt AI tanpa deploy ulang</p>
      </div>

      <div className="flex items-center gap-2 rounded-[14px] border border-primary/30 bg-primary/5 p-3 text-sm">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <span className="text-muted-foreground">Perubahan berlaku tanpa deploy ulang. Pastikan prompt sudah benar sebelum menyimpan.</span>
      </div>

      <div className="grid gap-4">
        {prompts.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{p.id}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={p.value}
                onChange={(e) => updatePrompt(p.id, e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </CardContent>
            <CardFooter>
              <Button size="sm">
                <Save className="mr-2 h-3.5 w-3.5" />Simpan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
