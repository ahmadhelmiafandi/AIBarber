"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Phone, SkipForward, XCircle, ArrowUp, Plus } from "lucide-react"

type QueueStatus = "Dilayani" | "Menunggu" | "Dipanggil"

const initialQueue = [
  { id: 1, number: "A-002", customer: "Budi Santoso", barber: "Gilang Pratama", service: "Hair Wash + Haircut", status: "Dilayani" as QueueStatus, waitTime: "0 min" },
  { id: 2, number: "A-003", customer: "Chandra Wijaya", barber: "Hendra Kurniawan", service: "Beard Trim", status: "Dipanggil" as QueueStatus, waitTime: "2 min" },
  { id: 3, number: "A-004", customer: "Dimas Pratama", barber: "Rafi Adriansyah", service: "Hair Coloring", status: "Menunggu" as QueueStatus, waitTime: "15 min" },
  { id: 4, number: "A-005", customer: "Eko Saputra", barber: "Gilang Pratama", service: "Haircut", status: "Menunggu" as QueueStatus, waitTime: "25 min" },
  { id: 5, number: "A-006", customer: "Fajar Nugroho", barber: "-", service: "Haircut", status: "Menunggu" as QueueStatus, waitTime: "35 min" },
  { id: 6, number: "A-007", customer: "Gunawan", barber: "-", service: "Beard Trim", status: "Menunggu" as QueueStatus, waitTime: "40 min" },
]

const statusStyle: Record<QueueStatus, string> = {
  "Dilayani": "bg-success/10 border-success/30 text-success",
  "Dipanggil": "bg-primary/10 border-primary/30 text-primary",
  "Menunggu": "bg-muted border-border text-muted-foreground",
}

export default function QueuesPage() {
  const [queue] = useState(initialQueue)
  const [dialogOpen, setDialogOpen] = useState(false)

  const serving = queue.filter((q) => q.status === "Dilayani")
  const called = queue.filter((q) => q.status === "Dipanggil")
  const waiting = queue.filter((q) => q.status === "Menunggu")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Antrian</h1>
          <p className="text-sm text-muted-foreground">Manajemen antrian real-time</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Tambah Manual
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-success/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-success">Sedang Dilayani</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {serving.map((q) => (
              <div key={q.id} className={`rounded-[14px] border p-4 ${statusStyle[q.status]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono">{q.number}</span>
                  <Badge variant="success">Dilayani</Badge>
                </div>
                <p className="mt-1 text-sm font-medium">{q.customer}</p>
                <p className="text-xs opacity-80">{q.barber} • {q.service}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary">Dipanggil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {called.map((q) => (
              <div key={q.id} className={`rounded-[14px] border p-4 ${statusStyle[q.status]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono">{q.number}</span>
                  <Badge>Dipanggil</Badge>
                </div>
                <p className="mt-1 text-sm font-medium">{q.customer}</p>
                <p className="text-xs opacity-80">{q.barber} • {q.service}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu ({waiting.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {waiting.map((q) => (
              <div key={q.id} className={`rounded-[14px] border p-4 ${statusStyle[q.status]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono">{q.number}</span>
                  <span className="text-xs">~{q.waitTime}</span>
                </div>
                <p className="mt-1 text-sm font-medium">{q.customer}</p>
                <p className="text-xs opacity-80">{q.barber === "-" ? "Belum ditentukan" : q.barber} • {q.service}</p>
                <div className="mt-3 pt-2.5 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 justify-center">
                    <Phone className="mr-1 h-3 w-3 shrink-0" />
                    <span>Panggil</span>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 justify-center">
                    <SkipForward className="mr-1 h-3 w-3 shrink-0" />
                    <span>Lewati</span>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 justify-center text-destructive hover:text-destructive">
                    <XCircle className="mr-1 h-3 w-3 shrink-0" />
                    <span>Batal</span>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 justify-center">
                    <ArrowUp className="mr-1 h-3 w-3 shrink-0" />
                    <span>Prioritas</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Antrian Manual</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Customer</Label>
              <Input placeholder="Nama customer" />
            </div>
            <div className="grid gap-2">
              <Label>Layanan</Label>
              <Select>
                <SelectOption value="">Pilih layanan</SelectOption>
                <SelectOption value="haircut">Haircut</SelectOption>
                <SelectOption value="hairwash">Hair Wash</SelectOption>
                <SelectOption value="beardtrim">Beard Trim</SelectOption>
                <SelectOption value="coloring">Hair Coloring</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Barber (opsional)</Label>
              <Select>
                <SelectOption value="">Auto-assign</SelectOption>
                <SelectOption value="rafi">Rafi Adriansyah</SelectOption>
                <SelectOption value="gilang">Gilang Pratama</SelectOption>
                <SelectOption value="hendra">Hendra Kurniawan</SelectOption>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setDialogOpen(false)}>Tambah ke Antrian</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
