"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DetailModal } from "@/components/ui/detail-modal"
import { StudentDetailModal } from "@/components/ui/student-detail-modal"
import { DonationDetailModal } from "@/components/ui/donation-detail-modal"
import { DisposalDetailModal } from "@/components/ui/disposal-detail-modal"
import { ElectronicDetailModal } from "@/components/ui/electronic-detail-modal"
// Adicione os imports dos novos componentes no topo do arquivo
import { WeeklyReportModal } from "@/components/ui/weekly-report-modal"
import { MissionFormModal } from "@/components/ui/mission-form-modal"
// Adicione o import do novo componente no topo do arquivo
import { ScheduleFormModal } from "@/components/ui/schedule-form-modal"

interface CoordinatorData {
  id: number
  name: string
  email: string
  matricula: string
  departamento: string
}

interface StudentData {
  id: number
  name: string
  email: string
  dias: string
  matricula: string
  curso: string
  periodo: string
  bolsistaTipo?: string
  status: string
}

interface ProjectDonation {
  id: number
  name: string
  codigoDeReferencias: string
  descricao: string
  justificativa: string
  nomeOuEmpresa: string
  contato: string
  data: string
  status: string
  donatario: number
  usuariofisico: number
  usuariojuridico: number
}

interface UserDonation {
  id: number
  name: string
  eletronicos: string
  descricao: string
  informacoesAdicionais: string
  horarioDeEntrega: string
  contato: string
  data: string
  status: string
  donatariofisico: number
  donatariojuridico: number
  usuario: number
}

interface StudentRequest {
  id: number
  name: string
  eletronicos: string
  descricao: string
  informacoes: string
  horarioparapegar: string
  contato: string
  data: string
  dataparapegar: string
  status: string
  usuariosolicitacaofisico: number
  usuariosolicitacaojuridico: number
  usuario: number
}

interface Electronic {
  id: number
  nome: string
  tipo: string
  modelo?: string
  estado?: string
  imagem?: string
}

interface WeeklyReport {
  id: number
  title: string
  week: string
  content: string
  status: string
  submissionDate: string
  feedback?: string
  studentName: string
}

interface AssignedMission {
  id: number
  title: string
  description: string
  deadline: string
  priority: string
  status: string
  assignedDate: string
  assignedTo: string
}

// Add these interfaces to the top of the file, after the existing interfaces
interface DonationData {
  id: number
  name: string
  codigoDeReferencias: string
  descricao: string
  justificativa: string
  nomeOuEmpresa: string
  contato: string
  data: string
  status: string
  donatarioId?: number
  usuariofisicoId?: number
  usuariojuridicoId?: number
  createdAt: string
  deleted: boolean
  deletedAt?: string
  // Related equipment counts
  tecladosCount?: number
  hdsCount?: number
  fontesDeAlimentacaoCount?: number
  gabinetesCount?: number
  monitoresCount?: number
  mousesCount?: number
  estabilizadoresCount?: number
  impressorasCount?: number
  placasmaeCount?: number
  notebooksCount?: number
  processadoresCount?: number
}

interface DonorInfo {
  id: number
  tipo: string
  name: string
  email: string
}

// Add these interfaces after the existing interfaces
interface DisposalData {
  id: number
  descricao: string
  quantidade: number
  metodoDeDescarte: string
  data: string
  status: string
  alunoId?: number
  createdAt: string
  deleted: boolean
  deletedAt?: string
}

interface StudentInfo {
  id: number
  name: string
  email: string
  matricula: string
  curso: string
  dias: string
  bolsistaTipo?: string
  cargo?: string
}

// Dados de exemplo para estudantes inscritos
const studentsData = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@example.com",
    course: "Engenharia Civil",
    registrationDate: "2023-03-15",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Bruno Santos",
    email: "bruno.santos@example.com",
    course: "Ciência da Computação",
    registrationDate: "2023-02-28",
    status: "Inativo",
  },
  {
    id: 3,
    name: "Carla Oliveira",
    email: "carla.oliveira@example.com",
    course: "Arquitetura",
    registrationDate: "2023-04-10",
    status: "Ativo",
  },
  {
    id: 4,
    name: "Daniel Lima",
    email: "daniel.lima@example.com",
    course: "Medicina",
    registrationDate: "2023-01-20",
    status: "Pendente",
  },
  {
    id: 5,
    name: "Elena Martins",
    email: "elena.martins@example.com",
    course: "Direito",
    registrationDate: "2023-05-05",
    status: "Ativo",
  },
  {
    id: 6,
    name: "Fernando Costa",
    email: "fernando.costa@example.com",
    course: "Administração",
    registrationDate: "2023-03-22",
    status: "Inativo",
  },
  {
    id: 7,
    name: "Gabriela Pereira",
    email: "gabriela.pereira@example.com",
    course: "Psicologia",
    registrationDate: "2023-04-18",
    status: "Ativo",
  },
  {
    id: 8,
    name: "Henrique Alves",
    email: "henrique.alves@example.com",
    course: "Engenharia Elétrica",
    registrationDate: "2023-02-12",
    status: "Pendente",
  },
]

// Dados de exemplo para solicitações
const requestsData = [
  {
    id: 1,
    requester: "Maria Souza",
    type: "Pessoa Física",
    item: "Mesa de escritório",
    quantity: 1,
    requestDate: "2023-05-10",
    status: "Pendente",
  },
  {
    id: 2,
    requester: "João Ferreira",
    type: "Pessoa Física",
    item: "Cadeira ergonômica",
    quantity: 2,
    requestDate: "2023-05-08",
    status: "Aprovado",
  },
  {
    id: 3,
    requester: "Empresa ABC Ltda",
    type: "Pessoa Jurídica",
    item: "Computador desktop",
    quantity: 5,
    requestDate: "2023-05-05",
    status: "Em análise",
  },
  {
    id: 4,
    requester: "ONG Educação para Todos",
    type: "Pessoa Jurídica",
    item: "Projetor",
    quantity: 1,
    requestDate: "2023-05-03",
    status: "Aprovado",
  },
  {
    id: 5,
    requester: "Pedro Mendes",
    type: "Pessoa Física",
    item: "Monitor LCD",
    quantity: 1,
    requestDate: "2023-05-01",
    status: "Pendente",
  },
  {
    id: 6,
    requester: "Escola Municipal Central",
    type: "Pessoa Jurídica",
    item: "Notebooks",
    quantity: 10,
    requestDate: "2023-04-28",
    status: "Em análise",
  },
]

// Dados de exemplo para doações de projetos
const projectDonationsData = [
  {
    id: 1,
    project: "Inclusão Digital",
    items: "Computadores",
    quantity: 5,
    donationDate: "2023-04-15",
    status: "Entregue",
  },
  {
    id: 2,
    project: "Educação Rural",
    items: "Tablets",
    quantity: 10,
    donationDate: "2023-04-10",
    status: "Em transporte",
  },
  {
    id: 3,
    project: "Biblioteca Comunitária",
    items: "Impressoras",
    quantity: 2,
    donationDate: "2023-04-05",
    status: "Agendado",
  },
  {
    id: 4,
    project: "Escola Técnica",
    items: "Servidores",
    quantity: 1,
    donationDate: "2023-03-28",
    status: "Entregue",
  },
  {
    id: 5,
    project: "Centro Cultural",
    items: "Projetores",
    quantity: 3,
    donationDate: "2023-03-20",
    status: "Em transporte",
  },
]

