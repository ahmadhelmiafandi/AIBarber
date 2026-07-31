"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"

const initialPosts = [
  { id: 1, title: "Tips Merawat Rambut Pria Agar Tetap Sehat", slug: "tips-merawat-rambut-pria", status: "Published", date: "2026-07-25" },
  { id: 2, title: "5 Gaya Rambut Trending 2026", slug: "5-gaya-rambut-trending-2026", status: "Published", date: "2026-07-20" },
  { id: 3, title: "Panduan Memilih Barbershop yang Tepat", slug: "panduan-memilih-barbershop", status: "Draft", date: "2026-07-28" },
]

export default function BlogPage() {
  const [posts] = useState(initialPosts)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">Kelola artikel blog</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tulis Artikel
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{p.slug}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Published" ? "success" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>{p.date}</TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tulis Artikel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Judul</Label>
              <Input placeholder="Judul artikel" />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input placeholder="judul-artikel" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select>
                <SelectOption value="draft">Draft</SelectOption>
                <SelectOption value="published">Published</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Konten</Label>
              <Textarea placeholder="Tulis konten artikel..." className="min-h-[200px]" />
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
