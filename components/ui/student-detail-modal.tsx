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
import { Dialog as SuccessDialog, DialogContent as SuccessDialogContent, DialogHeader as SuccessDialogHeader, DialogTitle as SuccessDialogTitle, DialogFooter as SuccessDialogFooter } from "@/components/ui/dialog"

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
  periodo?: string
  dias?: string
  bolsistaTipo?: string
}

export function StudentDetailModal({ isOpen, onClose, studentId }: StudentDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<StudentDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" })
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true)
      setError(null)
      fetch(`http://localhost:3456/inscritos/${studentId}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error('Erro ao buscar detalhes do inscrito')
          }
          const data = await res.json()
          setDetails(data)
        })
        .catch((err) => {
          setError(err.message)
          setDetails(null)
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, studentId])

  const getStatusBadge = (status: string) => {
    const normalized = normalizeStatus(status);
    const variants = {
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Reprovado" },
    };
    const statusInfo = variants[normalized as keyof typeof variants] || { variant: "secondary", label: status };
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>;
  }

  // Função para gerar senha aleatória
  function generateRandomPassword(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Função utilitária para normalizar status
  function normalizeStatus(status: string | undefined) {
    if (!status) return '';
    const s = status.trim().toUpperCase();
    if (['PENDING', 'PENDENTE'].includes(s)) return 'PENDING';
    if (['APPROVED', 'APROVADO'].includes(s)) return 'APPROVED';
    if (['REJECTED', 'REJEITADO'].includes(s)) return 'REJECTED';
    return s;
  }

  const handleApprove = async () => {
    try {
      // Gerar senha aleatória
      const randomPassword = generateRandomPassword(12);
      const alunoPayload = {
        name: details?.name,
        email: details?.email,
        password: randomPassword, // Senha aleatória
        matricula: details?.matricula,
        curso: details?.curso,
        dias: details?.dias,
        bolsistaTipo: details?.bolsistaTipo,
        cargo: "Monitor" // Cargo padrão inicial
      };
      // Exibir o JSON no console
      console.log('Payload enviado para criação do aluno:', alunoPayload);
      // Primeiro, criar o aluno
      const alunoResponse = await fetch('http://localhost:3456/alunos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alunoPayload),
      });

      if (!alunoResponse.ok) {
        throw new Error('Erro ao criar aluno');
      }

      setGeneratedPassword(randomPassword);

      // Atualizar status do inscrito para Aprovado
      const updateResponse = await fetch(`http://localhost:3456/inscritos/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Aprovado' }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar status do inscrito');
      }

      if (details) {
        setDetails({
          ...details,
          status: "Aprovado",
        });
      }
      setSuccessModal({ open: true, message: `Aluno criado e aprovado com sucesso!` });
    } catch (error) {
      console.error('Erro ao aprovar inscrito:', error);
    }
  }

  const handleReject = async () => {
    try {
      // Atualizar status do inscrito para Reprovado
      const updateResponse = await fetch(`http://localhost:3456/inscritos/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Reprovado' }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar status do inscrito');
      }

      if (details) {
        setDetails({
          ...details,
          status: "Reprovado",
        });
      }
      setSuccessModal({ open: true, message: `Inscrição reprovada com sucesso!` });
    } catch (error) {
      console.error('Erro ao rejeitar inscrito:', error);
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {loading ? "Carregando..." : error ? "Erro" : details ? "Detalhes do Aluno" : "Detalhes do Aluno"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando detalhes do aluno...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            <p>{error}</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        ) : details ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{details.name}</h2>
                <p className="text-muted-foreground mt-2">
                  Matrícula: {details.matricula} | {details.curso}
                </p>
              </div>
              {details.status && getStatusBadge(details.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="text-sm font-medium mb-4">Dados Pessoais</h3>
                <div className="space-y-3">
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
                  {renderDetailItem(
                    <Calendar className="h-4 w-4 text-muted-foreground" />,
                    "Período",
                    details.periodo,
                  )}
                  {renderDetailItem(
                    <Calendar className="h-4 w-4 text-muted-foreground" />,
                    "Dias de Disponibilidade",
                    details.dias,
                  )}
                  {renderDetailItem(
                    <Tag className="h-4 w-4 text-muted-foreground" />,
                    "Tipo de Bolsista",
                    details.bolsistaTipo,
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">Informações da Inscrição</h3>
                <div className="space-y-3">
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

                  {details.habilidades && details.habilidades.length > 0 && (
                    <div className="flex items-start gap-2 mb-3">
                      <div className="mt-0.5">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Habilidades</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {details.habilidades.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <DialogFooter>
              <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                {normalizeStatus(details.status) === "PENDING" && (
                  <>
                    <Button variant="destructive" onClick={handleReject}>
                      Reprovar
                    </Button>
                    <Button variant="default" onClick={handleApprove}>
                      Aprovar
                    </Button>
                  </>
                )}
                {normalizeStatus(details.status) === "APPROVED" && (
                  <Button variant="destructive" onClick={handleReject}>
                    Cancelar Aprovação
                  </Button>
                )}
                {normalizeStatus(details.status) === "REJECTED" && (
                  <Button variant="default" onClick={handleApprove}>
                    Aprovar
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Nenhum detalhe encontrado para este aluno.</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
      <SuccessDialog open={successModal.open} onOpenChange={(open) => {
        setSuccessModal({ ...successModal, open });
        if (!open) {
          setTimeout(() => {
            setGeneratedPassword(null);
            onClose();
          }, 100);
        }
      }}>
        <SuccessDialogContent>
          <SuccessDialogHeader>
            <SuccessDialogTitle>Sucesso</SuccessDialogTitle>
          </SuccessDialogHeader>
          <div className="py-4 text-center">
            <p>{successModal.message}</p>
          </div>
          <SuccessDialogFooter>
            <Button onClick={() => setSuccessModal({ ...successModal, open: false })}>OK</Button>
          </SuccessDialogFooter>
        </SuccessDialogContent>
      </SuccessDialog>
    </Dialog>
  )
}

