"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, GraduationCap, Calendar, FileText, Tag, Info, Phone, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface StudentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number
}

interface StudentDetails {
  id: number
  name: string
  email: string
  matricula: string
  curso: string
  status: string
  telefone?: string
  endereco?: string
  dataInscricao?: string
  motivacao?: string
  experiencia?: string
  disponibilidade?: string
  habilidades?: string[]
}

export function StudentDetailModal({ isOpen, onClose, studentId }: StudentDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<StudentDetails | null>(null)

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true)
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados simulados do aluno
        const mockStudent: StudentDetails = {
          id: studentId,
          name: ["João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza"][studentId % 5],
          email: [
            "joao.silva@email.com",
            "maria.santos@email.com",
            "pedro.oliveira@email.com",
            "ana.costa@email.com",
            "carlos.souza@email.com",
          ][studentId % 5],
          matricula: `2021${String(studentId).padStart(3, "0")}`,
          curso: [
            "Engenharia da Computação",
            "Ciência da Computação",
            "Sistemas de Informação",
            "Engenharia Elétrica",
            "Engenharia da Computação",
          ][studentId % 5],
          status: ["APPROVED", "APPROVED", "PENDING", "REJECTED", "PENDING"][studentId % 5],
          telefone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          endereco: "Rua Exemplo, 123 - Bairro - Cidade/UF",
          dataInscricao: new Date(2023, 0, 10 + studentId).toISOString(),
          motivacao:
            "Tenho interesse em aprender mais sobre manutenção de equipamentos eletrônicos e contribuir com projetos sociais que promovam inclusão digital.",
          experiencia:
            "Possuo conhecimentos básicos em montagem e manutenção de computadores, adquiridos em cursos livres e projetos pessoais.",
          disponibilidade: "Segunda a sexta, períodos matutino e vespertino.",
          habilidades: [
            "Montagem de computadores",
            "Instalação de sistemas operacionais",
            "Conhecimentos básicos de redes",
            "Suporte técnico",
          ],
        }

        setDetails(mockStudent)
        setLoading(false)
      }, 1000)
    }
  }, [isOpen, studentId])

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Rejeitado" },
    }
    const statusInfo = variants[status as keyof typeof variants] || variants.PENDING
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleApprove = () => {
    console.log(`Aprovando aluno ${studentId}`)
    if (details) {
      setDetails({
        ...details,
        status: "APPROVED",
      })
    }
    setTimeout(onClose, 500)
  }

  const handleReject = () => {
    console.log(`Rejeitando aluno ${studentId}`)
    if (details) {
      setDetails({
        ...details,
        status: "REJECTED",
      })
    }
    setTimeout(onClose, 500)
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
      <DialogContent className="max-w-4xl">
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes do aluno...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{details.name}</DialogTitle>
                {details.status && getStatusBadge(details.status)}
              </div>
              <DialogDescription>
                Matrícula: {details.matricula} | {details.curso}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Dados Pessoais</h3>
                <div className="space-y-2">
                  {renderDetailItem(<User className="h-4 w-4 text-muted-foreground" />, "Nome", details.name)}
                  {renderDetailItem(<Mail className="h-4 w-4 text-muted-foreground" />, "Email", details.email)}
                  {renderDetailItem(<Phone className="h-4 w-4 text-muted-foreground" />, "Telefone", details.telefone)}
                  {renderDetailItem(<MapPin className="h-4 w-4 text-muted-foreground" />, "Endereço", details.endereco)}
                  {renderDetailItem(
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />,
                    "Curso",
                    details.curso,
                  )}
                  {renderDetailItem(
                    <Calendar className="h-4 w-4 text-muted-foreground" />,
                    "Data de Inscrição",
                    details.dataInscricao ? new Date(details.dataInscricao).toLocaleDateString() : undefined,
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Informações da Inscrição</h3>
                <div className="space-y-2">
                  {renderDetailItem(
                    <FileText className="h-4 w-4 text-muted-foreground" />,
                    "Motivação",
                    details.motivacao,
                  )}
                  {renderDetailItem(
                    <Info className="h-4 w-4 text-muted-foreground" />,
                    "Experiência",
                    details.experiencia,
                  )}
                  {renderDetailItem(
                    <Calendar className="h-4 w-4 text-muted-foreground" />,
                    "Disponibilidade",
                    details.disponibilidade,
                  )}

                  <div className="flex items-start gap-2 mb-3">
                    <div className="mt-0.5">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Habilidades</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {details.habilidades?.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <DialogFooter>
              <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                {details.status === "PENDING" && (
                  <>
                    <Button variant="destructive" onClick={handleReject}>
                      Reprovar
                    </Button>
                    <Button variant="default" onClick={handleApprove}>
                      Aprovar
                    </Button>
                  </>
                )}
                {details.status === "APPROVED" && (
                  <Button variant="destructive" onClick={handleReject}>
                    Cancelar Aprovação
                  </Button>
                )}
                {details.status === "REJECTED" && (
                  <Button variant="default" onClick={handleApprove}>
                    Aprovar
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">Nenhum detalhe encontrado para este aluno.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

