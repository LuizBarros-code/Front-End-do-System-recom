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
    if (isOpen && electronicId && electronicType) {
      setLoading(true)
      const fetchDetails = async () => {
        try {
          console.log('electronicType recebido no modal:', electronicType);
          // Mapear o tipo para o endpoint correto
          const typeToEndpoint: Record<string, string> = {
            estabilizador: 'estabilizadores',
            estabilizadores: 'estabilizadores',
            fonteDeAlimentacao: 'fontesDeAlimentacao',
            fontesDeAlimentacao: 'fontesDeAlimentacao',
            gabinete: 'gabinetes',
            gabinetes: 'gabinetes',
            hd: 'hds',
            hds: 'hds',
            impressora: 'impressoras',
            impressoras: 'impressoras',
            monitor: 'monitores',
            monitores: 'monitores',
            notebook: 'notebooks',
            notebooks: 'notebooks',
            placaMae: 'placasMae',
            placasMae: 'placasMae',
            processador: 'processadores',
            processadores: 'processadores',
            teclado: 'teclados',
            teclados: 'teclados',
          };
          const normalizedType = (electronicType || '').toLowerCase().replace(/\s/g, '');
          const endpoint = typeToEndpoint[normalizedType] || `${normalizedType}s`;
          // Buscar dados do eletrônico
          const res = await fetch(`http://localhost:3456/${endpoint}/${electronicId}`)
          if (!res.ok) throw new Error('Erro ao buscar detalhes do eletrônico')
          const data = await res.json()

          // Buscar imagem
          let imgUrl = null
          try {
            const imgRes = await fetch(`http://localhost:3456/imagens/${electronicType}/${electronicId}`)
            if (imgRes.ok) {
              const imgData = await imgRes.json()
              let caminho = null
              if (Array.isArray(imgData) && imgData.length > 0) {
                caminho = imgData[0].url
              } else if (imgData && imgData.url) {
                caminho = imgData.url
              }
              if (caminho) {
                let finalPath = caminho.startsWith('/') ? caminho : `/${caminho}`
                imgUrl = `http://localhost:3456${finalPath}`
              }
            }
          } catch {}

          setDetails({
            ...data,
            image: imgUrl,
          })
        } catch (err) {
          setDetails(null)
        } finally {
          setLoading(false)
        }
      }
      fetchDetails()
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
                Veja as informações detalhadas deste equipamento eletrônico.
              </DialogDescription>
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

