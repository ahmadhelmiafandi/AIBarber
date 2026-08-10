"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Phone, SkipForward, XCircle, ArrowUp, Plus, Loader2, RefreshCw, Layers } from "lucide-react"
import { useAdminBranches, useAdminBranchQueues } from "@/hooks/use-admin"
import { Queue } from "@/types/api"

export default function QueuesPage() {
  const { data: branches = [], isLoading: isLoadingBranches } = useAdminBranches()
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id)
    }
  }, [branches, selectedBranchId])

  const { data: queues = [], isLoading: isLoadingQueues, refetch } = useAdminBranchQueues(selectedBranchId)

  // Categorize queues by status from real API data
  const serving = queues.filter((q) => q.status === "on_service")
  const called = queues.filter((q) => q.status === "called" || q.status === "checked_in")
  const waiting = queues.filter((q) => q.status === "waiting")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Antrean</h1>
          <p className="text-sm text-muted-foreground">Manajemen antrian real-time cabang barbershop</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Selector */}
          <Select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-48 text-xs h-9"
          >
            {branches.map((b) => (
              <SelectOption key={b.id} value={b.id}>
                {b.name}
              </SelectOption>
            ))}
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Button onClick={() => setDialogOpen(true)} className="h-9">
            <Plus className="mr-1.5 h-4 w-4" />Tambah Manual
          </Button>
        </div>
      </div>

      {isLoadingBranches || isLoadingQueues ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            Memuat data antrean real-time...
          </CardContent>
        </Card>
      ) : queues.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Layers className="h-10 w-10 mb-3 opacity-40 text-primary" />
            <h3 className="font-semibold text-foreground text-base">Belum Ada Antrean Aktif</h3>
            <p className="text-xs max-w-sm mt-1">
              Saat ini belum ada pelanggan yang melakukan booking atau mengambil antrean di cabang ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Sedang Dilayani */}
          <Card className="border-success/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success flex items-center justify-between">
                <span>Sedang Dilayani</span>
                <Badge variant="success" className="font-mono">{serving.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serving.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada yang sedang dilayani</p>
              ) : (
                serving.map((q) => (
                  <div key={q.queue_id || q.booking_id} className="rounded-[14px] border p-4 bg-success/10 border-success/30 text-success space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold font-mono">{q.queue_code || `A-${q.queue_number}`}</span>
                      <Badge variant="success">Dilayani</Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {q.booking?.customer?.name || "Pelanggan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {q.booking?.barber?.user?.name || "Barber"} • {q.booking?.service?.name || "Layanan"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Dipanggil */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-primary flex items-center justify-between">
                <span>Dipanggil / Checked In</span>
                <Badge className="font-mono">{called.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {called.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada yang dipanggil</p>
              ) : (
                called.map((q) => (
                  <div key={q.queue_id || q.booking_id} className="rounded-[14px] border p-4 bg-primary/10 border-primary/30 text-primary space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold font-mono">{q.queue_code || `A-${q.queue_number}`}</span>
                      <Badge>Dipanggil</Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {q.booking?.customer?.name || "Pelanggan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {q.booking?.barber?.user?.name || "Barber"} • {q.booking?.service?.name || "Layanan"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Menunggu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Menunggu ({waiting.length})</span>
                <Badge variant="outline" className="font-mono">{waiting.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {waiting.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada antrean menunggu</p>
              ) : (
                waiting.map((q) => (
                  <div key={q.queue_id || q.booking_id} className="rounded-[14px] border p-4 bg-card space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold font-mono">{q.queue_code || `A-${q.queue_number}`}</span>
                      <span className="text-xs text-muted-foreground">
                        {q.estimated_start_time ? q.estimated_start_time.substring(11, 16) : "~15 min"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {q.booking?.customer?.name || "Pelanggan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {q.booking?.barber?.user?.name || "Belum ditentukan"} • {q.booking?.service?.name || "Layanan"}
                    </p>

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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Queue Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Antrean Manual</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setDialogOpen(false)}>Tambah ke Antrean</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
