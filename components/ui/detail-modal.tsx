"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Mail, FileText, Tag, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: number
  itemType: "project" | "user" | "request" | "disposal" | "electronic"
  electronicType?: string
}

interface ItemDetails {
  id: number
  name?: string
  description?: string
  status?: string
  date?: string
  contact?: string
  additionalInfo?: string
  requester?: string
  items?: string
  quantity?: number
  condition?: string
  serialNumber?: string
  model?: string
  [key: string]: any
}

export function DetailModal({ isOpen, onClose, itemId, itemType, electronicType }: DetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<ItemDetails | null>(null)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [dataParaPegar, setDataParaPegar] = useState("")
  const [horarioParaPegar, setHorarioParaPegar] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen && itemId && itemType === "request") {
      setLoading(true)
      fetch(`http://26.99.103.209:3456/solicitacoes/${itemId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Erro ao buscar detalhes da solicitação")
          const data = await res.json()
          setDetails(data)
          setNewStatus(data.status || "pendente")
          setDataParaPegar(data.dataparapegar ? data.dataparapegar.split("T")[0] : "")
          setHorarioParaPegar(data.horarioparapegar || "")
        })
        .catch(() => setDetails(null))
        .finally(() => setLoading(false))
    }
  }, [isOpen, itemId, itemType])

  const handleSave = async () => {
    if (!details) return
    setSaving(true)
    setError("")
    try {
      const payload = {
        ...details,
        status: newStatus,
        dataparapegar: dataParaPegar || null,
        horarioparapegar: horarioParaPegar || null,
      }
      const res = await fetch(`http://26.99.103.209:3456/solicitacoes/${details.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Erro ao salvar alterações")
      onClose()
    } catch (e: any) {
      setError(e.message || "Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Rejeitado" },
      NEW: { variant: "secondary", label: "Novo" },
      IN_PROGRESS: { variant: "default", label: "Em Andamento" },
    }
    const statusInfo = variants[status as keyof typeof variants] || variants.PENDING
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleStatusChange = () => {
    // Simulação de atualização de status
    console.log(`Atualizando status do item ${itemId} para ${newStatus}`)
    console.log(`Feedback: ${feedback}`)

    // Atualiza o status no objeto de detalhes
    if (details) {
      setDetails({
        ...details,
        status: newStatus,
      })
    }

    // Fecha o modal após um breve delay para mostrar a atualização
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string | number | undefined) => {
    if (!value) return null
    return (
      <div className="flex items-start gap-2 mb-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-sm text-muted-foreground">{value}</div>
        </div>
      </div>
    )
  }

  if (itemType === "request") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>ID: #{details?.id}</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="py-8 text-center">Carregando detalhes...</div>
          ) : details ? (
            <div className="space-y-4 mt-2">
              <div><strong>Nome:</strong> {details.name}</div>
              <div><strong>Eletrônicos:</strong> {details.eletronicos}</div>
              <div><strong>Descrição:</strong> {details.descricao}</div>
              <div><strong>Informações:</strong> {details.informacoes}</div>
              <div><strong>Contato:</strong> {details.contato}</div>
              <div><strong>Status:</strong> 
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Data para pegar</Label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 w-full"
                    value={dataParaPegar || ""}
                    onChange={e => setDataParaPegar(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Horário para pegar</Label>
                  <input
                    type="time"
                    className="border rounded px-2 py-1 w-full"
                    value={horarioParaPegar || ""}
                    onChange={e => setHorarioParaPegar(e.target.value)}
                  />
                </div>
              </div>
              <div><strong>Criado em:</strong> {details.createdAt ? new Date(details.createdAt).toLocaleDateString() : "-"}</div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Alterações"}</Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">Nenhum detalhe encontrado para esta solicitação.</div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{details.name || `Detalhes do ${itemType}`}</DialogTitle>
                {details.status && getStatusBadge(details.status)}
              </div>
              <DialogDescription>
                ID: #{details.id} |{" "}
                {itemType === "electronic"
                  ? "Eletrônico"
                  : itemType === "project"
                    ? "Doação para Projeto"
                    : itemType === "user"
                      ? "Doação de Usuário"
                      : itemType === "request"
                        ? "Solicitação"
                        : "Descarte"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {renderDetailItem(
                <FileText className="h-4 w-4 text-muted-foreground" />,
                "Descrição",
                details.description,
              )}
              {renderDetailItem(
                <Calendar className="h-4 w-4 text-muted-foreground" />,
                "Data",
                details.date ? new Date(details.date).toLocaleDateString() : undefined,
              )}
              {renderDetailItem(<User className="h-4 w-4 text-muted-foreground" />, "Solicitante", details.requester)}
              {renderDetailItem(<Mail className="h-4 w-4 text-muted-foreground" />, "Contato", details.contact)}
              {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Itens", details.items)}
              {renderDetailItem(<Info className="h-4 w-4 text-muted-foreground" />, "Condição", details.condition)}
              {itemType === "electronic" && (
                <>
                  {renderDetailItem(
                    <Tag className="h-4 w-4 text-muted-foreground" />,
                    "Número de Série",
                    details.serialNumber,
                  )}
                  {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Modelo", details.model)}
                </>
              )}
              {renderDetailItem(
                <Info className="h-4 w-4 text-muted-foreground" />,
                "Informações Adicionais",
                details.additionalInfo,
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Atualizar Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleStatusChange}>Salvar Alterações</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">Nenhum detalhe encontrado para este item.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

