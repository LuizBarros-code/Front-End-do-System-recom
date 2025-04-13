"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Adicione os imports necessários no topo do arquivo
import { Download, FileText, Calendar, User, Info, CheckCircle, XCircle, AlertCircle, Printer } from "lucide-react"

interface WeeklyReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: number
}

// Substitua a interface WeeklyReportDetails para incluir mais campos de relatório
interface WeeklyReportDetails {
  id: number
  title: string
  studentName: string
  studentEmail: string
  studentCourse: string
  studentMatricula?: string
  week: string
  content: string
  activities?: string[]
  hoursWorked?: number
  submissionDate: string
  status: string
  feedback?: string
  attachments?: string[]
  supervisor?: string
  goals?: string
  challenges?: string
  nextSteps?: string
}

// Substitua o conteúdo do componente WeeklyReportModal
export function WeeklyReportModal({ isOpen, onClose, reportId }: WeeklyReportModalProps) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<WeeklyReportDetails | null>(null)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [printMode, setPrintMode] = useState(false)

  useEffect(() => {
    if (isOpen && reportId) {
      setLoading(true)
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados simulados do relatório
        const mockDetails: WeeklyReportDetails = {
          id: reportId,
          title: [
            "Relatório Semanal de Atividades - Semana 1",
            "Relatório Semanal de Atividades - Semana 2",
            "Relatório Semanal de Atividades - Semana 3",
          ][reportId % 3],
          studentName: ["João Silva", "Maria Santos", "Pedro Oliveira"][reportId % 3],
          studentEmail: ["joao.silva@email.com", "maria.santos@email.com", "pedro.oliveira@email.com"][reportId % 3],
          studentCourse: ["Engenharia da Computação", "Ciência da Computação", "Sistemas de Informação"][reportId % 3],
          studentMatricula: ["2021001", "2021002", "2021003"][reportId % 3],
          week: ["01/03/2023 - 07/03/2023", "08/03/2023 - 14/03/2023", "15/03/2023 - 21/03/2023"][reportId % 3],
          content: [
            "Realizei a triagem de 10 equipamentos e participei do workshop de reparo de monitores. Também auxiliei na catalogação de 5 novos computadores recebidos por doação. Organizei o estoque de peças e componentes.",
            "Consertei 5 notebooks e cataloguei 15 novos itens recebidos por doação. Participei do atendimento ao público em 2 dias da semana, orientando sobre o funcionamento do projeto.",
            "Participei da organização do estoque e catalogação de novos equipamentos. Realizei a manutenção preventiva em 8 computadores e auxiliei na preparação de 3 computadores para doação.",
          ][reportId % 3],
          activities: [
            ["Triagem de equipamentos", "Participação em workshop", "Catalogação de doações", "Organização de estoque"],
            ["Reparo de notebooks", "Catalogação de itens", "Atendimento ao público", "Orientação sobre o projeto"],
            [
              "Organização de estoque",
              "Catalogação de equipamentos",
              "Manutenção preventiva",
              "Preparação para doação",
            ],
          ][reportId % 3],
          hoursWorked: [20, 18, 22][reportId % 3],
          submissionDate: new Date(2023, 2, 7 + reportId * 7).toISOString(),
          status: ["PENDING", "APPROVED", "REJECTED"][reportId % 3],
          feedback:
            reportId % 3 === 1
              ? "Excelente trabalho! Continue assim."
              : reportId % 3 === 2
                ? "Relatório incompleto. Por favor, adicione mais detalhes sobre as atividades realizadas."
                : undefined,
          attachments: reportId % 2 === 0 ? ["foto_equipamentos.jpg", "lista_catalogacao.pdf"] : undefined,
          supervisor: ["Ana Carvalho", "Roberto Mendes", "Fernanda Lima"][reportId % 3],
          goals: [
            "Realizar a triagem de pelo menos 10 equipamentos e participar de atividades de capacitação.",
            "Consertar notebooks com problemas de hardware e catalogar novos itens recebidos.",
            "Organizar o estoque e realizar manutenção preventiva em computadores.",
          ][reportId % 3],
          challenges: [
            "Alguns equipamentos apresentaram problemas complexos que exigiram pesquisa adicional.",
            "Grande volume de itens para catalogação em pouco tempo.",
            "Falta de peças específicas para completar alguns reparos.",
          ][reportId % 3],
          nextSteps: [
            "Focar no reparo dos equipamentos triados e continuar a catalogação.",
            "Finalizar a catalogação e iniciar o processo de preparação para doação.",
            "Solicitar peças necessárias e continuar a manutenção preventiva.",
          ][reportId % 3],
        }

        setDetails(mockDetails)
        setNewStatus(mockDetails.status)
        setFeedback(mockDetails.feedback || "")
        setLoading(false)
      }, 1000)
    }
  }, [isOpen, reportId])

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "default", label: "Pendente", icon: <AlertCircle className="h-4 w-4 mr-1" /> },
      APPROVED: { variant: "success", label: "Aprovado", icon: <CheckCircle className="h-4 w-4 mr-1" /> },
      REJECTED: { variant: "destructive", label: "Rejeitado", icon: <XCircle className="h-4 w-4 mr-1" /> },
    }
    const statusInfo = variants[status as keyof typeof variants] || variants.PENDING
    return (
      <Badge variant={statusInfo.variant as any} className="flex items-center">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    )
  }

  const handleStatusChange = () => {
    // Simulação de atualização de status
    console.log(`Atualizando status do relatório ${reportId} para ${newStatus}`)
    console.log(`Feedback: ${feedback}`)

    // Atualiza o status no objeto de detalhes
    if (details) {
      setDetails({
        ...details,
        status: newStatus,
        feedback: feedback,
      })
    }

    // Fecha o modal após um breve delay para mostrar a atualização
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const handlePrint = () => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, 100)
  }

  const handleExportPDF = () => {
    // Simulação de exportação para PDF
    console.log("Exportando relatório para PDF...")
    // Em uma implementação real, aqui seria usado uma biblioteca como jsPDF ou html2pdf
    alert("Relatório exportado como PDF com sucesso!")
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
        className={`max-w-5xl max-h-[90vh] overflow-y-auto ${printMode ? "print:p-0 print:max-w-none print:max-h-none print:overflow-visible" : ""}`}
      >
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes do relatório...</div>
        ) : details ? (
          <>
            <div className={`print:hidden ${printMode ? "hidden" : ""}`}>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl">Avaliação de Relatório</DialogTitle>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handlePrint} size="sm" className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF} size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
                <DialogDescription>Visualize e avalie o relatório semanal do aluno</DialogDescription>
              </DialogHeader>
            </div>

            <div id="report-content" className={`${printMode ? "p-8" : "mt-6"}`}>
              {/* Cabeçalho do Relatório */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-primary">{details.title}</h1>
                    <p className="text-muted-foreground mt-1">Período: {details.week}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Data de Envio: {new Date(details.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="print:hidden">{details.status && getStatusBadge(details.status)}</div>
                    <div className="hidden print:block text-sm">
                      Status:{" "}
                      {details.status === "APPROVED"
                        ? "Aprovado"
                        : details.status === "REJECTED"
                          ? "Rejeitado"
                          : "Pendente"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Coluna 1: Informações do Aluno */}
                <div className="space-y-6">
                  <div className="bg-card rounded-lg border shadow-sm">
                    <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                      <h3 className="text-base font-medium flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        Informações do Aluno
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Nome:</span>
                        <span>{details.studentName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Matrícula:</span>
                        <span>{details.studentMatricula}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Curso:</span>
                        <span>{details.studentCourse}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Supervisor:</span>
                        <span>{details.supervisor}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Horas Trabalhadas:</span>
                        <span className="font-semibold">{details.hoursWorked}h</span>
                      </div>
                    </div>
                  </div>

                  {details.attachments && details.attachments.length > 0 && (
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Anexos
                        </h3>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {details.attachments.map((attachment, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <a href="#" className="text-primary hover:underline">
                                {attachment}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coluna 2-3: Conteúdo do Relatório */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card rounded-lg border shadow-sm">
                    <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                      <h3 className="text-base font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        Resumo das Atividades
                      </h3>
                    </div>
                    <div className="p-5 text-sm leading-relaxed whitespace-pre-wrap">{details.content}</div>
                  </div>

                  {details.activities && (
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                          Atividades Realizadas
                        </h3>
                      </div>
                      <div className="p-5">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                          {details.activities.map((activity, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium">Objetivos</h3>
                      </div>
                      <div className="p-4 text-sm">{details.goals}</div>
                    </div>
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium">Desafios</h3>
                      </div>
                      <div className="p-4 text-sm">{details.challenges}</div>
                    </div>
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium">Próximos Passos</h3>
                      </div>
                      <div className="p-4 text-sm">{details.nextSteps}</div>
                    </div>
                  </div>

                  {details.feedback && (
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium flex items-center">
                          <Info className="h-4 w-4 mr-2 text-primary" />
                          Feedback do Coordenador
                        </h3>
                      </div>
                      <div className="p-5">
                        <div
                          className={`p-4 rounded-md text-sm border-l-4 ${
                            details.status === "APPROVED"
                              ? "border-green-500 bg-green-50"
                              : details.status === "REJECTED"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-500 bg-gray-50"
                          }`}
                        >
                          {details.feedback}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`print:hidden ${printMode ? "hidden" : ""}`}>
              <Separator className="my-6" />

              <div className="bg-card rounded-lg border shadow-sm p-5 mb-4">
                <h2 className="text-lg font-semibold mb-4">Avaliação do Relatório</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">Status da Avaliação</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="APPROVED">Aprovado</SelectItem>
                        <SelectItem value="REJECTED">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Feedback para o Aluno</label>
                    <Textarea
                      placeholder="Adicione um feedback construtivo sobre este relatório..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleStatusChange}>Salvar Avaliação</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">Nenhum detalhe encontrado para este relatório.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
