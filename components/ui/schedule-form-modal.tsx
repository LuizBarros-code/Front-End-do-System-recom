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
import { useToast } from "@/components/ui/use-toast"

interface ScheduleFormModalProps {
  isOpen: boolean
  onClose: () => void
  scheduleId?: number // Se fornecido, é uma edição; se não, é um novo horário
}

interface StudentOption {
  id: number
  name: string
  type: "bolsista_facape" | "prouni" | "normal"
  matricula: string
  curso: string
  dias?: string
  horarioInicio?: string
  horarioFim?: string
  cargo?: string
  bolsistaTipo?: string
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
  "testador",
  "montador",
  "tombador",
  "redes sociais",
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"

export function ScheduleFormModal({ isOpen, onClose, scheduleId }: ScheduleFormModalProps) {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<StudentOption | null>(null)
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
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && scheduleId) {
      setLoading(true)
      fetchStudent(scheduleId)
    }
  }, [isOpen, scheduleId])

  const fetchStudent = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3456/alunos/${id}`)
      if (!response.ok) throw new Error("Failed to fetch student")
      const data = await response.json()
      setStudent(data)
      const days = data.dias ? data.dias.split(", ") : []
      setFormData({
        id: data.id,
        studentId: data.id,
        studentType: data.bolsistaTipo,
        days,
        startTime: data.horarioInicio || "",
        endTime: data.horarioFim || "",
        role: data.cargo || "",
      })
      // Atualizar selectedDays
      const newSelectedDays: any = {}
      DAYS_OF_WEEK.forEach(day => { newSelectedDays[day] = days.includes(day) })
      setSelectedDays(newSelectedDays)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar aluno",
        description: "Não foi possível carregar os dados do aluno.",
      })
    } finally {
      setLoading(false)
    }
  }

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
      const selectedStudent = student
      if (selectedStudent) {
        setFormData((prev) => ({
          ...prev,
          [name]: studentId,
          studentType: selectedStudent.type,
        }))

        // Se for bolsista FACAPE, selecionar todos os dias da semana (seg-sex)
        if (selectedStudent.type === "bolsista_facape") {
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

  const handleDayToggleProuni = (day: string) => {
    let selected = Object.keys(selectedDays).filter((d) => selectedDays[d])
    if (selectedDays[day]) {
      // Desmarcar
      setSelectedDays((prev) => ({ ...prev, [day]: false }))
      setFormData((prev) => ({ ...prev, days: prev.days.filter((d) => d !== day) }))
    } else if (selected.length < 2) {
      // Marcar
      setSelectedDays((prev) => ({ ...prev, [day]: true }))
      setFormData((prev) => ({ ...prev, days: [...prev.days, day] }))
    }
  }

  const handleDayToggleNormal = (day: string) => {
    // Permitir apenas um dia
    setSelectedDays((prev) => {
      const newDays = Object.fromEntries(Object.keys(prev).map((d) => [d, false]))
      newDays[day] = true
      return newDays
    })
    setFormData((prev) => ({ ...prev, days: [day] }))
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!formData.studentId) {
      errors.studentId = "É necessário selecionar um aluno"
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

    // Validação dos dias
    if (formData.studentType === "prouni") {
      if (!formData.days || formData.days.length !== 2) {
        errors.days = "Selecione exatamente dois dias."
      }
    } else if (formData.studentType === "normal") {
      if (!formData.days || formData.days.length !== 1) {
        errors.days = "Selecione exatamente um dia."
      }
    }
    // FACAPE não precisa validar dias

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }
    try {
      let dias = ""
      if (formData.studentType === "bolsista_facape" || formData.studentType === "FACAPE") {
        dias = "Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado"
      } else {
        dias = formData.days.join(", ")
      }
      const horario = `${formData.startTime} - ${formData.endTime}`
      const payload = {
        dias,
        horario,
        cargo: formData.role,
      }
      const response = await fetch(`http://localhost:3456/alunos/${formData.studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to update schedule")
      }
      toast({
        title: "Horário atualizado",
        description: "O horário do aluno foi atualizado com sucesso.",
      })
      onClose()
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast({
        variant: "destructive",
        title: "Erro ao atualizar horário",
        description: "Não foi possível atualizar o horário do aluno. Por favor, tente novamente.",
      })
    }
  }

  const getStudentTypeLabel = (type?: string) => {
    switch (type) {
      case "bolsista_facape":
        return "FACAPE"
      case "prouni":
        return "ProUni"
      case "normal":
        return "Normal"
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

            {student && (
              <div className="mb-4 p-4 bg-muted/50 rounded-md">
                <div className="font-semibold text-lg">{student.name}</div>
                <div className="text-sm text-muted-foreground">Matrícula: {student.matricula}</div>
                <div className="text-sm text-muted-foreground">Curso: {student.curso}</div>
                <div className="text-sm text-muted-foreground">Tipo: {student.bolsistaTipo}</div>
              </div>
            )}

            <div className="space-y-4 mt-4">
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

              {formData.studentType === "bolsista_facape" || formData.studentType === "FACAPE" ? (
                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"].map((day) => (
                      <div key={day} className="border rounded-md p-2 bg-primary text-primary-foreground opacity-70 cursor-not-allowed">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              ) : formData.studentType === "prouni" ? (
                <div className="space-y-2">
                  <Label>Dias da Semana <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.slice(0, 6).map((day) => (
                      <div
                        key={day}
                        className={`border rounded-md p-2 cursor-pointer transition-colors ${selectedDays[day] ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                        onClick={() => handleDayToggleProuni(day)}
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
              ) : (
                <div className="space-y-2">
                  <Label>Dias da Semana <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.slice(0, 6).map((day) => (
                      <div
                        key={day}
                        className={`border rounded-md p-2 cursor-pointer transition-colors ${selectedDays[day] ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                        onClick={() => handleDayToggleNormal(day)}
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
              )}

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
