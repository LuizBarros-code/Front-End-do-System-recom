"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText, Tag, Package, Info, Truck, Recycle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DisposalDetailModalProps {
  isOpen: boolean
  onClose: () => void
  disposalId: number
}

interface DisposalDetails {
  id: number
  description: string
  items: string
  quantity: number
  weight?: string
  disposalMethod: string
  destination: string
  responsiblePerson: string
  additionalInfo?: string
  disposalDate: string
  scheduledDate?: string
  status: string
}

export function DisposalDetailModal({ isOpen, onClose, disposalId }: DisposalDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<DisposalDetails | null>(null)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (isOpen && disposalId) {
      setLoading(true)
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados simulados de descarte
        const mockDetails: DisposalDetails = {
          id: disposalId,
          description: [
            "Lote de equipamentos obsoletos (monitores CRT, teclados antigos)",
            "Baterias e componentes com metais pesados",
            "Placas-mãe danificadas e componentes eletrônicos diversos",
            "Equipamentos com danos irreparáveis (impressoras, scanners)",
            "Cabos, fontes de alimentação e periféricos diversos",
          ][disposalId % 5],
          items: [
            "Monitores CRT, teclados antigos, gabinetes",
            "Baterias, pilhas, componentes com chumbo",
            "Placas-mãe, processadores, memórias",
            "Impressoras, scanners, faxes",
            "Cabos, fontes de alimentação, periféricos",
          ][disposalId % 5],
          quantity: 8 + (disposalId % 20),
          weight: 5 + (disposalId % 15) + " kg",
          disposalMethod: [
            "Reciclagem especializada",
            "Descarte ecológico",
            "Reciclagem de componentes",
            "Separação de materiais",
            "Processamento industrial",
          ][disposalId % 5],
          destination: [
            "Reciclagem Tecnológica SA",
            "EcoDescarte Ltda",
            "Reciclagem Tecnológica SA",
            "EcoDescarte Ltda",
            "Reciclagem Tecnológica SA",
          ][disposalId % 5],
          responsiblePerson: ["Ana Silva", "Carlos Mendes", "Pedro Santos", "Mariana Costa", "Lucas Oliveira"][
            disposalId % 5
          ],
          additionalInfo:
            "Todos os itens foram devidamente catalogados e preparados para descarte conforme normas ambientais.",
          disposalDate: new Date(2023, 4, 10 + disposalId).toISOString(),
          scheduledDate: new Date(2023, 4, 5 + disposalId).toISOString(),
          status: ["Concluído", "Agendado", "Em processamento", "Concluído", "Agendado"][disposalId % 5],
        }

        setDetails(mockDetails)
        setNewStatus(mockDetails.status)
        setLoading(false)
      }, 1000)
    }
  }, [isOpen, disposalId])

  const getStatusBadge = (status: string) => {
    const variants = {
      Concluído: { variant: "success", label: "Concluído" },
      Agendado: { variant: "outline", label: "Agendado" },
      "Em processamento": { variant: "default", label: "Em processamento" },
    }
    const statusInfo = variants[status as keyof typeof variants] || { variant: "default", label: status }
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleStatusChange = () => {
    // Simulação de atualização de status
    console.log(`Atualizando status do descarte ${disposalId} para ${newStatus}`)
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes do descarte...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>Detalhes do Descarte</DialogTitle>
                {details.status && getStatusBadge(details.status)}
              </div>
              <DialogDescription>
                ID: #{details.id} | Data: {new Date(details.disposalDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Informações Básicas</h3>
                {renderDetailItem(
                  <FileText className="h-4 w-4 text-muted-foreground" />,
                  "Descrição",
                  details.description,
                )}
                {renderDetailItem(<Package className="h-4 w-4 text-muted-foreground" />, "Itens", details.items)}
                {renderDetailItem(
                  <Tag className="h-4 w-4 text-muted-foreground" />,
                  "Quantidade",
                  details.quantity + " itens",
                )}
                {details.weight &&
                  renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Peso Total", details.weight)}
                {renderDetailItem(
                  <Calendar className="h-4 w-4 text-muted-foreground" />,
                  "Data do Descarte",
                  new Date(details.disposalDate).toLocaleDateString(),
                )}
                {details.scheduledDate &&
                  renderDetailItem(
                    <Calendar className="h-4 w-4 text-muted-foreground" />,
                    "Data Agendada",
                    new Date(details.scheduledDate).toLocaleDateString(),
                  )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Detalhes do Processo</h3>
                {renderDetailItem(
                  <Recycle className="h-4 w-4 text-muted-foreground" />,
                  "Método de Descarte",
                  details.disposalMethod,
                )}
                {renderDetailItem(<Truck className="h-4 w-4 text-muted-foreground" />, "Destino", details.destination)}
                {renderDetailItem(
                  <User className="h-4 w-4 text-muted-foreground" />,
                  "Responsável",
                  details.responsiblePerson,
                )}
                {details.additionalInfo &&
                  renderDetailItem(
                    <Info className="h-4 w-4 text-muted-foreground" />,
                    "Informações Adicionais",
                    details.additionalInfo,
                  )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Atualizar Status</h3>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agendado">Agendado</SelectItem>
                    <SelectItem value="Em processamento">Em processamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Feedback / Observações</h3>
                <Textarea
                  placeholder="Adicione um feedback ou observações sobre este descarte"
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
          <div className="py-8 text-center">Nenhum detalhe encontrado para este descarte.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

