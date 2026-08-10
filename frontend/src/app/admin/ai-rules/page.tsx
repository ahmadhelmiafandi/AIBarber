"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Loader2 } from "lucide-react"
import { useAdminAiRules, useCreateAiRuleMutation } from "@/hooks/use-admin"

const initialRulesFallback = [
  { id: "1", faceShape: "Round", hairstyles: "French Crop, Textured Crop, Quiff", scoreBoost: 30 },
  { id: "2", faceShape: "Oval", hairstyles: "Pompadour, Undercut, Side Part", scoreBoost: 25 },
  { id: "3", faceShape: "Square", hairstyles: "Buzz Cut, Crew Cut, Ivy League", scoreBoost: 20 },
  { id: "4", faceShape: "Heart", hairstyles: "Undercut, Fringe, Medium Length", scoreBoost: 25 },
  { id: "5", faceShape: "Oblong", hairstyles: "Mullet, Side Part, Curtain Bangs", scoreBoost: 20 },
]

export default function AIRulesPage() {
  const { data: apiRules, isLoading } = useAdminAiRules()
  const createRuleMutation = useCreateAiRuleMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [faceShape, setFaceShape] = useState("")
  const [ruleName, setRuleName] = useState("")
  const [scoreBoost, setScoreBoost] = useState("25")

  const rulesList = apiRules && apiRules.length > 0
    ? apiRules.map((r) => ({
        id: r.id,
        faceShape: r.face_shape || r.rule_name || "General",
        hairstyles: r.hairstyle?.name || "Rekomendasi Utama",
        scoreBoost: r.score_modifier || 25,
      }))
    : initialRulesFallback

  const handleSaveRule = async () => {
    if (!ruleName && !faceShape) return
    try {
      await createRuleMutation.mutateAsync({
        rule_name: ruleName || `Rule ${faceShape}`,
        face_shape: faceShape,
        score_modifier: parseInt(scoreBoost) || 25,
      })
      setDialogOpen(false)
      setRuleName("")
      setFaceShape("")
    } catch {
      setDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Rules</h1>
          <p className="text-sm text-muted-foreground">Mapping bentuk wajah ke rekomendasi gaya rambut</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Rule
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bentuk Wajah / Rule</TableHead>
                  <TableHead>Rekomendasi Hairstyle</TableHead>
                  <TableHead>Score Boost</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesList.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.faceShape}</TableCell>
                    <TableCell className="text-muted-foreground">{r.hairstyles}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">+{r.scoreBoost}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah AI Rule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Aturan</Label>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="misal: Rule Round Face French Crop"
              />
            </div>
            <div className="grid gap-2">
              <Label>Bentuk Wajah</Label>
              <Input
                value={faceShape}
                onChange={(e) => setFaceShape(e.target.value)}
                placeholder="Round, Oval, Square, dll"
              />
            </div>
            <div className="grid gap-2">
              <Label>Score Boost</Label>
              <Input
                type="number"
                value={scoreBoost}
                onChange={(e) => setScoreBoost(e.target.value)}
                placeholder="25"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button disabled={createRuleMutation.isPending} onClick={handleSaveRule}>
              {createRuleMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
