"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Save, Info, Loader2 } from "lucide-react"
import { useAdminAiPrompts, useSaveAiPromptMutation } from "@/hooks/use-admin"

const defaultPromptsFallback = [
  {
    id: "system_consultant",
    key: "system_consultant",
    title: "System Consultant Prompt",
    description: "Prompt utama untuk persona AI barbershop",
    value: `Kamu adalah AI Smart Barbershop Assistant. Kamu membantu pelanggan memilih gaya rambut yang cocok berdasarkan bentuk wajah, preferensi, dan gaya hidup mereka.`,
  },
  {
    id: "recommendation_reason",
    key: "recommendation_reason",
    title: "Recommendation Reason Prompt",
    description: "Prompt untuk rekomendasi alasan penyesuaian gaya rambut",
    value: `Generate a concise 1-2 sentence recommendation reason in Indonesian explaining why the haircut suits a customer...`,
  },
]

export default function AIPromptsPage() {
  const { data: apiPrompts, isLoading } = useAdminAiPrompts()
  const savePromptMutation = useSaveAiPromptMutation()
  const [promptsMap, setPromptsMap] = useState<Record<string, string>>({})

  useEffect(() => {
    if (apiPrompts && apiPrompts.length > 0) {
      const map: Record<string, string> = {}
      apiPrompts.forEach((p) => {
        map[p.key] = p.prompt_text
      })
      setPromptsMap(map)
    }
  }, [apiPrompts])

  const handleSave = async (key: string, name: string) => {
    const text = promptsMap[key] || ""
    if (!text) return
    await savePromptMutation.mutateAsync({ key, name, prompt_text: text })
  }

  const promptItems = apiPrompts && apiPrompts.length > 0
    ? apiPrompts.map((p) => ({
        id: p.id,
        key: p.key,
        title: p.name,
        description: `CMS Prompt untuk ${p.key}`,
        value: promptsMap[p.key] ?? p.prompt_text,
      }))
    : defaultPromptsFallback.map((p) => ({
        ...p,
        value: promptsMap[p.key] ?? p.value,
      }))

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

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {promptItems.map((p) => (
            <Card key={p.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.key}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={p.value}
                  onChange={(e) => setPromptsMap((prev) => ({ ...prev, [p.key]: e.target.value }))}
                  className="min-h-[120px] font-mono text-sm"
                />
              </CardContent>
              <CardFooter>
                <Button
                  size="sm"
                  disabled={savePromptMutation.isPending}
                  onClick={() => handleSave(p.key, p.title)}
                >
                  <Save className="mr-2 h-3.5 w-3.5" />
                  {savePromptMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