// Dados de exemplo para doações de usuários
const userDonationsData = [
  {
    id: 1,
    donor: "Carlos Eduardo",
    items: "Laptop Dell",
    quantity: 1,
    condition: "Usado - Bom estado",
    donationDate: "2023-05-12",
    status: "Recebido",
  },
  {
    id: 2,
    donor: "Empresa XYZ",
    items: "Monitores LCD",
    quantity: 5,
    condition: "Usado - Excelente",
    donationDate: "2023-05-08",
    status: "Agendado",
  },
  {
    id: 3,
    donor: "Ana Beatriz",
    items: "Teclado e Mouse",
    quantity: 3,
    condition: "Novo",
    donationDate: "2023-05-05",
    status: "Recebido",
  },
  {
    id: 4,
    donor: "Instituto Tecnologia",
    items: "Servidores",
    quantity: 2,
    condition: "Usado - Necessita reparo",
    donationDate: "2023-05-01",
    status: "Em avaliação",
  },
  {
    id: 5,
    donor: "Roberto Almeida",
    items: "Impressora HP",
    quantity: 1,
    condition: "Usado - Bom estado",
    donationDate: "2023-04-28",
    status: "Recebido",
  },
]

// Dados de exemplo para descartes
const disposalsData = [
  {
    id: 1,
    item: "Monitores CRT",
    quantity: 8,
    disposalMethod: "Reciclagem especializada",
    disposalDate: "2023-04-20",
    status: "Concluído",
  },
  {
    id: 2,
    item: "Baterias",
    quantity: 15,
    disposalMethod: "Descarte ecológico",
    disposalDate: "2023-04-15",
    status: "Agendado",
  },
  {
    id: 3,
    item: "Placas-mãe danificadas",
    quantity: 12,
    disposalMethod: "Reciclagem de componentes",
    disposalDate: "2023-04-10",
    status: "Em processamento",
  },
  {
    id: 4,
    item: "Cartuchos de tinta",
    quantity: 30,
    disposalMethod: "Reciclagem",
    disposalDate: "2023-04-05",
    status: "Concluído",
  },
  {
    id: 5,
    item: "Cabos diversos",
    quantity: 50,
    disposalMethod: "Separação de materiais",
    disposalDate: "2023-03-30",
    status: "Em processamento",
  },
]

// Dados de exemplo para eletrônicos
const electronicsData = [
  {
    id: 1,
    item: "Laptop Dell Latitude",
    serialNumber: "DL7890123",
    condition: "Funcional - Bateria fraca",
    receivedDate: "2023-05-10",
    status: "Disponível",
  },
  {
    id: 2,
    item: "Desktop HP EliteDesk",
    serialNumber: "HP4567890",
    condition: "Funcional - Completo",
    receivedDate: "2023-05-05",
    status: "Em manutenção",
  },
  {
    id: 3,
    item: 'Monitor LG 24"',
    serialNumber: "LG1234567",
    condition: "Funcional - Perfeito",
    receivedDate: "2023-05-01",
    status: "Reservado",
  },
  {
    id: 4,
    item: "Impressora Brother",
    serialNumber: "BR7654321",
    condition: "Necessita reparo - Sem toner",
    receivedDate: "2023-04-28",
    status: "Em avaliação",
  },
  {
    id: 5,
    item: "Tablet Samsung",
    serialNumber: "SM9876543",
    condition: "Funcional - Tela trincada",
    receivedDate: "2023-04-25",
    status: "Disponível",
  },
]

// Dados de exemplo para relatórios semanais
const weeklyReportsData = [
  { id: 1, week: "01/05/2023 - 07/05/2023", donations: 12, requests: 8, disposals: 5, status: "Finalizado" },
  { id: 2, week: "24/04/2023 - 30/04/2023", donations: 9, requests: 11, disposals: 7, status: "Finalizado" },
  { id: 3, week: "17/04/2023 - 23/04/2023", donations: 15, requests: 6, disposals: 4, status: "Finalizado" },
  { id: 4, week: "10/04/2023 - 16/04/2023", donations: 7, requests: 9, disposals: 6, status: "Finalizado" },
  { id: 5, week: "03/04/2023 - 09/04/2023", donations: 10, requests: 7, disposals: 8, status: "Finalizado" },
]

// Dados de exemplo para missões atribuídas
const assignedMissionsData = [
  {
    id: 1,
    mission: "Coleta de doações - Empresa ABC",
    assignedTo: "Equipe Logística",
    dueDate: "2023-05-20",
    status: "Pendente",
  },
  {
    id: 2,
    mission: "Manutenção de equipamentos",
    assignedTo: "Equipe Técnica",
    dueDate: "2023-05-18",
    status: "Em Andamento",
  },
  {
    id: 3,
    mission: "Entrega de doações - Escola Municipal",
    assignedTo: "Equipe Logística",
    dueDate: "2023-05-15",
    status: "Concluído",
  },
  {
    id: 4,
    mission: "Avaliação de equipamentos recebidos",
    assignedTo: "Equipe Técnica",
    dueDate: "2023-05-12",
    status: "Concluído",
  },
  {
    id: 5,
    mission: "Organização do inventário",
    assignedTo: "Equipe Administrativa",
    dueDate: "2023-05-10",
    status: "Em Andamento",
  },
]

// Dados de exemplo para horários dos estudantes
const studentSchedulesData = [
  {
    id: 1,
    student: "Ana Silva",
    day: "Segunda-feira",
    startTime: "09:00",
    endTime: "12:00",
    activity: "Manutenção de equipamentos",
  },
  {
    id: 2,
    student: "Bruno Santos",
    day: "Segunda-feira",
    startTime: "14:00",
    endTime: "17:00",
    activity: "Atendimento ao público",
  },
  {
    id: 3,
    student: "Carla Oliveira",
    day: "Terça-feira",
    startTime: "09:00",
    endTime: "12:00",
    activity: "Catalogação de doações",
  },
  {
    id: 4,
    student: "Daniel Lima",
    day: "Terça-feira",
    startTime: "14:00",
    endTime: "17:00",
    activity: "Manutenção de equipamentos",
  },
  {
    id: 5,
    student: "Elena Martins",
    day: "Quarta-feira",
    startTime: "09:00",
    endTime: "12:00",
    activity: "Atendimento ao público",
  },
  {
    id: 6,
    student: "Fernando Costa",
    day: "Quarta-feira",
    startTime: "14:00",
    endTime: "17:00",
    activity: "Catalogação de doações",
  },
  {
    id: 7,
    student: "Gabriela Pereira",
    day: "Quinta-feira",
    startTime: "09:00",
    endTime: "12:00",
    activity: "Manutenção de equipamentos",
  },
  {
    id: 8,
    student: "Henrique Alves",
    day: "Quinta-feira",
    startTime: "14:00",
    endTime: "17:00",
    activity: "Atendimento ao público",
  },
  {
    id: 9,
    student: "Ana Silva",
    day: "Sexta-feira",
    startTime: "09:00",
    endTime: "12:00",
    activity: "Catalogação de doações",
  },
  {
    id: 10,
    student: "Bruno Santos",
    day: "Sexta-feira",
    startTime: "14:00",
    endTime: "17:00",
    activity: "Manutenção de equipamentos",
  },
]

