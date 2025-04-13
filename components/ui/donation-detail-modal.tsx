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
  const [details, setDetails] = useState<DonationDetails | null>(null)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (isOpen && donationId) {
      setLoading(true)
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados simulados com base no tipo de doação
        const isProjectDonation = donationType === "project"

        const mockDetails: DonationDetails = {
          id: donationId,
          name: isProjectDonation
            ? ["Doação para Projeto Educacional", "Doação para Inclusão Digital", "Doação para Biblioteca Comunitária"][
                donationId % 3
              ]
            : ["Doação de Equipamentos", "Doação de Periféricos", "Doação de Componentes"][donationId % 3],
          donorName: isProjectDonation
            ? ["Empresa ABC Ltda", "Instituto Tecnologia", "Fundação Educacional"][donationId % 3]
            : ["Carlos Eduardo", "Ana Beatriz", "Roberto Almeida"][donationId % 3],
          donorType: isProjectDonation ? "juridica" : "fisica",
          email: isProjectDonation
            ? ["contato@empresaabc.com", "instituto@tecnologia.org", "fundacao@educacional.org"][donationId % 3]
            : ["carlos.eduardo@email.com", "ana.beatriz@email.com", "roberto.almeida@email.com"][donationId % 3],
          phone: "(11) 9" + Math.floor(10000000 + Math.random() * 90000000),
          items: isProjectDonation
            ? ["5 computadores desktop, 2 impressoras", "10 tablets, 5 roteadores", "3 notebooks, 2 projetores"][
                donationId % 3
              ]
            : ["Laptop Dell, Monitor LG", "Teclado e Mouse sem fio", "Impressora HP, Scanner"][donationId % 3],
          quantity: isProjectDonation ? 5 + (donationId % 10) : 1 + (donationId % 3),
          description: isProjectDonation
            ? [
                "Doação de equipamentos para laboratório de informática em escola pública",
                "Doação para projeto de inclusão digital em comunidade carente",
                "Doação para biblioteca comunitária",
              ][donationId % 3]
            : [
                "Equipamentos em bom estado para doação",
                "Periféricos novos para doação",
                "Componentes usados em bom estado",
              ][donationId % 3],
          additionalInfo: isProjectDonation
            ? "Equipamentos serão utilizados para montar um laboratório de informática para alunos do ensino fundamental."
            : "Equipamentos em bom estado de conservação, laptop precisa de nova bateria.",
          date: new Date(2023, 4, 1 + donationId).toISOString(),
          status: ["PENDING", "APPROVED", "REJECTED", "APPROVED"][donationId % 4],
          deliveryDate: new Date(2023, 4, 10 + donationId).toISOString(),
          deliveryMethod: isProjectDonation ? "Entrega pela empresa" : "Entrega pessoal",
          paymentMethod: isProjectDonation ? "Nota fiscal de doação" : "Não aplicável",
        }

        setDetails(mockDetails)
        setNewStatus(mockDetails.status)
        setLoading(false)
      }, 1000)
    }
  }, [isOpen, donationId, donationType])

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes da doação...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{details.name}</DialogTitle>
                {details.status && getStatusBadge(details.status)}
              </div>
              <DialogDescription>
                ID: #{details.id} | {donationType === "project" ? "Doação para Projeto" : "Doação de Usuário"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Informações do Doador</h3>
                {renderDetailItem(
                  details.donorType === "juridica" ? (
                    <Building className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  ),
                  "Nome do Doador",
                  details.donorName,
                )}
                {renderDetailItem(
                  <Badge variant="outline" className="h-5 px-1.5 text-xs">
                    {details.donorType === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"}
                  </Badge>,
                  "Tipo de Doador",
                  details.donorType === "juridica" ? "Pessoa Jurídica" : "Pessoa Física",
                )}
                {renderDetailItem(<Mail className="h-4 w-4 text-muted-foreground" />, "Email", details.email)}
                {renderDetailItem(<Phone className="h-4 w-4 text-muted-foreground" />, "Telefone", details.phone)}
                {renderDetailItem(
                  <Calendar className="h-4 w-4 text-muted-foreground" />,
                  "Data da Doação",
                  new Date(details.date).toLocaleDateString(),
                )}
                {details.deliveryDate &&
                  renderDetailItem(
                    <Truck className="h-4 w-4 text-muted-foreground" />,
                    "Data de Entrega",
                    new Date(details.deliveryDate).toLocaleDateString(),
                  )}
                {details.deliveryMethod &&
                  renderDetailItem(
                    <Truck className="h-4 w-4 text-muted-foreground" />,
                    "Método de Entrega",
                    details.deliveryMethod,
                  )}
                {details.paymentMethod &&
                  renderDetailItem(
                    <CreditCard className="h-4 w-4 text-muted-foreground" />,
                    "Método de Pagamento",
                    details.paymentMethod,
                  )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Detalhes da Doação</h3>
                {renderDetailItem(<Package className="h-4 w-4 text-muted-foreground" />, "Itens", details.items)}
                {renderDetailItem(<Tag className="h-4 w-4 text-muted-foreground" />, "Quantidade", details.quantity)}
                {renderDetailItem(
                  <FileText className="h-4 w-4 text-muted-foreground" />,
                  "Descrição",
                  details.description,
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
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Feedback / Observações</h3>
                <Textarea
                  placeholder="Adicione um feedback ou observações sobre esta doação"
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
          <div className="py-8 text-center">Nenhum detalhe encontrado para esta doação.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

