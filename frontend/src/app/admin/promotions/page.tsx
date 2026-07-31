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
import { Plus, Pencil } from "lucide-react"

const initialPromos = [
  { id: 1, name: "Grand Opening Diskon 30%", discount: "30%", expiry: "2026-08-31", status: "Aktif", banner: "🎉" },
  { id: 2, name: "Member Gold Free Hair Wash", discount: "100% Hair Wash", expiry: "2026-12-31", status: "Aktif", banner: "👑" },
  { id: 3, name: "Promo Weekday 20%", discount: "20%", expiry: "2026-09-30", status: "Nonaktif", banner: "📅" },
]

export default function PromotionsPage() {
  const [promos] = useState(initialPromos)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-sm text-muted-foreground">Kelola promo dan diskon</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Promo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Nama Promo</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Berlaku Sampai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-muted text-lg">
                      {p.banner}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline">{p.discount}</Badge></TableCell>
                  <TableCell>{p.expiry}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Aktif" ? "success" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Promo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Promo</Label>
              <Input placeholder="Nama promosi" />
            </div>
            <div className="grid gap-2">
              <Label>Diskon</Label>
              <Input placeholder="30% atau deskripsi diskon" />
            </div>
            <div className="grid gap-2">
              <Label>Berlaku Sampai</Label>
              <Input type="date" />
            </div>
            <div className="grid gap-2">
              <Label>Banner URL</Label>
              <Input placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