export default function CoordinatorAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("project-donations")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [coordinatorData, setCoordinatorData] = useState<CoordinatorData | null>(null)
  const [projectDonations, setProjectDonations] = useState<ProjectDonation[]>([])
  const [userDonations, setUserDonations] = useState<UserDonation[]>([])
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    id: number
    type: "project" | "user" | "request" | "disposal" | "electronic"
    electronicType?: string
  } | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<{ id: number; type: "project" | "user" } | null>(null)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [selectedDisposal, setSelectedDisposal] = useState<number | null>(null)
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false)
  const [selectedElectronic, setSelectedElectronic] = useState<{ id: number; type?: string } | null>(null)
  const [isElectronicModalOpen, setIsElectronicModalOpen] = useState(false)
  const [electronics, setElectronics] = useState<Electronic[]>([])
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([])
  const [assignedMissions, setAssignedMissions] = useState<AssignedMission[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [currentFilterType, setCurrentFilterType] = useState<string>("")
  const [activeMonth, setActiveMonth] = useState<string>("Maio")
  // Add these states to the component
  const [donations, setDonations] = useState<DonationData[]>([])
  const [donorsInfo, setDonorsInfo] = useState<Map<string, DonorInfo>>(new Map())
  const [donationsLoading, setDonationsLoading] = useState(true)
  const [donationsStats, setDonationsStats] = useState({
    total: 0,
    pessoaFisica: 0,
    pessoaJuridica: 0,
    approvalRate: 0,
  })
  // Add these states to the component
  const [disposals, setDisposals] = useState<DisposalData[]>([])
  const [disposalsLoading, setDisposalsLoading] = useState(true)
  const [studentInfoMap, setStudentInfoMap] = useState<Map<number, StudentInfo>>(new Map())
  const [disposalStats, setDisposalStats] = useState({
    total: 0,
    thisMonth: 0,
    monthlyData: {} as Record<string, number>,
  })
  // Adicione estes estados dentro da função CoordinatorAdminPage
  const [selectedReport, setSelectedReport] = useState<number | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isMissionFormOpen, setIsMissionFormOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState<number | null>(null)
  // Adicione estes estados dentro da função CoordinatorAdminPage
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null)
  // Adicione estes novos estados dentro da função CoordinatorAdminPage, logo após os estados existentes:
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [closedDates, setClosedDates] = useState<Set<string>>(
    new Set([
      // Exemplo de alguns feriados em 2023
      "2023-01-01", // Ano Novo
      "2023-04-21", // Tiradentes
      "2023-05-01", // Dia do Trabalho
      "2023-09-07", // Independência
      "2023-10-12", // Nossa Senhora Aparecida
      "2023-11-02", // Finados
      "2023-11-15", // Proclamação da República
      "2023-12-25", // Natal
    ]),
  )

  const API_URL = "http://26.99.103.209:3456"

  useEffect(() => {
    // Check if user is logged in as coordinator
    const coordinatorId = localStorage.getItem("coordinatorId")
    const userType = localStorage.getItem("userType")

    if (!coordinatorId || userType !== "coordinator") {
      // Redirect to login if not logged in as coordinator
      console.log("No coordinator ID found or wrong user type. Redirecting to login...")
      router.push("/login")
      return
    }

    // Fetch coordinator data using the ID
    const fetchCoordinatorData = async () => {
      try {
        console.log("Fetching coordinator data for ID:", coordinatorId)
        const response = await fetch(`${API_URL}/coordenadores/${coordinatorId}`)

        if (response.ok) {
          const data = await response.json()
          console.log("Coordinator data fetched successfully:", data)
          setCoordinatorData(data)
        } else {
          console.error("Failed to fetch coordinator data. Status:", response.status)
          // If coordinator data can't be fetched, redirect to login
          localStorage.removeItem("coordinatorId")
          localStorage.removeItem("userType")
          router.push("/login")
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching coordinator data:", error)
        setIsLoading(false)
        // On error, also redirect to login
        localStorage.removeItem("coordinatorId")
        localStorage.removeItem("userType")
        router.push("/login")
      }
    }

    fetchCoordinatorData()
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectDonationsRes, userDonationsRes, studentRequestsRes, studentsRes] = await Promise.all([
          fetch(`${API_URL}/doacoes`),
          fetch(`${API_URL}/doacoesUsuarios`),
          fetch(`${API_URL}/solicitacoes`),
          fetch(`http://localhost:3456/inscritos`),
        ])

        if (projectDonationsRes.ok && userDonationsRes.ok && studentRequestsRes.ok && studentsRes.ok) {
          const projectDonationsData: ProjectDonation[] = await projectDonationsRes.json()
          const userDonationsData: UserDonation[] = await userDonationsRes.json()
          const studentRequestsData: StudentRequest[] = await studentRequestsRes.json()
          const studentsData = await studentsRes.json()

          setProjectDonations(projectDonationsData)
          setUserDonations(userDonationsData)
          setStudentRequests(studentRequestsData)
          setStudents(studentsData)
        } else {
          throw new Error("Failed to fetch data")
        }

        // Mock data for students
        // const mockStudents: StudentData[] = [
        //   {
        //     id: 1,
        //     name: "João Silva",
        //     email: "joao.silva@email.com",
        //     matricula: "2021001",
        //     curso: "Engenharia da Computação",
        //     status: "APPROVED",
        //   },
        //   {
        //     id: 2,
        //     name: "Maria Santos",
        //     email: "maria.santos@email.com",
        //     matricula: "2021002",
        //     curso: "Ciência da Computação",
        //     status: "APPROVED",
        //   },
        //   {
        //     id: 3,
        //     name: "Pedro Oliveira",
        //     email: "pedro.oliveira@email.com",
        //     matricula: "2021003",
        //     curso: "Sistemas de Informação",
        //     status: "PENDING",
        //   },
        //   {
        //     id: 4,
        //     name: "Ana Costa",
        //     email: "ana.costa@email.com",
        //     matricula: "2021004",
        //     curso: "Engenharia Elétrica",
        //     status: "REJECTED",
        //   },
        //   {
        //     id: 5,
        //     name: "Carlos Souza",
        //     email: "carlos.souza@email.com",
        //     matricula: "2021005",
        //     curso: "Engenharia da Computação",
        //     status: "PENDING",
        //   },
        // ]
        // setStudents(mockStudents)

        // Mock data for weekly reports and assigned missions
        const mockWeeklyReports: WeeklyReport[] = [
          {
            id: 1,
            title: "Progresso Semanal - Semana 1",
            week: "01/03/2023 - 07/03/2023",
            content: "Realizei a triagem de 10 equipamentos e participei do workshop de reparo de monitores.",
            status: "APPROVED",
            submissionDate: "2023-03-07T10:30:00",
            feedback: "Excelente trabalho! Continue assim.",
            studentName: "João Silva",
          },
          {
            id: 2,
            title: "Progresso Semanal - Semana 2",
            week: "08/03/2023 - 14/03/2023",
            content: "Consertei 5 notebooks e cataloguei 15 novos itens recebidos por doação.",
            status: "PENDING",
            submissionDate: "2023-03-14T09:45:00",
            studentName: "Maria Santos",
          },
          {
            id: 3,
            title: "Progresso Semanal - Semana 1",
            week: "01/03/2023 - 07/03/2023",
            content: "Participei da organização do estoque e catalogação de novos equipamentos.",
            status: "REJECTED",
            submissionDate: "2023-03-07T14:20:00",
            feedback: "Relatório incompleto. Por favor, adicione mais detalhes sobre as atividades realizadas.",
            studentName: "Pedro Oliveira",
          },
        ]

        const mockAssignedMissions: AssignedMission[] = [
          {
            id: 1,
            title: "Reparo de Monitores",
            description: "Realizar diagnóstico e reparo em 5 monitores LCD com problemas de imagem.",
            deadline: "2023-03-20T18:00:00",
            priority: "high",
            status: "IN_PROGRESS",
            assignedDate: "2023-03-10T09:00:00",
            assignedTo: "João Silva",
          },
          {
            id: 2,
            title: "Catalogação de Doações",
            description: "Catalogar e registrar no sistema 20 novos itens recebidos na última campanha de doação.",
            deadline: "2023-03-25T18:00:00",
            priority: "medium",
            status: "PENDING",
            assignedDate: "2023-03-12T14:30:00",
            assignedTo: "Maria Santos",
          },
          {
            id: 3,
            title: "Manutenção de Notebooks",
            description: "Realizar limpeza e manutenção preventiva em 10 notebooks do laboratório.",
            deadline: "2023-03-22T18:00:00",
            priority: "low",
            status: "APPROVED",
            assignedDate: "2023-03-15T10:00:00",
            assignedTo: "Pedro Oliveira",
          },
        ]

        setWeeklyReports(mockWeeklyReports)
        setAssignedMissions(mockAssignedMissions)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  // Add this useEffect to fetch donations data
  useEffect(() => {
    const fetchDonationsData = async () => {
      try {
        setDonationsLoading(true)
        const response = await fetch(`http://localhost:3456/doacoes`)

        if (response.ok) {
          const donationsData: DonationData[] = await response.json()
          setDonations(donationsData)

          // Calculate statistics
          const totalDonations = donationsData.length
          const pessoaFisicaDonations = donationsData.filter((d) => d.usuariofisicoId !== null).length
          const pessoaJuridicaDonations = donationsData.filter((d) => d.usuariojuridicoId !== null).length

          setDonationsStats({
            total: totalDonations,
            pessoaFisica: pessoaFisicaDonations,
            pessoaJuridica: pessoaJuridicaDonations,
          })

          // Fetch donor information for each donation
          const donorInfoMap = new Map<string, DonorInfo>()

          await Promise.all(
            donationsData.map(async (donation) => {
              if (donation.usuariofisicoId) {
                const key = `fisica-${donation.usuariofisicoId}`
                if (!donorInfoMap.has(key)) {
                  try {
                    const donorResponse = await fetch(`${API_URL}/pessoasFisicas/${donation.usuariofisicoId}`)
                    if (donorResponse.ok) {
                      const donorData = await donorResponse.json()
                      donorInfoMap.set(key, {
                        id: donorData.id,
                        tipo: "Pessoa Física",
                        name: donorData.name,
                        email: donorData.email,
                      })
                    }
                  } catch (error) {
                    console.error(`Error fetching pessoa fisica ${donation.usuariofisicoId}:`, error)
                  }
                }
              } else if (donation.usuariojuridicoId) {
                const key = `juridica-${donation.usuariojuridicoId}`
                if (!donorInfoMap.has(key)) {
                  try {
                    const donorResponse = await fetch(`${API_URL}/pessoasJuridicas/${donation.usuariojuridicoId}`)
                    if (donorResponse.ok) {
                      const donorData = await donorResponse.json()
                      donorInfoMap.set(key, {
                        id: donorData.id,
                        tipo: "Pessoa Jurídica",
                        name: donorData.name,
                        email: donorData.email,
                      })
                    }
                  } catch (error) {
                    console.error(`Error fetching pessoa juridica ${donation.usuariojuridicoId}:`, error)
                  }
                }
              }
            }),
          )

          setDonorsInfo(donorInfoMap)
        } else {
          console.error("Failed to fetch donations data")
        }
      } catch (error) {
        console.error("Error fetching donations data:", error)
      } finally {
        setDonationsLoading(false)
      }
    }

    fetchDonationsData()
  }, [])

  // Add this useEffect to fetch disposals data
  useEffect(() => {
    const fetchDisposalsData = async () => {
      try {
        setDisposalsLoading(true)
        const response = await fetch(`http://localhost:3456/descartes`)

        if (response.ok) {
          const disposalsData: DisposalData[] = await response.json()
          setDisposals(disposalsData)

          // Calculate statistics
          const totalDisposals = disposalsData.length
          // Mês e ano selecionados
          const selectedMonthNumber = selectedMonth;
          const selectedYearNumber = selectedYear;

          // Descartes do mês/ano selecionados
          const thisMonthDisposals = disposalsData.filter((d) => {
            const date = new Date(d.data);
            return date.getMonth() === selectedMonthNumber && date.getFullYear() === selectedYearNumber;
          }).length;

          // Calcular descartes por mês/ano
          const monthlyData: Record<string, number> = {};
          disposalsData.forEach((disposal) => {
            const date = new Date(disposal.data);
            const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
            if (!monthlyData[monthYear]) {
              monthlyData[monthYear] = 0;
            }
            monthlyData[monthYear]++;
          });

          setDisposalStats({
            total: totalDisposals,
            thisMonth: thisMonthDisposals,
            monthlyData,
          });

          // Fetch student information for each disposal
          const studentInfoMap = new Map<number, StudentInfo>()

          await Promise.all(
            disposalsData
              .filter((disposal) => disposal.alunoId)
              .map(async (disposal) => {
                if (disposal.alunoId && !studentInfoMap.has(disposal.alunoId)) {
                  try {
                    const studentResponse = await fetch(`${API_URL}/alunos/${disposal.alunoId}`)
                    if (studentResponse.ok) {
                      const studentData = await studentResponse.json()
                      studentInfoMap.set(disposal.alunoId, {
                        id: studentData.id,
                        name: studentData.name,
                        email: studentData.email,
                        matricula: studentData.matricula,
                        curso: studentData.curso,
                        dias: studentData.dias,
                        bolsistaTipo: studentData.bolsistaTipo,
                        cargo: studentData.cargo,
                      })
                    }
                  } catch (error) {
                    console.error(`Error fetching student ${disposal.alunoId}:`, error)
                  }
                }
              }),
          )

          setStudentInfoMap(studentInfoMap)
        } else {
          console.error("Failed to fetch disposals data")
        }
      } catch (error) {
        console.error("Error fetching disposals data:", error)
      } finally {
        setDisposalsLoading(false)
      }
    }

    fetchDisposalsData()
  }, [selectedMonth, selectedYear])

  // Atualizar para buscar eletrônicos de todas as rotas fornecidas e calcular o total
  useEffect(() => {
    const fetchElectronics = async () => {
      try {
        const endpoints = [
          { url: "estabilizadores", type: "Estabilizador" },
          { url: "fontesDeAlimentacao", type: "Fonte de Alimentação" },
          { url: "gabinetes", type: "Gabinete" },
          { url: "hds", type: "HD" },
          { url: "impressoras", type: "Impressora" },
          { url: "monitores", type: "Monitor" },
          { url: "notebooks", type: "Notebook" },
          { url: "placasMae", type: "Placa Mãe" },
          { url: "processadores", type: "Processador" },
          { url: "teclados", type: "Teclado" },
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`http://localhost:3456/${endpoint.url}`).then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                // Adiciona o tipo para cada item
                return data.map((item: any) => ({ ...item, tipo: endpoint.type }));
              }
              return [];
            })
          )
        );

        const allElectronics = responses.flat();
        setElectronics(allElectronics);
      } catch (error) {
        console.error("Error fetching electronics:", error);
      }
    };

    fetchElectronics();
  }, []);

  // Resetar filtros quando mudar de tipo
  useEffect(() => {
    if (currentFilterType !== "" && currentFilterType !== activeTab) {
      setSearchTerm("")
      setStatusFilter("all")
      setCurrentFilterType(activeTab)
    } else if (currentFilterType === "") {
      setCurrentFilterType(activeTab)
    }
  }, [activeTab, currentFilterType])

  const handleStatusUpdate = async (id: string, status: string, type: string) => {
    setIsLoading(true)
    try {
      // Implement status update logic here
      console.log(`Updating ${type} ${id} to ${status}`)
      // After successful update, you might want to refresh the data
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função utilitária para normalizar status (igual do modal)
  function normalizeStatus(status: string | undefined) {
    if (!status) return '';
    const s = status.trim().toUpperCase();
    if (["PENDING", "PENDENTE"].includes(s)) return "PENDING";
    if (["APPROVED", "APROVADO"].includes(s)) return "APPROVED";
    if (["REJECTED", "REJEITADO"].includes(s)) return "REJECTED";
    return s;
  }

  // Função para exibir o badge de status em português
  const getStatusBadgePT = (status: string) => {
    const normalized = normalizeStatus(status);
    const variants = {
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Reprovado" },
    };
    const statusInfo = variants[normalized as keyof typeof variants] || { variant: "secondary", label: status };
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>;
  };

  const handleLogout = () => {
    localStorage.removeItem("userMatricula")
    localStorage.removeItem("userType")
    router.push("/login")
  }

  // Adicione estas funções de manipulação dentro da função CoordinatorAdminPage
  const handleOpenReportModal = (reportId: number) => {
    setSelectedReport(reportId)
    setIsReportModalOpen(true)
  }

  const handleOpenNewMissionModal = () => {
    setSelectedMission(null)
    setIsMissionFormOpen(true)
  }

  const handleOpenEditMissionModal = (missionId: number) => {
    setSelectedMission(missionId)
    setIsMissionFormOpen(true)
  }

  // Adicione estas funções de manipulação dentro da função CoordinatorAdminPage
  const handleOpenNewScheduleModal = () => {
    setSelectedSchedule(null)
    setIsScheduleFormOpen(true)
  }

  const handleOpenEditScheduleModal = (scheduleId: number) => {
    setSelectedSchedule(scheduleId)
    setIsScheduleFormOpen(true)
  }

  // Modifique a função renderFilterPanel para resetar os filtros quando mudar de aba

  const renderFilterPanel = (type: string) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendentes</SelectItem>
                  <SelectItem value="APPROVED">Aprovados</SelectItem>
                  <SelectItem value="REJECTED">Rejeitados</SelectItem>
                  {type === "assigned-missions" && <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "requests" && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Urgência</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por urgência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(type === "weekly-reports" || type === "assigned-missions") && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os alunos</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // Add this helper function to get donor info
  const getDonorInfo = (donation: DonationData) => {
    if (donation.usuariofisicoId) {
      return donorsInfo.get(`fisica-${donation.usuariofisicoId}`) || { name: "Desconhecido", tipo: "Pessoa Física" }
    } else if (donation.usuariojuridicoId) {
      return (
        donorsInfo.get(`juridica-${donation.usuariojuridicoId}`) || { name: "Desconhecido", tipo: "Pessoa Jurídica" }
      )
    }
    return { name: donation.nomeOuEmpresa, tipo: "Desconhecido" }
  }

  // Add this helper function to get student info
  const getStudentInfo = (alunoId?: number) => {
    if (!alunoId) return { name: "Não atribuído" }
    return studentInfoMap.get(alunoId) || { name: "Desconhecido" }
  }

  // Add this function to count equipment items
  const countEquipmentItems = (donation: DonationData) => {
    let total = 0
    if (donation.tecladosCount) total += donation.tecladosCount
    if (donation.hdsCount) total += donation.hdsCount
    if (donation.fontesDeAlimentacaoCount) total += donation.fontesDeAlimentacaoCount
    if (donation.gabinetesCount) total += donation.gabinetesCount
    if (donation.monitoresCount) total += donation.monitoresCount
    if (donation.mousesCount) total += donation.mousesCount
    if (donation.estabilizadoresCount) total += donation.estabilizadoresCount
    if (donation.impressorasCount) total += donation.impressorasCount
    if (donation.placasmaeCount) total += donation.placasmaeCount
    if (donation.notebooksCount) total += donation.notebooksCount
    if (donation.processadoresCount) total += donation.processadoresCount
    return total || 1 // Return at least 1 if no counts are available
  }

  // Add this function to get equipment description
  const getEquipmentDescription = (donation: DonationData) => {
    const items = []
    if (donation.tecladosCount) items.push(`Teclados (${donation.tecladosCount})`)
    if (donation.hdsCount) items.push(`HDs (${donation.hdsCount})`)
    if (donation.fontesDeAlimentacaoCount) items.push(`Fontes (${donation.fontesDeAlimentacaoCount})`)
    if (donation.gabinetesCount) items.push(`Gabinetes (${donation.gabinetesCount})`)
    if (donation.monitoresCount) items.push(`Monitores (${donation.monitoresCount})`)
    if (donation.mousesCount) items.push(`Mouses (${donation.mousesCount})`)
    if (donation.estabilizadoresCount) items.push(`Estabilizadores (${donation.estabilizadoresCount})`)
    if (donation.impressorasCount) items.push(`Impressoras (${donation.impressorasCount})`)
    if (donation.placasmaeCount) items.push(`Placas-mãe (${donation.placasmaeCount})`)
    if (donation.notebooksCount) items.push(`Notebooks (${donation.notebooksCount})`)
    if (donation.processadoresCount) items.push(`Processadores (${donation.processadoresCount})`)

    return items.length > 0 ? items.join(", ") : donation.descricao
  }

  const handleOpenModal = (
    id: number,
    type: "project" | "user" | "request" | "disposal" | "electronic",
    electronicType?: string,
  ) => {
    setSelectedItem({ id, type, electronicType })
    setIsModalOpen(true)
  }

  const handleOpenStudentModal = (student: StudentData) => {
    setSelectedStudent(student.id)
    setIsStudentModalOpen(true)
  }

  const handleOpenDonationModal = (id: number, type: "project" | "user") => {
    setSelectedDonation({ id, type })
    setIsDonationModalOpen(true)
  }

  const handleOpenDisposalModal = (id: number) => {
    setSelectedDisposal(id)
    setIsDisposalModalOpen(true)
  }

  const handleOpenElectronicModal = (id: number, type?: string) => {
    setSelectedElectronic({ id, type })
    setIsElectronicModalOpen(true)
  }

  // Função para filtrar os alunos com base no termo de pesquisa e status
  const getFilteredStudents = () => {
    return students.filter((student) => {
      // Filtro de pesquisa (case-insensitive)
      const matchesSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.curso.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de status (normalizado)
      const normalizedStudentStatus = normalizeStatus(student.status);
      const normalizedFilterStatus = normalizeStatus(statusFilter);
      const matchesStatus =
        statusFilter === "all" ||
        (normalizedFilterStatus !== '' && normalizedStudentStatus === normalizedFilterStatus);

      // Retorna true se o aluno corresponder a ambos os filtros
      return matchesSearch && matchesStatus;
    });
  }

  // Adicione estas funções de filtragem logo após a função getFilteredStudents()

  // Função para filtrar doações de projetos
  const getFilteredProjectDonations = () => {
    return projectDonations.filter((donation) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        donation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.nomeOuEmpresa?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === "all" || donation.status === statusFilter

      // Retorna true se a doação corresponder a ambos os filtros
      return matchesSearch && matchesStatus
    })
  }

  // Função para filtrar doações de usuários
  const getFilteredUserDonations = () => {
    return userDonations.filter((donation) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        donation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.eletronicos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.descricao.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === "all" || donation.status === statusFilter

      // Retorna true se a doação corresponder a ambos os filtros
      return matchesSearch && matchesStatus
    })
  }

  // Função para filtrar solicitações de estudantes
  const getFilteredStudentRequests = () => {
    return studentRequests.filter((request) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.eletronicos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.descricao.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === "all" || request.status === statusFilter

      // Retorna true se a solicitação corresponder a ambos os filtros
      return matchesSearch && matchesStatus
    })
  }

  // Função para filtrar relatórios semanais
  const getFilteredWeeklyReports = () => {
    return weeklyReports.filter((report) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === "all" || report.status === statusFilter

      // Retorna true se o relatório corresponder a ambos os filtros
      return matchesSearch && matchesStatus
    })
  }

  // Função para filtrar missões atribuídas
  const getFilteredAssignedMissions = () => {
    return assignedMissions.filter((mission) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === "all" || mission.status === statusFilter

      // Retorna true se a missão corresponder a ambos os filtros
      return matchesSearch && matchesStatus
    })
  }

  // Add this function to filter disposals
  const getFilteredDisposals = () => {
    return disposals.filter((disposal) => {
      // Filter by search term
      const studentInfo = getStudentInfo(disposal.alunoId)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        disposal.descricao.toLowerCase().includes(searchLower) ||
        disposal.metodoDeDescarte?.toLowerCase().includes(searchLower) ||
        studentInfo.name.toLowerCase().includes(searchLower)

      // Filter by status if needed
      const matchesStatus =
        statusFilter === "all" ||
        disposal.status.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter === "concluido" && disposal.status === "COMPLETED") ||
        (statusFilter === "agendado" && disposal.status === "SCHEDULED") ||
        (statusFilter === "processamento" && disposal.status === "IN_PROGRESS")

      // Filter by month if activeMonth is set
      const disposalDate = new Date(disposal.data)
      const disposalMonth = disposalDate.toLocaleString("default", { month: "long" })
      const matchesMonth = !activeMonth || disposalMonth.toLowerCase() === activeMonth.toLowerCase()

      return matchesSearch && matchesStatus && matchesMonth
    })
  }

  // Função para filtrar eletrônicos
  const getFilteredElectronics = () => {
    return electronics.filter((electronic) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        electronic.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        electronic.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (electronic.modelo && electronic.modelo.toLowerCase().includes(searchTerm.toLowerCase()))

      // Não há filtro de status para eletrônicos, então retornamos apenas com base na pesquisa
      return matchesSearch
    })
  }

  // Função para atualizar a lista de inscritos
  const handleRefreshInscritos = async () => {
    try {
      const response = await fetch('http://localhost:3456/inscritos');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Erro ao atualizar lista de inscritos');
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de inscritos:', error);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Painel do Coordenador</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <p className="font-medium">{coordinatorData?.name}</p>
            <p className="text-muted-foreground">{coordinatorData?.departamento}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback>{coordinatorData?.name?.charAt(0) || "C"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="inscritos" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="inscritos">Inscritos</TabsTrigger>
          <TabsTrigger value="relatorio">Relatório</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="project-donations">Doação Projeto</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="weekly-reports">Relatórios Semanais</TabsTrigger>
          <TabsTrigger value="assigned-missions">Missões</TabsTrigger>
        </TabsList>

        <TabsContent value="project-donations">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("project-donations")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Doações para Projetos</CardTitle>
                  <CardDescription>Gerencie as doações para projetos.</CardDescription>
                </div>
                <Button>Aprovar Selecionados</Button>
              </CardHeader>
              <CardContent>
                {getFilteredProjectDonations().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input type="checkbox" className="h-4 w-4" />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredProjectDonations().map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell>
                          <TableCell>#{donation.id}</TableCell>
                          <TableCell>{donation.name}</TableCell>
                          <TableCell>{donation.descricao}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(donation.data).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadgePT(donation.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(donation.id, "project")}>
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Nenhuma doação encontrada com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("requests")}
            <Card>
              <CardHeader>
                <CardTitle>Solicitações</CardTitle>
                <CardDescription>Gerencie as solicitações feitas por pessoas físicas ou jurídicas.</CardDescription>
              </CardHeader>
              <CardContent>
                {getFilteredStudentRequests().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input type="checkbox" className="h-4 w-4" />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Eletrônicos</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredStudentRequests().map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell>
                          <TableCell>#{request.id}</TableCell>
                          <TableCell>{request.name}</TableCell>
                          <TableCell>{request.eletronicos}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(request.data).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadgePT(request.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(request.id, "request")}>
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Nenhuma solicitação encontrada com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly-reports">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("weekly-reports")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Relatórios Semanais</CardTitle>
                  <CardDescription>Avalie os relatórios semanais enviados pelos alunos.</CardDescription>
                </div>
                <Select defaultValue="all" onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="PENDING">Pendentes</SelectItem>
                    <SelectItem value="APPROVED">Aprovados</SelectItem>
                    <SelectItem value="REJECTED">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {getFilteredWeeklyReports().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Semana</TableHead>
                        <TableHead>Data de Envio</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredWeeklyReports().map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>#{report.id}</TableCell>
                          <TableCell>{report.studentName}</TableCell>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{report.week}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(report.submissionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadgePT(report.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleOpenReportModal(report.id)}>
                              Avaliar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Nenhum relatório encontrado com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assigned-missions">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("assigned-missions")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Missões</CardTitle>
                  <CardDescription>Gerencie as missões atribuídas aos alunos.</CardDescription>
                </div>
                <Button onClick={handleOpenNewMissionModal}>Nova Missão</Button>
              </CardHeader>
              <CardContent>
                {getFilteredAssignedMissions().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Aluno Designado</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAssignedMissions().map((mission) => (
                        <TableRow key={mission.id}>
                          <TableCell>#{mission.id}</TableCell>
                          <TableCell>{mission.title}</TableCell>
                          <TableCell>{mission.assignedTo}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(mission.deadline).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadgePT(mission.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleOpenEditMissionModal(mission.id)}>
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Nenhuma missão encontrada com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="inscritos">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("inscritos")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Alunos Inscritos</CardTitle>
                  <CardDescription>Gerencie os alunos inscritos no programa.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRefreshInscritos}>Atualizar</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Dias</TableHead>
                      <TableHead>Bolsista</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredStudents().map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>#{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.matricula}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.curso}</TableCell>
                        <TableCell>{student.periodo}</TableCell>
                        <TableCell>{student.dias}</TableCell>
                        <TableCell>{student.bolsistaTipo || "N/A"}</TableCell>
                        <TableCell>{getStatusBadgePT(student.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleOpenStudentModal(student)}>
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getFilteredStudents().length === 0 && (
                  <div className="text-center py-4">
                    <p>Nenhum aluno encontrado com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorio">
          <Tabs defaultValue="doacoes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="doacoes">Doações</TabsTrigger>
              <TabsTrigger value="descartes">Descartes</TabsTrigger>
              <TabsTrigger value="eletronicos-relatorio">Eletrônicos</TabsTrigger>
              <TabsTrigger value="user-donations-relatorio">Doação Usuário</TabsTrigger>
            </TabsList>

            <TabsContent value="doacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Doações</CardTitle>
                  <CardDescription>Visualize estatísticas e dados sobre as doações recebidas.</CardDescription>
                </CardHeader>
                <CardContent>
                  {donationsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Carregando dados de doações...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{donationsStats.total}</div>
                              <p className="text-xs text-muted-foreground">Total de Doações</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{donationsStats.pessoaFisica}</div>
                              <p className="text-xs text-muted-foreground">Pessoa Física</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{donationsStats.pessoaJuridica}</div>
                              <p className="text-xs text-muted-foreground">Pessoa Jurídica</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Histórico de Doações</h3>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[250px]"
                          />
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filtrar por tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os tipos</SelectItem>
                              <SelectItem value="fisica">Pessoa Física</SelectItem>
                              <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Doador</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donations.length > 0 ? (
                            donations
                              .filter((donation) => {
                                // Filter by search term
                                const donorInfo = getDonorInfo(donation)
                                const searchLower = searchTerm.toLowerCase()
                                return (
                                  searchTerm === "" ||
                                  donation.name.toLowerCase().includes(searchLower) ||
                                  donation.descricao.toLowerCase().includes(searchLower) ||
                                  donorInfo.name.toLowerCase().includes(searchLower)
                                )
                              })
                              .map((donation) => {
                                const donorInfo = getDonorInfo(donation)
                                return (
                                  <TableRow key={donation.id}>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        {new Date(donation.data).toLocaleDateString()}
                                      </div>
                                    </TableCell>
                                    <TableCell>{donorInfo.name}</TableCell>
                                    <TableCell>{donorInfo.tipo}</TableCell>
                                    <TableCell>{getEquipmentDescription(donation)}</TableCell>
                                    <TableCell>{countEquipmentItems(donation)}</TableCell>
                                    <TableCell>{getStatusBadgePT(donation.status)}</TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenDonationModal(donation.id, "project")}
                                      >
                                        Ver Detalhes
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4">
                                Nenhuma doação encontrada.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="descartes">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Descartes</CardTitle>
                  <CardDescription>Visualize os descartes realizados por período.</CardDescription>
                </CardHeader>
                <CardContent>
                  {disposalsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Carregando dados de descartes...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-wrap justify-center gap-6 mb-8 mt-2">
                        <Card className="w-64 shadow-sm">
                          <CardContent className="py-6 px-2 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">{disposalStats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total de Descartes</p>
                          </CardContent>
                        </Card>
                        <Card className="w-64 shadow-sm">
                          <CardContent className="py-6 px-2 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">{disposalStats.thisMonth}</div>
                            <p className="text-xs text-muted-foreground mt-1">Descartes este Mês</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Descartes por Mês</h3>
                          <Select defaultValue={selectedYear.toString()} value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {[2023, 2024, 2025].map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
                            const now = new Date();
                            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                            const currentMonth = now.getMonth();
                            const currentYear = now.getFullYear();
                            let monthsToShow: { monthIndex: number, year: number }[] = [];
                            for (let i = 0; i < 4; i++) {
                              let monthIndex = currentMonth - i;
                              let year = currentYear;
                              if (monthIndex < 0) {
                                monthIndex += 12;
                                year--;
                              }
                              monthsToShow.push({ monthIndex, year });
                            }
                            // Filtrar apenas os meses do ano selecionado
                            monthsToShow = monthsToShow.filter(m => m.year === selectedYear);
                            // Ordenar do mais antigo para o mais recente
                            monthsToShow.sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthIndex - b.monthIndex);
                            return monthsToShow.map(({ monthIndex, year }) => {
                              const monthYear = `${monthIndex}-${year}`;
                              const disposalCount = disposalStats.monthlyData[monthYear] || 0;
                              const monthName = months[monthIndex];
                              return (
                                <Button
                                  key={monthYear}
                                  variant="outline"
                                  className={`h-auto py-6 flex flex-col items-center justify-center ${activeMonth === monthName ? "border-primary" : ""}`}
                                  onClick={() => setActiveMonth(monthName)}
                                >
                                  <span className="text-lg font-bold">{monthName}</span>
                                  <span className="text-sm text-muted-foreground mt-1">{year}</span>
                                  <span className="text-xs bg-primary/10 px-2 py-1 rounded-full mt-2">
                                    {disposalCount} descartes
                                  </span>
                                </Button>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            Descartes de {activeMonth} {selectedYear}
                          </h3>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Pesquisar..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-[250px]"
                            />
                            <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                                <SelectItem value="agendado">Agendado</SelectItem>
                                <SelectItem value="processamento">Em processamento</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição do Descarte</TableHead>
                              <TableHead>Responsável</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Destino</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredDisposals().length > 0 ? (
                              getFilteredDisposals().map((disposal) => {
                                const studentInfo = getStudentInfo(disposal.alunoId)
                                return (
                                  <TableRow key={disposal.id}>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        {new Date(disposal.data).toLocaleDateString()}
                                      </div>
                                    </TableCell>
                                    <TableCell>{disposal.descricao}</TableCell>
                                    <TableCell>{studentInfo.name}</TableCell>
                                    <TableCell>{disposal.quantidade} itens</TableCell>
                                    <TableCell>{disposal.metodoDeDescarte}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          disposal.status === "COMPLETED" || disposal.status === "Concluído"
                                            ? "success"
                                            : disposal.status === "SCHEDULED" || disposal.status === "Agendado"
                                              ? "outline"
                                              : "default"
                                        }
                                      >
                                        {disposal.status === "COMPLETED"
                                          ? "Concluído"
                                          : disposal.status === "SCHEDULED"
                                            ? "Agendado"
                                            : disposal.status === "IN_PROGRESS"
                                              ? "Em processamento"
                                              : disposal.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenDisposalModal(disposal.id)}
                                      >
                                        Ver Detalhes
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                  Nenhum descarte encontrado com os filtros selecionados.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eletronicos-relatorio">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Eletrônicos</CardTitle>
                  <CardDescription>Visualize estatísticas e dados sobre os equipamentos eletrônicos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{electronics.length}</div>
                            <p className="text-xs text-muted-foreground">Total de Equipamentos</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">187</div>
                            <p className="text-xs text-muted-foreground">Funcionando</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">155</div>
                            <p className="text-xs text-muted-foreground">Para Reparo</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Eletrônicos Cadastrados por Mês</h3>
                        <Select defaultValue="2023">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="2021">2021</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"].map((month, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="h-auto py-6 flex flex-col items-center justify-center"
                            onClick={() => (setActiveMonth ? setActiveMonth(month) : null)}
                          >
                            <span className="text-lg font-bold">{month}</span>
                            <span className="text-sm text-muted-foreground mt-1">2023</span>
                            <span className="text-xs bg-primary/10 px-2 py-1 rounded-full mt-2">
                              {[24, 36, 42, 28, 35, 18][index]} eletrônicos
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Eletrônicos de {activeMonth} 2023</h3>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[250px]"
                          />
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filtrar por status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os status</SelectItem>
                              <SelectItem value="funcionando">Funcionando</SelectItem>
                              <SelectItem value="reparo">Para Reparo</SelectItem>
                              <SelectItem value="descarte">Para Descarte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Número de Série</TableHead>
                            <TableHead>Condição</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>25/05/2023</TableCell>
                            <TableCell>Laptop Dell Latitude E6440</TableCell>
                            <TableCell>DL7890123</TableCell>
                            <TableCell>Funcional - Bateria fraca</TableCell>
                            <TableCell>Doação - Empresa XYZ</TableCell>
                            <TableCell>
                              <Badge variant="success">Disponível</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenElectronicModal(1, "notebook")}
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>22/05/2023</TableCell>
                            <TableCell>Monitor LG 24" LED</TableCell>
                            <TableCell>LG1234567</TableCell>
                            <TableCell>Funcional - Perfeito</TableCell>
                            <TableCell>Doação - Carlos Eduardo</TableCell>
                            <TableCell>
                              <Badge variant="outline">Reservado</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenElectronicModal(2, "monitor")}
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>18/05/2023</TableCell>
                            <TableCell>Desktop HP EliteDesk 800</TableCell>
                            <TableCell>HP4567890</TableCell>
                            <TableCell>Funcional - Completo</TableCell>
                            <TableCell>Doação - Instituto Tecnologia</TableCell>
                            <TableCell>
                              <Badge>Em manutenção</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenElectronicModal(3, "desktop")}
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>15/05/2023</TableCell>
                            <TableCell>Impressora Brother MFC-L2740DW</TableCell>
                            <TableCell>BR7654321</TableCell>
                            <TableCell>Necessita reparo - Sem toner</TableCell>
                            <TableCell>Doação - Escola Municipal</TableCell>
                            <TableCell>
                              <Badge>Em avaliação</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenElectronicModal(4, "impressora")}
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>10/05/2023</TableCell>
                            <TableCell>Tablet Samsung Galaxy Tab A</TableCell>
                            <TableCell>SM9876543</TableCell>
                            <TableCell>Funcional - Tela trincada</TableCell>
                            <TableCell>Doação - Ana Beatriz</TableCell>
                            <TableCell>
                              <Badge variant="success">Disponível</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenElectronicModal(5, "tablet")}
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user-donations-relatorio">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Doações de Usuários</CardTitle>
                  <CardDescription>
                    Visualize estatísticas e dados sobre doações feitas por usuários individuais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{userDonations.length}</div>
                            <p className="text-xs text-muted-foreground">Total de Doações</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {
                                userDonations.filter((d) => new Date(d.data).getMonth() === new Date().getMonth())
                                  .length
                              }
                            </div>
                            <p className="text-xs text-muted-foreground">Doações este Mês</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Histórico de Doações de Usuários</h3>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Pesquisar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-[250px]"
                        />
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os status</SelectItem>
                            <SelectItem value="APPROVED">Aprovadas</SelectItem>
                            <SelectItem value="PENDING">Pendentes</SelectItem>
                            <SelectItem value="REJECTED">Rejeitadas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {getFilteredUserDonations().length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Eletrônicos</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredUserDonations().map((donation) => (
                            <TableRow key={donation.id}>
                              <TableCell>#{donation.id}</TableCell>
                              <TableCell>{donation.name}</TableCell>
                              <TableCell>{donation.eletronicos}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                  {new Date(donation.data).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadgePT(donation.status)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenDonationModal(donation.id, "user")}
                                >
                                  Ver Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <p>Nenhuma doação de usuário encontrada com os filtros selecionados.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="horarios">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Horários dos Alunos</CardTitle>
                  <CardDescription>Gerencie os horários de atendimento dos alunos.</CardDescription>
                </div>
                <Button onClick={handleOpenNewScheduleModal}>Adicionar Horário</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dia</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Segunda-feira</TableCell>
                      <TableCell>08:00 - 12:00</TableCell>
                      <TableCell>João Silva</TableCell>
                      <TableCell>
                        <Badge variant="outline">Bolsista FACAPE</Badge>
                      </TableCell>
                      <TableCell>Técnico de Manutenção</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(1)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Segunda-feira</TableCell>
                      <TableCell>14:00 - 18:00</TableCell>
                      <TableCell>Maria Santos</TableCell>
                      <TableCell>
                        <Badge variant="outline">Bolsista FACAPE</Badge>
                      </TableCell>
                      <TableCell>Atendente</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(2)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Terça-feira</TableCell>
                      <TableCell>08:00 - 12:00</TableCell>
                      <TableCell>Pedro Oliveira</TableCell>
                      <TableCell>
                        <Badge variant="outline">ProUni</Badge>
                      </TableCell>
                      <TableCell>Catalogador</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(3)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Terça-feira</TableCell>
                      <TableCell>14:00 - 18:00</TableCell>
                      <TableCell>Ana Costa</TableCell>
                      <TableCell>
                        <Badge variant="outline">Regular</Badge>
                      </TableCell>
                      <TableCell>Auxiliar Administrativo</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(4)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Quarta-feira</TableCell>
                      <TableCell>08:00 - 12:00</TableCell>
                      <TableCell>Carlos Souza</TableCell>
                      <TableCell>
                        <Badge variant="outline">ProUni</Badge>
                      </TableCell>
                      <TableCell>Técnico de Reparo</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(5)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dias sem Funcionamento</CardTitle>
                <CardDescription>
                  Selecione os dias em que o RECOM não funcionará (além de sábados e domingos).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium block mb-3">Selecione os dias sem funcionamento</Label>
                    <div className="grid grid-cols-7 gap-3 mt-2">
                      {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center cursor-pointer border-2 ${
                              index === 0 || index === 6
                                ? "bg-red-100 text-red-600 border-red-300"
                                : "bg-background border-muted-foreground/20 hover:border-red-300 hover:bg-red-50"
                            }`}
                          >
                            {day.charAt(0)}
                          </div>
                          <span className="text-xs mt-1 text-muted-foreground">{day}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Nota: O RECOM não funciona aos sábados e domingos. Selecione dias adicionais de fechamento, como
                      feriados ou dias de manutenção.
                    </p>
                  </div>

                  <div className="border rounded-lg p-5 bg-muted/10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-medium">
                        Calendário {new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" })}{" "}
                        {selectedYear}
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={selectedMonth.toString()}
                          onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {new Date(2023, i).toLocaleString("default", { month: "long" })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedYear.toString()}
                          onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {[2023, 2024, 2025].map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                        <div key={index} className="text-xs font-medium">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
                        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()

                        // Array para os dias do mês
                        const days = []

                        // Adicionar espaços vazios para os dias antes do primeiro dia do mês
                        for (let i = 0; i < firstDayOfMonth; i++) {
                          days.push(<div key={`empty-${i}`} className="h-9"></div>)
                        }

                        // Adicionar os dias do mês
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(selectedYear, selectedMonth, day)
                          const dayOfWeek = date.getDay()
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                          const dateString = date.toISOString().split("T")[0]
                          const isClosed = closedDates.has(dateString)

                          days.push(
                            <div
                              key={day}
                              className={`h-9 text-xs flex items-center justify-center rounded cursor-pointer transition-colors ${
                                isWeekend
                                  ? "bg-red-100 text-red-600"
                                  : isClosed
                                    ? "bg-red-100 text-red-600"
                                    : "bg-green-100 text-green-600 hover:bg-red-50"
                              }`}
                              onClick={() => {
                                if (!isWeekend) {
                                  const newClosedDates = new Set(closedDates)
                                  if (isClosed) {
                                    newClosedDates.delete(dateString)
                                  } else {
                                    newClosedDates.add(dateString)
                                  }
                                  setClosedDates(newClosedDates)
                                }
                              }}
                            >
                              {day}
                            </div>,
                          )
                        }

                        return days
                      })()}
                    </div>
                    <div className="mt-4 text-xs flex flex-col gap-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                        <span className="text-muted-foreground">Dias de funcionamento</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                        <span className="text-muted-foreground">
                          Dias sem funcionamento (finais de semana e feriados)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-3">Calendário Anual - {selectedYear}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 12 }, (_, monthIndex) => {
                          const monthName = new Date(selectedYear, monthIndex).toLocaleString("default", {
                            month: "long",
                          })
                          const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate()
                          const firstDayOfMonth = new Date(selectedYear, monthIndex, 1).getDay()

                          return (
                            <div key={monthIndex} className="border rounded p-2">
                              <div className="text-xs font-medium mb-2 capitalize">{monthName}</div>
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                                  <div key={i} className="text-[10px]">
                                    {day}
                                  </div>
                                ))}

                                {/* Espaços vazios para os dias antes do primeiro dia do mês */}
                                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                                  <div key={`empty-${i}`} className="h-5"></div>
                                ))}

                                {/* Dias do mês */}
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                  const day = i + 1
                                  const date = new Date(selectedYear, monthIndex, day)
                                  const dayOfWeek = date.getDay()
                                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                                  const dateString = date.toISOString().split("T")[0]
                                  const isClosed = closedDates.has(dateString)

                                  return (
                                    <div
                                      key={day}
                                      className={`h-5 text-[10px] flex items-center justify-center rounded-sm cursor-pointer ${
                                        isWeekend || isClosed
                                          ? "bg-red-100 text-red-600"
                                          : "bg-green-100 text-green-600"
                                      }`}
                                      onClick={() => {
                                        if (!isWeekend) {
                                          const newClosedDates = new Set(closedDates)
                                          if (isClosed) {
                                            newClosedDates.delete(dateString)
                                          } else {
                                            newClosedDates.add(dateString)
                                          }
                                          setClosedDates(newClosedDates)

                                          // Se o mês clicado não é o mês atualmente exibido no calendário principal,
                                          // atualizar para mostrar esse mês
                                          if (monthIndex !== selectedMonth) {
                                            setSelectedMonth(monthIndex)
                                          }
                                        }
                                      }}
                                    >
                                      {day}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-3">Dias sem Funcionamento Selecionados</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Array.from(closedDates)
                          .sort()
                          .map((dateString) => {
                            const date = new Date(dateString)
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6

                            // Não mostrar finais de semana na lista, pois já são fechados por padrão
                            if (isWeekend) return null

                            return (
                              <div key={dateString} className="flex items-center justify-between border rounded p-2">
                                <span className="text-sm">
                                  {date.toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500"
                                  onClick={() => {
                                    const newClosedDates = new Set(closedDates)
                                    newClosedDates.delete(dateString)
                                    setClosedDates(newClosedDates)
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            )
                          })}
                      </div>
                      {Array.from(closedDates).filter((dateString) => {
                        const date = new Date(dateString)
                        return date.getDay() !== 0 && date.getDay() !== 6
                      }).length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          Nenhum dia adicional sem funcionamento selecionado.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>Salvar Alterações</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemId={selectedItem.id}
          itemType={selectedItem.type}
          electronicType={selectedItem.electronicType}
        />
      )}
      {selectedStudent !== null && (
        <StudentDetailModal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          studentId={selectedStudent}
        />
      )}
      {selectedDonation && (
        <DonationDetailModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          donationId={selectedDonation.id}
          donationType={selectedDonation.type}
        />
      )}
      {selectedDisposal !== null && (
        <DisposalDetailModal
          isOpen={isDisposalModalOpen}
          onClose={() => setIsDisposalModalOpen(false)}
          disposalId={selectedDisposal}
        />
      )}
      {selectedElectronic && (
        <ElectronicDetailModal
          isOpen={isElectronicModalOpen}
          onClose={() => setIsElectronicModalOpen(false)}
          electronicId={selectedElectronic.id}
          electronicType={selectedElectronic.type}
        />
      )}
      {selectedReport !== null && (
        <WeeklyReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportId={selectedReport}
        />
      )}
      {isMissionFormOpen && (
        <MissionFormModal
          isOpen={isMissionFormOpen}
          onClose={() => setIsMissionFormOpen(false)}
          missionId={selectedMission}
        />
      )}
      {isScheduleFormOpen && (
        <ScheduleFormModal
          isOpen={isScheduleFormOpen}
          onClose={() => setIsScheduleFormOpen(false)}
          scheduleId={selectedSchedule}
        />
      )}
    </div>
  )
}
