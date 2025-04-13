"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Tag, Info, Cpu, HardDrive, Monitor, Printer, Smartphone, Laptop } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ElectronicDetailModalProps {
  isOpen: boolean
  onClose: () => void
  electronicId: number
  electronicType?: string
}

interface ElectronicDetails {
  id: number
  name: string
  type: string
  serialNumber: string
  model: string
  brand: string
  condition: string
  origin: string
  receivedDate: string
  specifications?: string
  additionalInfo?: string
  status: string
  image?: string
}

export function ElectronicDetailModal({ isOpen, onClose, electronicId, electronicType }: ElectronicDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<ElectronicDetails | null>(null)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (isOpen && electronicId) {
      setLoading(true)
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados simulados com base no tipo de eletrônico
        const type = electronicType || ["notebook", "monitor", "desktop", "impressora", "tablet"][electronicId % 5]

        const mockDetails: ElectronicDetails = {
          id: electronicId,
          name:
            type === "notebook"
              ? "Laptop Dell Latitude E6440"
              : type === "monitor"
                ? 'Monitor LG 24" LED'
                : type === "desktop"
                  ? "Desktop HP EliteDesk 800"
                  : type === "impressora"
                    ? "Impressora Brother MFC-L2740DW"
                    : "Tablet Samsung Galaxy Tab A",
          type: type,
          serialNumber:
            type === "notebook"
              ? "DL7890123"
              : type === "monitor"
                ? "LG1234567"
                : type === "desktop"
                  ? "HP4567890"
                  : type === "impressora"
                    ? "BR7654321"
                    : "SM9876543",
          model:
            type === "notebook"
              ? "Latitude E6440"
              : type === "monitor"
                ? "24MP55"
                : type === "desktop"
                  ? "EliteDesk 800 G1"
                  : type === "impressora"
                    ? "MFC-L2740DW"
                    : "Galaxy Tab A 10.1",
          brand:
            type === "notebook"
              ? "Dell"
              : type === "monitor"
                ? "LG"
                : type === "desktop"
                  ? "HP"
                  : type === "impressora"
                    ? "Brother"
                    : "Samsung",
          condition:
            type === "notebook"
              ? "Funcional - Bateria fraca"
              : type === "monitor"
                ? "Funcional - Perfeito"
                : type === "desktop"
                  ? "Funcional - Completo"
                  : type === "impressora"
                    ? "Necessita reparo - Sem toner"
                    : "Funcional - Tela trincada",
          origin: [
            "Doação - Empresa XYZ",
            "Doação - Carlos Eduardo",
            "Doação - Instituto Tecnologia",
            "Doação - Escola Municipal",
            "Doação - Ana Beatriz",
          ][electronicId % 5],
          receivedDate: new Date(2023, 3, 25 + electronicId).toISOString(),
          specifications:
            type === "notebook"
              ? "Intel Core i5-4300M, 8GB RAM, 256GB SSD, Windows 10 Pro"
              : type === "monitor"
                ? "24 polegadas, Full HD (1920x1080), 60Hz, IPS"
                : type === "desktop"
                  ? "Intel Core i7-4770, 16GB RAM, 500GB HDD, Windows 10 Pro"
                  : type === "impressora"
                    ? "Multifuncional Laser, Wi-Fi, Duplex"
                    : "10.1 polegadas, 32GB, Android 9.0",
          additionalInfo:
            type === "notebook"
              ? "Equipamento em bom estado, necessita apenas de nova bateria. Acompanha carregador original."
              : type === "monitor"
                ? "Monitor sem riscos ou dead pixels, acompanha cabo de alimentação e cabo HDMI."
                : type === "desktop"
                  ? "Computador completo com teclado, mouse e monitor. Necessita apenas de limpeza interna."
                  : type === "impressora"
                    ? "Impressora em bom estado, necessita apenas de novo toner. Acompanha cabo USB."
                    : "Tablet com pequena trinca no canto superior direito, não afeta o funcionamento. Acompanha carregador.",
          status: ["Disponível", "Reservado", "Em manutenção", "Em avaliação", "Disponível"][electronicId % 5],
          image: "/placeholder.svg?height=200&width=200",
        }

        setDetails(mockDetails)
        setNewStatus(mockDetails.status)
        setLoading(false)
      }, 1000)
    }
  }, [isOpen, electronicId, electronicType])

  const getStatusBadge = (status: string) => {
    const variants = {
      Disponível: { variant: "success", label: "Disponível" },
      Reservado: { variant: "outline", label: "Reservado" },
      "Em manutenção": { variant: "default", label: "Em manutenção" },
      "Em avaliação": { variant: "default", label: "Em avaliação" },
      "Para descarte": { variant: "destructive", label: "Para descarte" },
    }
    const statusInfo = variants[status as keyof typeof variants] || { variant: "default", label: status }
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "notebook":
        return <Laptop className="h-4 w-4 text-muted-foreground" />
      case "monitor":
        return <Monitor className="h-4 w-4 text-muted-foreground" />
      case "desktop":
        return <Cpu className="h-4 w-4 text-muted-foreground" />
      case "impressora":
        return <Printer className="h-4 w-4 text-muted-foreground" />
      case "tablet":
        return <Smartphone className="h-4 w-4 text-muted-foreground" />
      default:
        return <HardDrive className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleStatusChange = () => {
    // Simulação de atualização de status
    console.log(`Atualizando status do eletrônico ${electronicId} para ${newStatus}`)
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
          <div className="py-8 text-center">Carregando detalhes do eletrônico...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{details.name}</DialogTitle>
                {details.status && getStatusBadge(details.status)}
              </div>
              <DialogDescription>
                ID: #{details.id} | Tipo: {details.type.charAt(0).toUpperCase() + details.type.slice(1)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  {details.image && (
                    <img
                      src={details.image || "/placeholder.svg"}
                      alt={details.name}
                      className="max-h-[200px] object-contain border rounded-md p-2"
                    />
                  )}
                </div>

                <h3 className="text-sm font-medium">Informações Básicas</h3>
                {renderDetailItem(
                  getTypeIcon(details.type),
                  "Tipo",
                  details.type.charAt(0).toUpperCase() + details.type.slice(1),
                )}
                {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Marca", details.brand)}
                {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Modelo", details.model)}
                {renderDetailItem(
                  <Tag className="h-4 w-4 text-muted-foreground" />,
                  "Número de Série",
                  details.serialNumber,
                )}
                {renderDetailItem(
                  <Calendar className="h-4 w-4 text-muted-foreground" />,
                  "Data de Recebimento",
                  new Date(details.receivedDate).toLocaleDateString(),
                )}
                {renderDetailItem(<Info className="h-4 w-4 text-muted-foreground" />, "Origem", details.origin)}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Detalhes Técnicos</h3>
                {renderDetailItem(<Info className="h-4 w-4 text-muted-foreground" />, "Condição", details.condition)}
                {details.specifications &&
                  renderDetailItem(
                    <Cpu className="h-4 w-4 text-muted-foreground" />,
                    "Especificações",
                    details.specifications,
                  )}
                {details.additionalInfo &&
                  renderDetailItem(
                    <FileText className="h-4 w-4 text-muted-foreground" />,
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
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Reservado">Reservado</SelectItem>
                    <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                    <SelectItem value="Em avaliação">Em avaliação</SelectItem>
                    <SelectItem value="Para descarte">Para descarte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Feedback / Observações</h3>
                <Textarea
                  placeholder="Adicione um feedback ou observações sobre este eletrônico"
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
          <div className="py-8 text-center">Nenhum detalhe encontrado para este eletrônico.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

