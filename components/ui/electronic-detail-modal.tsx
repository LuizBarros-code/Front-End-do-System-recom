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
import { AvatarFallback } from "@/components/ui/avatar"

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
  tipoDeConexao?: string
}

export function ElectronicDetailModal({ isOpen, onClose, electronicId, electronicType }: ElectronicDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<ElectronicDetails | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchDetails = async () => {
      if (!electronicId || !electronicType) return
      setLoading(true)
      setError(false)
      setErrorMessage("")
      try {
        // Mapear tipo para endpoint correto
        const typeToEndpoint: Record<string, string> = {
          mouse: 'mouses',
          mouses: 'mouses',
          teclado: 'teclados',
          teclados: 'teclados',
          hd: 'hds',
          hds: 'hds',
          estabilizador: 'estabilizadores',
          estabilizadores: 'estabilizadores',
          fontedealimentacao: 'fontesDeAlimentacao',
          fontesdealimentacao: 'fontesDeAlimentacao',
          gabinetes: 'gabinetes',
          gabinete: 'gabinetes',
          impressora: 'impressoras',
          impressoras: 'impressoras',
          monitor: 'monitores',
          monitores: 'monitores',
          notebook: 'notebooks',
          notebooks: 'notebooks',
          placamae: 'placasMae',
          placasMae: 'placasMae',
          processador: 'processadores',
          processadores: 'processadores',
        }
        const normalizedType = (electronicType || '').toLowerCase().replace(/[^a-z]/g, '')
        const endpoint = typeToEndpoint[normalizedType] || `${normalizedType}s`
        
        // Fetch electronic details
        console.log('FETCH ELETRONICO:', { endpoint, id: electronicId });
        const response = await fetch(`http://localhost:3456/${endpoint}/${electronicId}`)
        if (!response.ok) throw new Error('Failed to fetch details')
        const data = await response.json()
        
        // If data is an array, take the first item
        const electronicData = Array.isArray(data) ? data[0] : data
        
        // Fetch image
        const imageEndpoint = normalizedType === 'mouse' || normalizedType === 'mouses' ? 'mouse' : normalizedType;
        const imageResponse = await fetch(`http://localhost:3456/imagens/${imageEndpoint}/${electronicId}`)
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          if (Array.isArray(imageData) && imageData.length > 0) {
            const imagePath = imageData[0].url || imageData[0].caminho
            if (imagePath) {
              setImageUrl(`http://localhost:3456${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`)
            }
          }
        }

        setDetails({
          id: electronicData.id,
          name: electronicData.nome || electronicData.name,
          type: normalizedType,
          serialNumber: electronicData.codigoDereferencia || '',
          model: electronicData.modelo || '',
          brand: electronicData.marca || '',
          condition: electronicData.status || '',
          origin: electronicData.situacao || '',
          receivedDate: electronicData.dataDeChegada || '',
          specifications: electronicData.descricao || '',
          status: electronicData.situacao || '',
          image: imageUrl,
          tipoDeConexao: electronicData.tipoDeConexao || ''
        })
      } catch (error) {
        console.error('Error fetching electronic details:', error)
        setError(true)
        setErrorMessage('Erro ao carregar dados do equipamento')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchDetails()
    }
  }, [isOpen, electronicId, electronicType])

  const getStatusBadge = (status: string) => {
    const variants = {
      "Em estoque": { variant: "success", label: "Em estoque" },
      "Em manutenção": { variant: "default", label: "Em manutenção" },
      "Para descarte": { variant: "destructive", label: "Para descarte" },
      "Usado": { variant: "outline", label: "Usado" }
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

  const handleStatusChange = async () => {
    if (!electronicId || !electronicType || !newStatus) return;

    try {
      // Mapear o tipo para o endpoint correto
      const typeToEndpoint: Record<string, string> = {
        estabilizador: 'estabilizadores',
        fontedealimentacao: 'fontesDeAlimentacao',
        gabinete: 'gabinetes',
        impressora: 'impressoras',
        monitor: 'monitores',
        notebook: 'notebooks',
        placamae: 'placasMae',
        processador: 'processadores',
        teclado: 'teclados',
      };

      const normalizedType = (electronicType || '').toLowerCase().replace(/\s/g, '');
      const endpoint = typeToEndpoint[normalizedType] || `${normalizedType}s`;

      // Fazer a requisição para atualizar o status
      const response = await fetch(`http://localhost:3456/${endpoint}/${electronicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          feedback: feedback
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do equipamento');
      }

      // Atualiza o status no objeto de detalhes
      if (details) {
        setDetails({
          ...details,
          status: newStatus,
        });
      }

      // Fecha o modal após a atualização
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      // Aqui você pode adicionar uma notificação de erro se desejar
    }
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
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="electronic-details-description"
      >
        <DialogHeader>
          <DialogTitle>Detalhes do Eletrônico</DialogTitle>
          <DialogDescription id="electronic-details-description">
            {loading
              ? "Carregando detalhes do eletrônico."
              : error
                ? errorMessage
                : "Veja as informações detalhadas deste equipamento eletrônico."}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes do eletrônico...</div>
        ) : error ? (
          <div className="flex flex-col items-center py-8">
            <div className="rounded-full bg-red-100 p-4 mb-4">
              <span style={{ color: '#ef4444', fontSize: 48 }}>✗</span>
            </div>
            <div className="text-lg font-semibold mb-2">Erro ao carregar dados</div>
            <div className="text-sm text-muted-foreground">{errorMessage}</div>
            <Button className="mt-6" onClick={onClose}>Fechar</Button>
          </div>
        ) : details ? (
          <>
            <div className="flex justify-between items-start">
              <DialogTitle>{details.name}</DialogTitle>
              {details.status && getStatusBadge(details.status)}
            </div>
            <DialogDescription>
              ID: #{details.id} | Tipo: {details?.type ? details.type.charAt(0).toUpperCase() + details.type.slice(1) : ""}
            </DialogDescription>

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
                  details?.type ? details.type.charAt(0).toUpperCase() + details.type.slice(1) : "",
                )}
                {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Marca", details.brand)}
                {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Modelo", details.model)}
                {renderDetailItem(
                  <Tag className="h-4 w-4 text-muted-foreground" />,
                  "Código de Referência",
                  details.serialNumber,
                )}
                {renderDetailItem(
                  <Calendar className="h-4 w-4 text-muted-foreground" />,
                  "Data de Chegada",
                  new Date(details.receivedDate).toLocaleDateString(),
                )}
                {renderDetailItem(<Info className="h-4 w-4 text-muted-foreground" />, "Situação", details.origin)}
                {details.tipoDeConexao && renderDetailItem(
                  <Info className="h-4 w-4 text-muted-foreground" />,
                  "Tipo de Conexão",
                  details.tipoDeConexao
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Detalhes Técnicos</h3>
                {renderDetailItem(<Info className="h-4 w-4 text-muted-foreground" />, "Estado", details.condition)}
                {details.specifications &&
                  renderDetailItem(
                    <Cpu className="h-4 w-4 text-muted-foreground" />,
                    "Descrição",
                    details.specifications,
                  )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={onClose}>Fechar</Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

