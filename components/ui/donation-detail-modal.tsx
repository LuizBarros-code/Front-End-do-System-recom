"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Building, Mail, Phone, FileText, Tag, Package, Info, Truck, CreditCard } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ElectronicDetailModal } from "@/components/ui/electronic-detail-modal"
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from "@/components/ui/dialog"

interface DonationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  donationId: number
  donationType: "project" | "user"
}

interface DonationDetails {
  id: number
  name: string
  donorName: string
  donorType: "fisica" | "juridica"
  email: string
  phone: string
  items: string
  quantity: number
  description: string
  additionalInfo?: string
  date: string
  status: string
  deliveryDate?: string
  deliveryMethod?: string
  paymentMethod?: string
}

export function DonationDetailModal({ isOpen, onClose, donationId, donationType }: DonationDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)
  const [selectedElectronic, setSelectedElectronic] = useState<{ id: number, type: string } | null>(null)
  const [isElectronicModalOpen, setIsElectronicModalOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [donatarioFisicoNome, setDonatarioFisicoNome] = useState<string | null>(null)
  const [donatarioJuridicoNome, setDonatarioJuridicoNome] = useState<string | null>(null)
  const [usuarioNome, setUsuarioNome] = useState<string | null>(null)
  const [isElectronicsModalOpen, setIsElectronicsModalOpen] = useState(false)
  const [electronicsByType, setElectronicsByType] = useState<any>({})
  const [loadingElectronics, setLoadingElectronics] = useState(false)
  const [selectedElectronicDetail, setSelectedElectronicDetail] = useState<any | null>(null)
  const [selectedElectronicImage, setSelectedElectronicImage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && donationId && donationType === "user") {
      setLoading(true)
      fetch(`http://localhost:3456/doacoesUsuarios/${donationId}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (isOpen && donationId && donationType === "project") {
      setLoading(true)
      fetch(`http://localhost:3456/doacoes/${donationId}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data)
          setNewStatus(data.status)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isOpen, donationId, donationType])

  useEffect(() => {
    if (details) {
      if (details.donatariofisicoId) {
        fetch(`http://localhost:3456/pessoasFisicas/${details.donatariofisicoId}`)
          .then(res => res.json())
          .then(data => setDonatarioFisicoNome(data.name || data.nome || null))
          .catch(() => setDonatarioFisicoNome(null))
      } else {
        setDonatarioFisicoNome(null)
      }
      if (details.donatariojuridicoId) {
        fetch(`http://localhost:3456/pessoasJuridicas/${details.donatariojuridicoId}`)
          .then(res => res.json())
          .then(data => setDonatarioJuridicoNome(data.name || data.nome || null))
          .catch(() => setDonatarioJuridicoNome(null))
      } else {
        setDonatarioJuridicoNome(null)
      }
      if (details.usuarioid) {
        fetch(`http://localhost:3456/alunos/${details.usuarioid}`)
          .then(res => res.json())
          .then(data => setUsuarioNome(data.name || data.nome || null))
          .catch(() => setUsuarioNome(null))
      } else {
        setUsuarioNome(null)
      }
    }
  }, [details])

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Rejeitado" },
      IN_PROGRESS: { variant: "default", label: "Em Andamento" },
    }
    const statusInfo = variants[status as keyof typeof variants] || variants.PENDING
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleStatusChange = () => {
    // Simulação de atualização de status
    console.log(`Atualizando status da doação ${donationId} para ${newStatus}`)
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

  // Mapeamento de tipo para endpoint
  const typeToEndpoint = {
    teclados: { data: "teclados", image: "teclado" },
    hds: { data: "hds", image: "hd" },
    fontesDeAlimentacao: { data: "fontesDeAlimentacao", image: "fonteDeAlimentacao" },
    gabinetes: { data: "gabinetes", image: "gabinete" },
    monitores: { data: "monitores", image: "monitor" },
    mouses: { data: "mouses", image: "mouse" },
    estabilizadores: { data: "estabilizadores", image: "estabilizado" },
    impressoras: { data: "impressoras", image: "impressora" },
    placasmae: { data: "placasMae", image: "placaMae" },
    notebooks: { data: "notebooks", image: "notebook" },
    processadores: { data: "processadores", image: "processador" },
  }

  const typeDisplayName: Record<string, string> = {
    teclados: 'Teclado',
    hds: 'HD',
    fontesDeAlimentacao: 'Fonte de Alimentação',
    gabinetes: 'Gabinete',
    monitores: 'Monitor',
    mouses: 'Mouse',
    estabilizadores: 'Estabilizador',
    impressoras: 'Impressora',
    placasmae: 'Placa Mãe',
    notebooks: 'Notebook',
    processadores: 'Processador',
    // outros tipos se necessário
  }

  const renderElectronicsList = () => {
    if (!details) return null
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Eletrônicos da Doação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(typeToEndpoint).map(([key, value]) => {
            const ids = details[key]
            if (!ids || !Array.isArray(ids)) return null
            return ids.map((id: number) => (
              <div key={`${key}-${id}`} className="flex items-center gap-2 border rounded p-2">
                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-xs text-muted-foreground">ID: {id}</span>
                <Button size="sm" variant="outline" onClick={() => { setSelectedElectronic({ id, type: value.data }); setIsElectronicModalOpen(true) }}>Ver Eletrônico</Button>
              </div>
            ))
          })}
        </div>
      </div>
    )
  }

  // Função para buscar eletrônicos da doação
  const fetchDonationElectronics = async () => {
    setLoadingElectronics(true)
    const endpoints = [
      { key: "teclados", url: "teclados", image: "teclado" },
      { key: "hds", url: "hds", image: "hd" },
      { key: "estabilizadores", url: "estabilizadores", image: "estabilizado" },
      { key: "monitores", url: "monitores", image: "monitor" },
      { key: "mouses", url: "mouses", image: "mouse" },
      { key: "gabinetes", url: "gabinetes", image: "gabinete" },
      { key: "impressoras", url: "impressoras", image: "impressora" },
      { key: "placas-mae", url: "placas-mae", image: "placaMae" },
      { key: "notebooks", url: "notebooks", image: "notebook" },
      { key: "processadores", url: "processadores", image: "processador" },
      { key: "fontes", url: "fontes", image: "fonteDeAlimentacao" },
    ]
    const result: any = {}
    await Promise.all(
      endpoints.map(async (ep) => {
        try {
          const res = await fetch(`http://localhost:3456/doacoes/${donationId}/${ep.url}`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              result[ep.key] = data.map((item: any) => ({ ...item, _imageType: ep.image }))
            }
          }
        } catch {}
      })
    )
    setElectronicsByType(result)
    setLoadingElectronics(false)
  }

  // Função para buscar imagem do eletrônico
  const fetchElectronicImage = async (type: string, id: number) => {
    try {
      const res = await fetch(`http://localhost:3456/imagens/${type}/${id}`)
      if (res.ok) {
        const data = await res.json()
        let caminho = null
        if (Array.isArray(data) && data.length > 0) {
          caminho = data[0].url || data[0].caminho
        } else if (data && (data.url || data.caminho)) {
          caminho = data.url || data.caminho
        }
        if (caminho) {
          if (!caminho.startsWith('/')) caminho = '/' + caminho
          setSelectedElectronicImage(`http://localhost:3456${caminho}`)
        } else {
          setSelectedElectronicImage(null)
        }
      } else {
        setSelectedElectronicImage(null)
      }
    } catch {
      setSelectedElectronicImage(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes da doação...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{details.name || details.nome || "Doação de Usuário"}</DialogTitle>
                {details.status && getStatusBadge(details.status)}
              </div>
              <DialogDescription>
                {details.descricao}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Informações</h3>
                <div><b>Contato:</b> {details.contato}</div>
                <div><b>Data:</b> {details.data ? new Date(details.data).toLocaleString() : ""}</div>
                <div><b>Informações Adicionais:</b> {details.informacoesAdicionais}</div>
                <div><b>Horário de Entrega:</b> {details.horarioDeEntrega}</div>
                <div><b>Itens:</b> {details.eletronicos}</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Status</h3>
                <div>{details.status}</div>
                {donatarioFisicoNome && <div><b>Donatário Físico:</b> {donatarioFisicoNome}</div>}
                {donatarioJuridicoNome && <div><b>Donatário Jurídico:</b> {donatarioJuridicoNome}</div>}
                {usuarioNome && <div><b>Usuário:</b> {usuarioNome}</div>}
              </div>
            </div>
            {selectedElectronic && (
              <ElectronicDetailModal
                isOpen={isElectronicModalOpen}
                onClose={() => setIsElectronicModalOpen(false)}
                electronicId={selectedElectronic.id}
                electronicType={selectedElectronic.type}
              />
            )}
            <div className="flex justify-end mt-4">
              {donationType === "project" && (
                <Button variant="outline" onClick={() => { setIsElectronicsModalOpen(true); fetchDonationElectronics(); }}>
                  Ver Eletrônicos
                </Button>
              )}
            </div>
            {selectedElectronic && (
              <ElectronicDetailModal
                isOpen={isElectronicModalOpen}
                onClose={() => setIsElectronicModalOpen(false)}
                electronicId={selectedElectronic.id}
                electronicType={selectedElectronic.type}
              />
            )}
            {donationType === "project" && (
              <>
                {/* Remove the status/feedback update section for project donations */}
              </>
            )}
            {/* Modal de Eletrônicos da Doação */}
            <UIDialog open={isElectronicsModalOpen} onOpenChange={setIsElectronicsModalOpen}>
              <UIDialogContent className="max-w-2xl">
                <UIDialogHeader>
                  <UIDialogTitle>Eletrônicos da Doação</UIDialogTitle>
                </UIDialogHeader>
                {loadingElectronics ? (
                  <div>Carregando eletrônicos...</div>
                ) : Object.keys(electronicsByType).length === 0 ? (
                  <div>Nenhum eletrônico encontrado para esta doação.</div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {Object.entries(electronicsByType).map(([type, items]: any) => (
                      <div key={type}>
                        <div className="font-semibold mb-1 capitalize">{typeDisplayName[type] || type.replace(/-/g, ' ')}</div>
                        <ul className="list-disc ml-6">
                          {items.map((e: any) => (
                            <li key={e.id} className="mb-2 flex items-center gap-3">
                              <span className="font-medium">{e.nome || e.name || `ID ${e.id}`}</span>
                              <span className="text-xs text-muted-foreground">ID: {e.id}</span>
                              <Button size="sm" variant="outline" onClick={() => { setSelectedElectronicDetail(e); fetchElectronicImage(e._imageType, e.id); }}>
                                Ver Detalhes
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {/* Modal de detalhes do eletrônico */}
                <UIDialog open={!!selectedElectronicDetail} onOpenChange={() => setSelectedElectronicDetail(null)}>
                  <UIDialogContent className="max-w-lg">
                    <UIDialogHeader>
                      <UIDialogTitle>Detalhes do Eletrônico</UIDialogTitle>
                    </UIDialogHeader>
                    {selectedElectronicDetail && (
                      <div className="space-y-2">
                        <img
                          src={selectedElectronicImage || "/placeholder.svg"}
                          alt={selectedElectronicDetail.nome || selectedElectronicDetail.name || `ID ${selectedElectronicDetail.id}`}
                          className="w-24 h-24 object-cover rounded border mb-2"
                        />
                        <div><b>ID:</b> {selectedElectronicDetail.id}</div>
                        <div><b>Nome:</b> {selectedElectronicDetail.nome || selectedElectronicDetail.name}</div>
                        {selectedElectronicDetail.modelo && <div><b>Modelo:</b> {selectedElectronicDetail.modelo}</div>}
                        {selectedElectronicDetail.marca && <div><b>Marca:</b> {selectedElectronicDetail.marca}</div>}
                        {selectedElectronicDetail.serialNumber && <div><b>S/N:</b> {selectedElectronicDetail.serialNumber}</div>}
                        {selectedElectronicDetail.estado && <div><b>Estado:</b> {selectedElectronicDetail.estado}</div>}
                        {selectedElectronicDetail.situacao && <div><b>Situação:</b> {selectedElectronicDetail.situacao}</div>}
                      </div>
                    )}
                  </UIDialogContent>
                </UIDialog>
              </UIDialogContent>
            </UIDialog>
          </>
        ) : (
          <div className="py-8 text-center">Nenhum detalhe encontrado para esta doação.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

