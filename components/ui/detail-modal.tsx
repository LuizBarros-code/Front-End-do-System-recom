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

  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true)
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados simulados com base no tipo de item
        let mockDetails: ItemDetails = {
          id: itemId,
          status: "PENDING",
        }

        switch (itemType) {
          case "project":
            mockDetails = {
              ...mockDetails,
              name: "Doação para Projeto Educacional",
              description: "Doação de equipamentos para laboratório de informática em escola pública",
              date: "2023-05-15",
              contact: "contato@empresa.com | (11) 98765-4321",
              requester: "Escola Municipal São José",
              items: "5 computadores desktop, 2 impressoras, 10 teclados e mouses",
              additionalInfo:
                "Equipamentos serão utilizados para montar um laboratório de informática para alunos do ensino fundamental.",
            }
            break
          case "user":
            mockDetails = {
              ...mockDetails,
              name: "Doação de Usuário",
              description: "Doação de laptop e periféricos",
              date: "2023-05-10",
              contact: "usuario@email.com | (11) 91234-5678",
              items: "1 laptop Dell, 1 teclado, 1 mouse, 1 monitor",
              condition: "Usado - Bom estado",
              additionalInfo: "Equipamentos em bom estado de conservação, laptop precisa de nova bateria.",
            }
            break
          case "request":
            mockDetails = {
              ...mockDetails,
              name: "Solicitação de Equipamentos",
              description: "Solicitação de computadores para ONG",
              date: "2023-05-08",
              contact: "ong@email.org | (11) 97654-3210",
              requester: "ONG Educação para Todos",
              items: "3 computadores desktop completos",
              additionalInfo:
                "Equipamentos serão utilizados para aulas de informática básica para jovens em situação de vulnerabilidade.",
            }
            break
          case "disposal":
            mockDetails = {
              ...mockDetails,
              name: "Descarte de Equipamentos",
              description: "Lote de equipamentos obsoletos",
              date: "2023-05-05",
              items: "10 monitores CRT, 15 teclados antigos, 8 gabinetes",
              quantity: 33,
              additionalInfo: "Equipamentos sem possibilidade de recuperação, destinados à reciclagem especializada.",
            }
            break
          case "electronic":
            mockDetails = {
              ...mockDetails,
              name: electronicType === "notebook" ? "Notebook Dell Latitude E6440" : "Monitor LG 24 polegadas",
              description:
                electronicType === "notebook" ? "Notebook corporativo com processador Intel i5" : "Monitor LED Full HD",
              serialNumber: electronicType === "notebook" ? "DL7890123" : "LG1234567",
              model: electronicType === "notebook" ? "Latitude E6440" : "24MP55",
              condition: electronicType === "notebook" ? "Funcional - Bateria fraca" : "Funcional - Perfeito",
              date: "2023-04-28",
              additionalInfo:
                electronicType === "notebook"
                  ? "Equipamento em bom estado, necessita apenas de nova bateria. Acompanha carregador original."
                  : "Monitor sem riscos ou dead pixels, acompanha cabo de alimentação e cabo HDMI.",
              status: "APPROVED",
            }
            break
        }

        setDetails(mockDetails)
        setNewStatus(mockDetails.status || "PENDING")
        setLoading(false)
      }, 1000)
    }
  }, [isOpen, itemId, itemType, electronicType])

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

              <div>
                <Label htmlFor="feedback">Feedback / Observações</Label>
                <Textarea
                  id="feedback"
                  placeholder="Adicione um feedback ou observações sobre este item"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
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

