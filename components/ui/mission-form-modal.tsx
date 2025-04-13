"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface MissionFormModalProps {
  isOpen: boolean
  onClose: () => void
  missionId?: number // Se fornecido, é uma edição; se não, é uma nova missão
}

interface StudentOption {
  id: number
  name: string
}

interface MissionDetails {
  id?: number
  title: string
  description: string
  assignedTo: number
  deadline: string
  status: string
}

export function MissionFormModal({ isOpen, onClose, missionId }: MissionFormModalProps) {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentOption[]>([])
  const [formData, setFormData] = useState<MissionDetails>({
    title: "",
    description: "",
    assignedTo: 0,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 dias a partir de hoje
    status: "PENDING",
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isOpen) {
      setLoading(true)

      // Carregar lista de estudantes
      const mockStudents: StudentOption[] = [
        { id: 1, name: "João Silva" },
        { id: 2, name: "Maria Santos" },
        { id: 3, name: "Pedro Oliveira" },
        { id: 4, name: "Ana Costa" },
        { id: 5, name: "Carlos Souza" },
      ]
      setStudents(mockStudents)

      // Se for edição, carregar dados da missão
      if (missionId) {
        // Simulação de carregamento de dados
        setTimeout(() => {
          const mockMission: MissionDetails = {
            id: missionId,
            title: ["Reparo de Monitores", "Catalogação de Doações", "Manutenção de Notebooks"][missionId % 3],
            description: [
              "Realizar diagnóstico e reparo em 5 monitores LCD com problemas de imagem.",
              "Catalogar e registrar no sistema 20 novos itens recebidos na última campanha de doação.",
              "Realizar limpeza e manutenção preventiva em 10 notebooks do laboratório.",
            ][missionId % 3],
            assignedTo: (missionId % 5) + 1,
            deadline: new Date(2023, 2, 20 + missionId * 5).toISOString().split("T")[0],
            status: ["PENDING", "IN_PROGRESS", "APPROVED"][missionId % 3],
          }

          setFormData(mockMission)
          setLoading(false)
        }, 1000)
      } else {
        // Nova missão, apenas inicializar o formulário
        setLoading(false)
      }
    }
  }, [isOpen, missionId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando ele for alterado
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando ele for alterado
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      errors.title = "O título é obrigatório"
    }

    if (!formData.description.trim()) {
      errors.description = "A descrição é obrigatória"
    }

    if (!formData.assignedTo) {
      errors.assignedTo = "É necessário selecionar um aluno"
    }

    if (!formData.deadline) {
      errors.deadline = "A data limite é obrigatória"
    } else {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (deadlineDate < today) {
        errors.deadline = "A data limite não pode ser no passado"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    // Simulação de envio de dados
    console.log("Enviando dados da missão:", formData)

    // Fecha o modal após um breve delay para simular o envio
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{missionId ? "Editar Missão" : "Nova Missão"}</DialogTitle>
              <DialogDescription>
                {missionId
                  ? "Edite os detalhes da missão atribuída ao aluno."
                  : "Crie uma nova missão para atribuir a um aluno."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Reparo de Monitores"
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {formErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente a missão a ser realizada"
                  rows={4}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {formErrors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">
                  Aluno Designado <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.assignedTo.toString()}
                  onValueChange={(value) => handleSelectChange("assignedTo", value)}
                >
                  <SelectTrigger className={formErrors.assignedTo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  {formErrors.assignedTo && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.assignedTo}
                    </p>
                  )}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    Data Limite <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className={`pl-10 ${formErrors.deadline ? "border-red-500" : ""}`}
                    />
                  </div>
                  {formErrors.deadline && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.deadline}
                    </p>
                  )}
                </div>

                {missionId && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                        <SelectItem value="APPROVED">Concluída</SelectItem>
                        <SelectItem value="REJECTED">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {missionId
                    ? "Missão criada em " + new Date(2023, 2, 10).toLocaleDateString()
                    : "A missão será atribuída imediatamente após a criação."}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>{missionId ? "Salvar Alterações" : "Criar Missão"}</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
