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
  const [details, setDetails] = useState<any | null>(null)
  const [student, setStudent] = useState<any | null>(null)
  const [feedback, setFeedback] = useState("")
  const [aprovado, setAprovado] = useState<boolean>(false)
  const [printMode, setPrintMode] = useState(false)

  useEffect(() => {
    if (isOpen && reportId) {
      setLoading(true)
      fetch(`http://localhost:3456/relatorios/${reportId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Erro ao buscar relatório");
          const data = await res.json();
          setDetails(data);
          setFeedback(data.feedback || "");
          setAprovado(!!data.aprovado);
          // Buscar dados do aluno
          if (data.usuarioId) {
            fetch(`http://localhost:3456/alunos/${data.usuarioId}`)
              .then(async (resAluno) => {
                if (!resAluno.ok) throw new Error();
                setStudent(await resAluno.json());
              })
              .catch(() => setStudent(null));
          } else {
            setStudent(null);
          }
        })
        .catch(() => { setDetails(null); setStudent(null); })
        .finally(() => setLoading(false));
    }
  }, [isOpen, reportId]);

  const getStatusBadge = (aprovado: boolean) => {
    return aprovado
      ? <Badge variant="success" className="flex items-center"><CheckCircle className="h-4 w-4 mr-1" />Aprovado</Badge>
      : <Badge variant="default" className="flex items-center"><AlertCircle className="h-4 w-4 mr-1" />Pendente</Badge>;
  };

  const handleStatusChange = async () => {
    if (!details) return;
    try {
      setLoading(true);
      await fetch(`http://localhost:3456/relatorios/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, aprovado }),
      });
      setDetails({ ...details, feedback, aprovado });
      onClose();
    } catch {
      alert("Erro ao salvar avaliação");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, 100)
  }

  const handleExportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("report-content");
    if (!element) return;
    html2pdf()
      .set({
        margin: 10,
        filename: `relatorio-semanal-${details?.id || "export"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

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
        <DialogTitle className="sr-only">Avaliação de Relatório</DialogTitle>
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
                    <h1 className="text-2xl font-bold text-primary">{details?.name}</h1>
                    <p className="text-muted-foreground mt-1">Período: {details?.periodo}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Data de Envio: {details?.createdAt ? new Date(details.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className="print:hidden">{getStatusBadge(aprovado)}</div>
                    <div className="hidden print:block text-sm">
                      Status:{" "}
                      {aprovado ? "Aprovado" : "Pendente"}
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
                        <span>{student?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Matrícula:</span>
                        <span>{student?.matricula || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Bolsista:</span>
                        <span>{student?.bolsistaTipo || '-'}</span>
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
                    <div className="p-5 text-sm leading-relaxed whitespace-pre-wrap">{details?.resumo}</div>
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
                        <h3 className="text-base font-medium">Atividades</h3>
                      </div>
                      <div className="p-4 text-sm">{details?.atividades}</div>
                    </div>
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium">Objetivos</h3>
                      </div>
                      <div className="p-4 text-sm">{details?.objetivos}</div>
                    </div>
                    <div className="bg-card rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-3 rounded-t-lg border-b">
                        <h3 className="text-base font-medium">Desafios</h3>
                      </div>
                      <div className="p-4 text-sm">{details?.desafios}</div>
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
                            aprovado
                              ? "border-green-500 bg-green-50"
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
                    <Select value={aprovado ? "true" : "false"} onValueChange={v => setAprovado(v === "true")}> 
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Aprovado</SelectItem>
                        <SelectItem value="false">Pendente</SelectItem>
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
