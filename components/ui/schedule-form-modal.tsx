"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Calendar, Clock, Info } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ScheduleFormModalProps {
  isOpen: boolean
  onClose: () => void
  scheduleId?: number // Se fornecido, é uma edição; se não, é um novo horário
}

interface StudentOption {
  id: number
  name: string
  type: "bolsista_facape" | "prouni" | "normal"
}

interface ScheduleDetails {
  id?: number
  studentId: number
  studentType?: "bolsista_facape" | "prouni" | "normal"
  days: string[]
  startTime: string
  endTime: string
  role: string
}

const ROLES = [
  "Técnico de Manutenção",
  "Atendente",
  "Catalogador",
  "Triador",
  "Organizador de Estoque",
  "Técnico de Reparo",
  "Auxiliar Administrativo",
  "Monitor",
  "Outro",
]

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
]

export function ScheduleFormModal({ isOpen, onClose, scheduleId }: ScheduleFormModalProps) {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentOption[]>([])
  const [formData, setFormData] = useState<ScheduleDetails>({
    studentId: 0,
    studentType: undefined,
    days: [],
    startTime: "",
    endTime: "",
    role: "",
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
    "Segunda-feira": false,
    "Terça-feira": false,
    "Quarta-feira": false,
    "Quinta-feira": false,
    "Sexta-feira": false,
    Sábado: false,
    Domingo: false,
  })

  useEffect(() => {
    if (isOpen) {
      setLoading(true)

      // Carregar lista de estudantes
      const mockStudents: StudentOption[] = [
        { id: 1, name: "João Silva", type: "bolsista_facape" },
        { id: 2, name: "Maria Santos", type: "bolsista_facape" },
        { id: 3, name: "Pedro Oliveira", type: "prouni" },
        { id: 4, name: "Ana Costa", type: "normal" },
        { id: 5, name: "Carlos Souza", type: "prouni" },
      ]
      setStudents(mockStudents)

      // Se for edição, carregar dados do horário
      if (scheduleId) {
        // Simulação de carregamento de dados
        setTimeout(() => {
          const mockSchedule: ScheduleDetails = {
            id: scheduleId,
            studentId: (scheduleId % 5) + 1,
            studentType: ["bolsista_facape", "prouni", "normal"][scheduleId % 3] as
              | "bolsista_facape"
              | "prouni"
              | "normal",
            days:
              scheduleId % 3 === 0
                ? ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"]
                : [DAYS_OF_WEEK[scheduleId % 7]],
            startTime: scheduleId % 2 === 0 ? "08:00" : "14:00",
            endTime: scheduleId % 2 === 0 ? "12:00" : "18:00",
            role: ROLES[scheduleId % ROLES.length],
          }

          setFormData(mockSchedule)

          // Atualizar os dias selecionados
          const newSelectedDays = { ...selectedDays }
          mockSchedule.days.forEach((day) => {
            newSelectedDays[day] = true
          })
          setSelectedDays(newSelectedDays)

          setLoading(false)
        }, 1000)
      } else {
        // Novo horário, apenas inicializar o formulário com valores padrão
        setFormData({
          studentId: 0,
          studentType: undefined,
          days: [],
          startTime: "08:00",
          endTime: "12:00",
          role: "",
        })

        // Resetar dias selecionados
        setSelectedDays({
          "Segunda-feira": false,
          "Terça-feira": false,
          "Quarta-feira": false,
          "Quinta-feira": false,
          "Sexta-feira": false,
          Sábado: false,
          Domingo: false,
        })

        setLoading(false)
      }
    }
  }, [isOpen, scheduleId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (name === "studentId") {
      const studentId = Number.parseInt(value)
      const selectedStudent = students.find((s) => s.id === studentId)

      setFormData((prev) => ({
        ...prev,
        [name]: studentId,
        studentType: selectedStudent?.type,
      }))

      // Se for bolsista FACAPE, selecionar todos os dias da semana (seg-sex)
      if (selectedStudent?.type === "bolsista_facape") {
        const newSelectedDays = {
          "Segunda-feira": true,
          "Terça-feira": true,
          "Quarta-feira": true,
          "Quinta-feira": true,
          "Sexta-feira": true,
          Sábado: false,
          Domingo: false,
        }
        setSelectedDays(newSelectedDays)
        setFormData((prev) => ({
          ...prev,
          days: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"],
        }))
      } else {
        // Para outros tipos, resetar a seleção de dias
        const newSelectedDays = {
          "Segunda-feira": false,
          "Terça-feira": false,
          "Quarta-feira": false,
          "Quinta-feira": false,
          "Sexta-feira": false,
          Sábado: false,
          Domingo: false,
        }
        setSelectedDays(newSelectedDays)
        setFormData((prev) => ({
          ...prev,
          days: [],
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Limpar erro do campo quando ele for alterado
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDayToggle = (day: string) => {
    // Se for bolsista FACAPE, não permitir alteração individual de dias
    if (formData.studentType === "bolsista_facape") {
      return
    }

    // Para ProUni e Normal, permitir apenas um dia
    if (formData.studentType === "prouni" || formData.studentType === "normal") {
      const newSelectedDays = {
        "Segunda-feira": false,
        "Terça-feira": false,
        "Quarta-feira": false,
        "Quinta-feira": false,
        "Sexta-feira": false,
        Sábado: false,
        Domingo: false,
        [day]: true,
      }
      setSelectedDays(newSelectedDays)
      setFormData((prev) => ({
        ...prev,
        days: [day],
      }))

      // Limpar erro do campo quando ele for alterado
      if (formErrors.days) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.days
          return newErrors
        })
      }
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!formData.studentId) {
      errors.studentId = "É necessário selecionar um aluno"
    }

    if (!formData.days || formData.days.length === 0) {
      errors.days = "É necessário selecionar pelo menos um dia"
    }

    if (!formData.startTime) {
      errors.startTime = "O horário de início é obrigatório"
    }

    if (!formData.endTime) {
      errors.endTime = "O horário de término é obrigatório"
    } else if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = "O horário de término deve ser posterior ao horário de início"
    }

    if (!formData.role) {
      errors.role = "É necessário selecionar um cargo"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    // Simulação de envio de dados
    console.log("Enviando dados do horário:", formData)

    // Fecha o modal após um breve delay para simular o envio
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const getStudentTypeLabel = (type?: string) => {
    switch (type) {
      case "bolsista_facape":
        return "Bolsista FACAPE"
      case "prouni":
        return "ProUni"
      case "normal":
        return "Regular"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{scheduleId ? "Editar Horário" : "Adicionar Horário"}</DialogTitle>
              <DialogDescription>
                {scheduleId ? "Edite os detalhes do horário do aluno." : "Adicione um novo horário para um aluno."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">
                  Aluno <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.studentId ? formData.studentId.toString() : ""}
                  onValueChange={(value) => handleSelectChange("studentId", value)}
                >
                  <SelectTrigger className={formErrors.studentId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} ({getStudentTypeLabel(student.type)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.studentId && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {formErrors.studentId}
                  </p>
                )}
              </div>

              {formData.studentType && (
                <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formData.studentType === "bolsista_facape"
                      ? "Bolsistas FACAPE devem comparecer de segunda a sexta-feira."
                      : "Alunos ProUni e Regulares devem comparecer um dia por semana."}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="days">
                  Dias da Semana <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className={`
                        border rounded-md p-2 cursor-pointer transition-colors
                        ${selectedDays[day] ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}
                        ${formData.studentType === "bolsista_facape" && (day === "Sábado" || day === "Domingo") ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                {formErrors.days && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {formErrors.days}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Horário de Início <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`pl-10 ${formErrors.startTime ? "border-red-500" : ""}`}
                    />
                  </div>
                  {formErrors.startTime && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.startTime}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">
                    Horário de Término <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`pl-10 ${formErrors.endTime ? "border-red-500" : ""}`}
                    />
                  </div>
                  {formErrors.endTime && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {formErrors.endTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Cargo <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> {formErrors.role}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {scheduleId
                    ? "Horário criado em " + new Date(2023, 2, 10).toLocaleDateString()
                    : "O horário será atribuído imediatamente após a criação."}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>{scheduleId ? "Salvar Alterações" : "Adicionar Horário"}</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
