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
import { useToast } from "@/components/ui/use-toast"

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
  cargo?: string
  horarioInicio?: string
  horarioFim?: string
  horario?: string
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
  createdAt?: string
}

interface Electronic {
  id: number
  nome: string
  tipo: string
  modelo?: string
  estado?: string
  imagem?: string
  situacao?: string
  status?: string
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
  usuarioId?: number // Adicionado para refletir o backend
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
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set())
  const [electronicImages, setElectronicImages] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()
  const [datesToDelete, setDatesToDelete] = useState<Set<string>>(new Set());
  // Adicione o estado para datas a criar
  const [datesToCreate, setDatesToCreate] = useState<Set<string>>(new Set());
  // Adicione um estado para armazenar as datas do backend
  const [backendDates, setBackendDates] = useState<any[]>([]);
  // Adicione um novo estado para inscritos
  const [studentsInscritos, setStudentsInscritos] = useState<StudentData[]>([]);
  // 1. Adicione um estado para mapear id do aluno para nome
  const [missionStudentNames, setMissionStudentNames] = useState<{ [id: number]: string }>({});

  const API_URL = "http://26.99.103.209:3456"

  // Definir variáveis globais para o calendário
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  useEffect(() => {
    // Check if user is logged in as admin
    const userId = localStorage.getItem("userId")
    const userType = localStorage.getItem("userType")

    if (!userId || userType !== "ADMIN") {
      // Redirect to login if not logged in as admin
      console.log("No user ID found or wrong user type. Redirecting to login...")
      router.push("/login")
      return
    }

    // Fetch coordinator data using the ID
    const fetchCoordinatorData = async () => {
      try {
        console.log("Fetching coordinator data for ID:", userId)
        const response = await fetch(`${API_URL}/coordenadores/${userId}`)

        if (response.ok) {
          const data = await response.json()
          console.log("Coordinator data fetched successfully:", data)
          setCoordinatorData(data)
        } else {
          console.error("Failed to fetch coordinator data. Status:", response.status)
          // If coordinator data can't be fetched, redirect to login
          localStorage.removeItem("userId")
          localStorage.removeItem("userType")
          router.push("/login")
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching coordinator data:", error)
        setIsLoading(false)
        // On error, also redirect to login
        localStorage.removeItem("userId")
        localStorage.removeItem("userType")
        router.push("/login")
      }
    }

    fetchCoordinatorData()
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectDonationsRes, userDonationsRes, studentRequestsRes, inscritosRes] = await Promise.all([
          fetch(`${API_URL}/doacoes`),
          fetch(`${API_URL}/doacoesUsuarios`),
          fetch(`${API_URL}/solicitacoes`),
          fetch('http://localhost:3456/inscritos'),
        ])

        if (projectDonationsRes.ok && userDonationsRes.ok && studentRequestsRes.ok && inscritosRes.ok) {
          const projectDonationsData: ProjectDonation[] = await projectDonationsRes.json()
          const userDonationsData: UserDonation[] = await userDonationsRes.json()
          const studentRequestsData: StudentRequest[] = await studentRequestsRes.json()
          // const inscritosDataRaw = await inscritosRes.json()
          // const inscritosData: StudentData[] = inscritosDataRaw.map((item: any) => ({ ... }));
          // setStudents(inscritosData) // REMOVIDO: students deve ser alimentado só pelo fetch de /alunos

          setProjectDonations(projectDonationsData)
          setUserDonations(userDonationsData)
          setStudentRequests(studentRequestsData)
        } else {
          throw new Error("Failed to fetch data")
        }
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
            approvalRate: 0,
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

  // Refatore o carregamento dos responsáveis dos descartes
  useEffect(() => {
    const fetchDisposalsData = async () => {
      try {
        setDisposalsLoading(true)
        const response = await fetch(`http://localhost:3456/descartes`)
        if (response.ok) {
          const disposalsData: DisposalData[] = await response.json()
          setDisposals(disposalsData)

          // Calcule o total de descartes corretamente
          const totalDisposals = disposalsData.length;

          // Calcule os descartes por mês usando createdAt
          const disposalsByMonth: Record<string, number> = {};
          disposalsData.forEach((disposal) => {
            const date = new Date(disposal.createdAt);
            const month = date.getMonth(); // 0-11
            const year = date.getFullYear();
            const key = `${month}-${year}`;
            disposalsByMonth[key] = (disposalsByMonth[key] || 0) + 1;
          });

          // Buscar informações dos responsáveis (alunos) de forma eficiente
          const uniqueUserIds = Array.from(new Set(disposalsData.map(d => d.usuarioId).filter((id): id is number => typeof id === 'number')))
          const studentInfoMap = new Map<number, StudentInfo>()
          await Promise.all(
            uniqueUserIds.map(async (usuarioId) => {
              try {
                const studentResponse = await fetch(`http://localhost:3456/alunos/${usuarioId}`)
                if (studentResponse.ok) {
                  const studentData = await studentResponse.json()
                  studentInfoMap.set(usuarioId, {
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
                console.error(`Error fetching student ${usuarioId}:`, error)
              }
            })
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
          { url: "mouses", type: "Mouse" }, // <-- Adicionado para buscar mouses
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

  useEffect(() => {
    const fetchImages = async () => {
      const newImages: { [key: string]: string } = {};
      await Promise.all(
        electronics.map(async (electronic) => {
          const tipoNormalizado = (electronic.tipo || "").toLowerCase().replace(/[-_ ]/g, "");
          let endpoint = "";
          switch (tipoNormalizado) {
            case "estabilizador":
              endpoint = `estabilizado/${electronic.id}`;
              break;
            case "fontedealimentacao":
              endpoint = `fonteDeAlimentacao/${electronic.id}`;
              break;
            case "gabinete":
              endpoint = `gabinete/${electronic.id}`;
              break;
            case "hd":
              endpoint = `hd/${electronic.id}`;
              break;
            case "impressora":
              endpoint = `impressora/${electronic.id}`;
              break;
            case "monitor":
              endpoint = `monitor/${electronic.id}`;
              break;
            case "notebook":
              endpoint = `notebook/${electronic.id}`;
              break;
            case "placamae":
              endpoint = `placaMae/${electronic.id}`;
              break;
            case "processador":
              endpoint = `processador/${electronic.id}`;
              break;
            case "teclado":
              endpoint = `teclado/${electronic.id}`;
              break;
            default:
              endpoint = "";
          }
          if (endpoint) {
            try {
              const res = await fetch(`http://localhost:3456/imagens/${endpoint}`);
              if (res.ok) {
                const data = await res.json();
                if (data && data.imagem) {
                  newImages[`${electronic.tipo}-${electronic.id}`] = `http://localhost:3456${data.imagem}`;
                }
              }
            } catch (e) {
              // erro ao buscar imagem, ignora
            }
          }
        })
      );
      setElectronicImages(newImages);
    };
    if (electronics.length > 0) fetchImages();
  }, [electronics]);

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
                  placeholder={type === "electronics" ? "Pesquisar por nome..." : "Pesquisar..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Only show status/type filter if not assigned-missions or weekly-reports */}
            {type !== "assigned-missions" && type !== "weekly-reports" && (
              <div className="space-y-2">
                <Label>{type === "electronics" ? "Tipo" : "Status"}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={type === "electronics" ? "Filtrar por tipo" : "Filtrar por status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {type === "electronics" ? (
                      <>
                        <SelectItem value="teclado">Teclado</SelectItem>
                        <SelectItem value="hd">HD</SelectItem>
                        <SelectItem value="fonte">Fonte de Alimentação</SelectItem>
                        <SelectItem value="gabinete">Gabinete</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="mouse">Mouse</SelectItem>
                        <SelectItem value="estabilizador">Estabilizador</SelectItem>
                        <SelectItem value="impressora">Impressora</SelectItem>
                        <SelectItem value="placamae">Placa Mãe</SelectItem>
                        <SelectItem value="notebook">Notebook</SelectItem>
                        <SelectItem value="processador">Processador</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="PENDING">Pendentes</SelectItem>
                        <SelectItem value="APPROVED">Aprovados</SelectItem>
                        <SelectItem value="REJECTED">Rejeitados</SelectItem>
                        {type === "assigned-missions" && <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

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

  // Atualize a função getStudentInfo para buscar pelo usuarioId
  const getStudentInfo = (usuarioId?: number) => {
    if (!usuarioId) return { name: "Não atribuído" }
    return studentInfoMap.get(usuarioId) || { name: "Desconhecido" }
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
  const getFilteredStudents = (list = students) => {
    return list.filter((student) => {
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
        (report.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.content?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de status
      const matchesStatus = statusFilter === "all" || report.status === statusFilter

      // Retorna true se o relatório corresponder a ambos os filtros
      return matchesSearch && matchesStatus
    })
  }

  // Função para filtrar missões atribuídas (ajustada para o novo contrato)
  const getFilteredAssignedMissions = () => {
    return assignedMissions.filter((mission: any) => {
      // Filtro de pesquisa
      const matchesSearch =
        searchTerm === "" ||
        (mission.titulo && mission.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mission.descricao && mission.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

      // Remover filtro de status para missões atribuídas
      return matchesSearch;
    });
  };

  // Add this function to filter disposals
  const getFilteredDisposals = () => {
    return disposals.filter((disposal) => {
      // Filter by search term
      const studentInfo = getStudentInfo(disposal.usuarioId)
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        disposal.descricao?.toLowerCase().includes(searchLower) ||
        disposal.metodoDeDescarte?.toLowerCase().includes(searchLower) ||
        studentInfo.name?.toLowerCase().includes(searchLower)

      // Remover filtro de status
      // Filter by month if activeMonth is set
      const disposalDate = new Date(disposal.data)
      const disposalMonth = disposalDate.toLocaleString("default", { month: "long" })
      const matchesMonth = !activeMonth || disposalMonth.toLowerCase() === activeMonth.toLowerCase()

      return matchesSearch && matchesMonth
    })
  }

  // Função para filtrar eletrônicos
  const getFilteredElectronics = () => {
    return electronics.filter((electronic) => {
      // Filtro de pesquisa por nome
      const matchesSearch =
        searchTerm === "" ||
        (electronic.nome && electronic.nome.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de tipo (case-insensitive, igual ao dropdown)
      const matchesType =
        statusFilter === "all" ||
        (electronic.tipo && electronic.tipo.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesType;
    });
  }

  // Função para atualizar a lista de inscritos
  const handleRefreshInscritos = async () => {
    try {
      const response = await fetch('http://localhost:3456/inscritos');
      if (response.ok) {
        const inscritosDataRaw = await response.json();
        const inscritosData: StudentData[] = inscritosDataRaw.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          email: item.email || '',
          dias: item.dias || '',
          matricula: item.matricula || '',
          curso: item.curso || item.course || '',
          periodo: item.periodo || '',
          bolsistaTipo: item.bolsistaTipo || '',
          status: item.status || '',
          cargo: item.cargo || '',
          horarioInicio: item.horarioInicio || '',
          horarioFim: item.horarioFim || '',
          horario: item.horario || '',
        }));
        setStudentsInscritos(inscritosData);
      } else {
        setStudentsInscritos([]);
      }
    } catch (error) {
      setStudentsInscritos([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectDonationsRes, userDonationsRes, studentRequestsRes, inscritosRes] = await Promise.all([
          fetch(`${API_URL}/doacoes`),
          fetch(`${API_URL}/doacoesUsuarios`),
          fetch(`${API_URL}/solicitacoes`),
          fetch('http://localhost:3456/inscritos'),
        ])

        if (projectDonationsRes.ok && userDonationsRes.ok && studentRequestsRes.ok && inscritosRes.ok) {
          const projectDonationsData: ProjectDonation[] = await projectDonationsRes.json()
          const userDonationsData: UserDonation[] = await userDonationsRes.json()
          const studentRequestsData: StudentRequest[] = await studentRequestsRes.json()
          // const inscritosDataRaw = await inscritosRes.json()
          // const inscritosData: StudentData[] = inscritosDataRaw.map((item: any) => ({ ... }));
          // setStudents(inscritosData) // REMOVIDO: students deve ser alimentado só pelo fetch de /alunos

          setProjectDonations(projectDonationsData)
          setUserDonations(userDonationsData)
          setStudentRequests(studentRequestsData)
        } else {
          throw new Error("Failed to fetch data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchClosedDates = async () => {
      try {
        const res = await fetch('http://localhost:3456/datas');
        const data = await res.json();
        setBackendDates(data); // Salva as datas do backend
        const closed: Set<string> = new Set(
          data
            .filter((d: any) => d.disponibilidade === false)
            .map((d: any) => new Date(d.data).toISOString().split('T')[0])
        );
        setClosedDates(closed);
      } catch (e) { /* erro silencioso */ }
    };
    fetchClosedDates();
  }, [selectedMonth, selectedYear]);

  const handleDayClick = (date: Date, isClosed: boolean, isWeekend: boolean) => {
    if (isWeekend) return;
    const dateString = date.toISOString().split('T')[0];

    if (!isClosed) {
      setDatesToCreate(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dateString)) {
          newSet.delete(dateString);
        } else {
          newSet.add(dateString);
        }
        console.log('Selecionados para criar:', Array.from(newSet));
        return newSet;
      });
    }
  };

  const handleDeleteMark = (dateString: string) => {
    setDatesToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        newSet.delete(dateString);
      } else {
        newSet.add(dateString);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Buscar todas as datas fechadas para obter os IDs
      const res = await fetch('http://localhost:3456/datas');
      const data = await res.json();

      // 1. Criar datas marcadas para criação
      for (const dateString of datesToCreate) {
        // Só cria se não existir já fechada
        if (!closedDates.has(dateString)) {
          // Ajuste para UTC-3 (Brasília): envia 03:00 UTC, que é meia-noite local
          const [year, month, day] = dateString.split('-');
          const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 3, 0, 0));
          await fetch('http://localhost:3456/datas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: date.toISOString(), disponibilidade: false }),
          });
        }
      }

      // 2. Deletar datas marcadas para deleção
      for (const dateString of datesToDelete) {
        // Só deleta se estiver fechada
        if (closedDates.has(dateString)) {
          const dateToDelete = data.find((d: any) => {
            const backendDate = new Date(d.data);
            return backendDate.toISOString().split('T')[0] === dateString;
          });
          if (dateToDelete) {
            await fetch(`http://localhost:3456/datas/${dateToDelete.id}`, {
              method: 'DELETE',
            });
          }
        }
      }

      // Limpar os sets
      setDatesToCreate(new Set());
      setDatesToDelete(new Set());

      // Atualizar a lista de datas fechadas
      const updatedRes = await fetch('http://localhost:3456/datas');
      const updatedData = await updatedRes.json();
      const closed: Set<string> = new Set(
        updatedData
          .filter((d: any) => d.disponibilidade === false)
          .map((d: any) => new Date(d.data).toISOString().split('T')[0])
      );
      setClosedDates(closed);

      toast({
        title: "Alterações salvas",
        description: "As datas foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações. Tente novamente.",
      });
    }
  };

  // Antes do useEffect de relatórios semanais:
  const fetchWeeklyReports = async () => {
    try {
      const response = await fetch('http://localhost:3456/relatorios');
      if (response.ok) {
        const reports = await response.json();
        // Buscar nomes dos alunos em paralelo
        const uniqueUserIds = [...new Set(reports.map((r: any) => r.usuarioId).filter((id: number) => !!id))];
        const userIdToName: Record<number, string> = {};
        await Promise.all(
          uniqueUserIds.map(async (id) => {
            try {
              const res = await fetch(`http://localhost:3456/alunos/${id}`);
              if (res.ok) {
                const aluno = await res.json();
                userIdToName[id] = aluno.name;
              } else {
                userIdToName[id] = 'Desconhecido';
              }
            } catch {
              userIdToName[id] = 'Desconhecido';
            }
          })
        );
        // Montar os dados para a tabela
        const formatted = reports.map((r: any) => ({
          id: r.id,
          studentName: userIdToName[r.usuarioId] || 'Desconhecido',
          title: r.name,
          week: r.periodo,
          submissionDate: r.createdAt,
          status: r.aprovado ? 'APPROVED' : 'PENDING',
          feedback: r.feedback,
          content: r.resumo,
        }));
        setWeeklyReports(formatted);
      } else {
        setWeeklyReports([]);
      }
    } catch (error) {
      setWeeklyReports([]);
    }
  };

  useEffect(() => {
    fetchWeeklyReports();
  }, []);

  // 1. Extraia a função fetchMissions para fora do useEffect para poder reutilizá-la
  const fetchMissions = async () => {
    try {
      const response = await fetch('http://localhost:3456/missoes');
      if (response.ok) {
        const missions = await response.json();
        setAssignedMissions(missions);
        // Buscar nomes dos alunos designados
        const uniqueStudentIds = [...new Set(missions.map((m: any) => Number(m.usuarioId)).filter((id: number) => !!id))] as number[];
        const namesMap: { [id: number]: string } = {};
        await Promise.all(
          uniqueStudentIds.map((id) => {
            return (async () => {
              try {
                const res = await fetch(`http://localhost:3456/alunos/${id}`);
                if (res.ok) {
                  const aluno = await res.json();
                  namesMap[id] = aluno.name;
                } else {
                  namesMap[id] = 'Desconhecido';
                }
              } catch {
                namesMap[id] = 'Desconhecido';
              }
            })();
          })
        );
        setMissionStudentNames(namesMap);
      } else {
        setAssignedMissions([]);
        setMissionStudentNames({});
      }
    } catch (error) {
      setAssignedMissions([]);
      setMissionStudentNames({});
    }
  };

  // 2. No useEffect, apenas chame fetchMissions
  useEffect(() => {
    fetchMissions();
  }, []);

  // Carregue os alunos apenas para a aba de Horários dos Alunos
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetch('http://localhost:3456/alunos');
        if (response.ok) {
          const alunosData = await response.json();
          setStudents(alunosData);
        } else {
          setStudents([]);
        }
      } catch (error) {
        setStudents([]);
      }
    };
    fetchAlunos();
  }, []);

  // Atualize também o botão de atualizar da aba de horários:
  const handleRefreshAlunos = async () => {
    try {
      const response = await fetch('http://localhost:3456/alunos');
      if (response.ok) {
        const alunosData = await response.json();
        setStudents(alunosData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    }
  };

  // Antes do useEffect de solicitações:
  const fetchStudentRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/solicitacoes`);
      if (response.ok) {
        const studentRequestsData: StudentRequest[] = await response.json();
        setStudentRequests(studentRequestsData);
      } else {
        setStudentRequests([]);
      }
    } catch (error) {
      setStudentRequests([]);
    }
  };

  useEffect(() => {
    fetchStudentRequests();
  }, []);

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
                {/* Removido o botão Aprovar Selecionados */}
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
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(donation.id, "project")}>Ver Detalhes</Button>
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
                <div className="flex flex-row items-center justify-between w-full">
                  <div>
                    <CardTitle>Solicitações</CardTitle>
                    <CardDescription>Gerencie as solicitações feitas por pessoas físicas ou jurídicas.</CardDescription>
                  </div>
                  <Button onClick={fetchStudentRequests} variant="outline">Atualizar</Button>
                </div>
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
                              {request.createdAt
                                ? new Date(request.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })
                                : 'Sem data'}
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
                <Button onClick={fetchWeeklyReports} variant="outline">Atualizar</Button>
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
                        {/* <TableHead>Status</TableHead> */}
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
                          {/* <TableCell>{getStatusBadgePT(report.status)}</TableCell> */}
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
                <div className="flex gap-2">
                  <Button onClick={fetchMissions} variant="outline">Atualizar Lista</Button>
                <Button onClick={handleOpenNewMissionModal}>Nova Missão</Button>
                </div>
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
                      {getFilteredAssignedMissions().map((mission: any) => (
                        <TableRow key={mission.id}>
                          <TableCell>#{mission.id}</TableCell>
                          <TableCell>{mission.titulo || '-'}</TableCell>
                          <TableCell>{missionStudentNames[Number(mission.usuarioId)] || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {mission.dataLimite ? new Date(mission.dataLimite).toLocaleDateString() : '-'}
                            </div>
                          </TableCell>
                          <TableCell>{mission.status ? getStatusBadgePT(mission.status) : '-'}</TableCell>
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
                    {getFilteredStudents(studentsInscritos).map((student) => (
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
                {getFilteredStudents(studentsInscritos).length === 0 && (
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
                            <div className="text-2xl font-bold">{disposals.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total de Descartes</p>
                          </CardContent>
                        </Card>
                        <Card className="w-64 shadow-sm">
                          <CardContent className="py-6 px-2 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">{disposals.filter((disposal) => {
                              const date = new Date(disposal.createdAt);
                              const currentMonth = new Date().getMonth() + 1;
                              const currentYear = new Date().getFullYear();
                              return (date.getMonth() + 1) === currentMonth && date.getFullYear() === currentYear;
                            }).length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Descartes este Mês</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Descartes por Mês</h3>
                          <Select
                            value={selectedMonth.toString()}
                            onValueChange={(value) => {
                              const newMonth = Number.parseInt(value);
                              if (
                                selectedYear > currentYear ||
                                (selectedYear === currentYear && newMonth >= currentMonth)
                              ) {
                                setSelectedMonth(newMonth);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Selecione o mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                if (selectedYear === currentYear && i < currentMonth) return null;
                                return (
                                  <SelectItem key={i} value={i.toString()}>
                                    {new Date(2023, i).toLocaleString("default", { month: "long" })}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => {
                              const newYear = Number.parseInt(value);
                              if (newYear > currentYear || newYear === currentYear) {
                                setSelectedYear(newYear);
                                if (newYear > currentYear) setSelectedMonth(0);
                                if (newYear === currentYear && selectedMonth < currentMonth) setSelectedMonth(currentMonth);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {[2023, 2024, 2025].filter(year => year >= currentYear).map((year) => (
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
                            {/* Remover o Select de status aqui */}
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição do Descarte</TableHead>
                              <TableHead>Responsável</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredDisposals().length > 0 ? (
                              getFilteredDisposals().map((disposal) => {
                                const studentInfo = getStudentInfo(disposal.usuarioId)
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
                                <TableCell colSpan={4} className="text-center py-4">
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
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
                      </CardHeader>
                      <CardContent>
                            <div className="text-2xl font-bold">{electronics.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Funcionando</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {electronics.filter(e => e.situacao === "Em estoque").length}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {electronics.filter(e => e.situacao === "Em manutenção").length}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {electronics.filter(e => e.situacao === "Em uso").length}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Lista de Eletrônicos</h3>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Pesquisar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[250px]"
                          />
                          <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filtrar por tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os tipos</SelectItem>
                              <SelectItem value="Teclado">Teclado</SelectItem>
                              <SelectItem value="HD">HD</SelectItem>
                              <SelectItem value="Fonte de Alimentação">Fonte de Alimentação</SelectItem>
                              <SelectItem value="Gabinete">Gabinete</SelectItem>
                              <SelectItem value="Monitor">Monitor</SelectItem>
                              <SelectItem value="Mouse">Mouse</SelectItem>
                              <SelectItem value="Estabilizador">Estabilizador</SelectItem>
                              <SelectItem value="Impressora">Impressora</SelectItem>
                              <SelectItem value="Placa Mãe">Placa Mãe</SelectItem>
                              <SelectItem value="Notebook">Notebook</SelectItem>
                              <SelectItem value="Processador">Processador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredElectronics().length > 0 ? (
                            getFilteredElectronics().map((electronic) => (
                              <TableRow key={`${electronic.tipo}-${electronic.id}`}>
                                <TableCell>#{electronic.id}</TableCell>
                                <TableCell>{electronic.nome}</TableCell>
                                <TableCell>{electronic.tipo}</TableCell>
                                <TableCell>{electronic.modelo || "N/A"}</TableCell>
                                <TableCell>{electronic.status || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      electronic.situacao === "Em estoque"
                                        ? "secondary"
                                        : electronic.situacao === "Em manutenção"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {electronic.situacao}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenElectronicModal(electronic.id, electronic.tipo)}
                                  >
                                    Ver Detalhes
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4">
                                Nenhum eletrônico encontrado com os filtros selecionados.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
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
                <Button variant="outline" onClick={handleRefreshAlunos}>Atualizar</Button>
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
                    {students.length > 0 ? (
                      students.flatMap(student => {
                        const facapeDias = "Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado"
                        if ((student.bolsistaTipo === "FACAPE" || student.bolsistaTipo === "bolsista_facape") && student.dias && student.dias.replace(/\s/g, "") === facapeDias.replace(/\s/g, "")) {
                          // Mostrar apenas uma linha para FACAPE com todos os dias
                          return [
                            <TableRow key={student.id + '-facape'}>
                              <TableCell>SegundaÁSábado</TableCell>
                              <TableCell>{student.horario && student.horario.trim() !== "" ? student.horario : "Não definido"}</TableCell>
                              <TableCell>{student.name}</TableCell>
                      <TableCell>
                                <Badge variant="outline">{student.bolsistaTipo || "N/A"}</Badge>
                      </TableCell>
                              <TableCell>{student.cargo || "Não definido"}</TableCell>
                      <TableCell>
                                <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(student.id)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                          ]
                        } else {
                          // Caso normal: uma linha por dia
                          return (student.dias ? student.dias.split(',').map(dia => dia.trim()) : [""]).map(dia => (
                            <TableRow key={student.id + '-' + dia}>
                              <TableCell>{dia || "Não definido"}</TableCell>
                              <TableCell>{student.horario && student.horario.trim() !== "" ? student.horario : "Não definido"}</TableCell>
                              <TableCell>{student.name}</TableCell>
                      <TableCell>
                                <Badge variant="outline">{student.bolsistaTipo || "N/A"}</Badge>
                      </TableCell>
                              <TableCell>{student.cargo || "Não definido"}</TableCell>
                      <TableCell>
                                <Button size="sm" variant="outline" onClick={() => handleOpenEditScheduleModal(student.id)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                          ))
                        }
                      })
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhum aluno encontrado.
                      </TableCell>
                    </TableRow>
                    )}
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
                          onValueChange={(value) => {
                            const newMonth = Number.parseInt(value);
                            if (
                              selectedYear > currentYear ||
                              (selectedYear === currentYear && newMonth >= currentMonth)
                            ) {
                              setSelectedMonth(newMonth);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              if (selectedYear === currentYear && i < currentMonth) return null;
                              return (
                              <SelectItem key={i} value={i.toString()}>
                                {new Date(2023, i).toLocaleString("default", { month: "long" })}
                              </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedYear.toString()}
                          onValueChange={(value) => {
                            const newYear = Number.parseInt(value);
                            if (newYear > currentYear || (newYear === currentYear && selectedMonth >= currentMonth)) {
                              setSelectedYear(newYear);
                              if (newYear > currentYear) setSelectedMonth(0);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {[2023, 2024, 2025].filter(year => year >= currentYear).map((year) => (
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
                              className={`h-9 text-xs flex items-center justify-center rounded cursor-pointer transition-colors
                                ${isWeekend
                                  ? "bg-red-100 text-red-600 cursor-not-allowed"
                                  : isClosed
                                    ? datesToDelete.has(dateString)
                                      ? "bg-red-100 text-red-600 border-2 border-red-500 line-through"
                                      : "bg-red-100 text-red-600"
                                    : datesToCreate.has(dateString)
                                      ? "bg-blue-100 text-blue-600 border-2 border-blue-500"
                                      : "bg-green-100 text-green-600 hover:bg-blue-50"}
                              `}
                              onClick={() => !isWeekend && handleDayClick(date, isClosed, isWeekend)}
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
                          // Só renderizar meses a partir do mês atual no ano atual
                          if (selectedYear === currentYear && monthIndex < currentMonth) return null;
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
                                      className={`h-5 text-[10px] flex items-center justify-center rounded-sm cursor-pointer transition-colors
                                        ${isWeekend
                                          ? "bg-red-100 text-red-600 cursor-not-allowed"
                                          : isClosed
                                            ? datesToDelete.has(dateString)
                                              ? "bg-red-100 text-red-600 border-2 border-red-500 line-through"
                                              : "bg-red-100 text-red-600"
                                            : datesToCreate.has(dateString)
                                              ? "bg-blue-100 text-blue-600 border-2 border-blue-500"
                                              : "bg-green-100 text-green-600 hover:bg-blue-50"}
                                        `}
                                      onClick={() => !isWeekend && handleDayClick(date, isClosed, isWeekend)}
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
                        {/* Datas já fechadas */}
                        {Array.from(closedDates)
                          .sort()
                          .map((dateString) => {
                            // Procurar a data original do backend para exibir exatamente como está salva
                            const backendDataObj = Array.isArray(backendDates) ? backendDates.find((d: any) => {
                              const onlyDate = d.data.split('T')[0];
                              return onlyDate === dateString;
                            }) : null;
                            const backendDate = backendDataObj ? backendDataObj.data : dateString;
                            const onlyDate = backendDate.split('T')[0];
                            const [year, month, day] = onlyDate.split('-');
                            // Cria um objeto Date só para formatar, sem ajuste de fuso
                            const formatted = new Date(`${onlyDate}T00:00:00`).toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                            });
                            const isWeekendClosed = new Date(`${onlyDate}T00:00:00`).getDay() === 0 || new Date(`${onlyDate}T00:00:00`).getDay() === 6;
                            if (isWeekendClosed) return null;
                            return (
                              <div key={dateString} className="flex items-center justify-between border rounded p-2">
                                <span className={`text-sm ${datesToDelete.has(dateString) ? "line-through text-red-500" : ""}`}>{formatted}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 ${datesToDelete.has(dateString) ? "border border-red-500" : "text-red-500"}`}
                                  onClick={() => handleDeleteMark(dateString)}
                                >
                                  ×
                                </Button>
                              </div>
                            )
                          })}
                        {/* Datas para criar (que ainda não estão fechadas) */}
                        {Array.from(datesToCreate)
                          .filter(dateString => !closedDates.has(dateString))
                          .sort()
                          .map(dateString => {
                            const onlyDate = dateString;
                            const [year, month, day] = onlyDate.split('-');
                            const formatted = new Date(`${onlyDate}T00:00:00`).toLocaleDateString("pt-BR", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            });
                            const isWeekendCreate = new Date(`${onlyDate}T00:00:00`).getDay() === 0 || new Date(`${onlyDate}T00:00:00`).getDay() === 6;
                            if (isWeekendCreate) return null;
                            return (
                              <div key={dateString} className="flex items-center justify-between border rounded p-2 bg-blue-50">
                                <span className="text-sm text-blue-600 font-semibold">{formatted}</span>
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
                    <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
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
          missionId={selectedMission ?? undefined}
        />
      )}
      {isScheduleFormOpen && (
        <ScheduleFormModal
          isOpen={isScheduleFormOpen}
          onClose={() => setIsScheduleFormOpen(false)}
          scheduleId={selectedSchedule ?? undefined}
        />
      )}
    </div>
  )
}
