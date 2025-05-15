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
import { CreateProjectDonationDialog } from "../../components/ui/create-project-donation-dialog"
import { CreateDisposalDialog } from "../../components/ui/create-disposal-dialog"
import { CreateElectronicDialog } from "../../components/ui/create-electronic-dialog"
import { DetailModal } from "../../components/DetailModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { EquipmentSelector } from "./equipment-selector"

interface StudentData {
  id: number
  name: string
  email: string
  matricula: string
  curso: string
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
  imagem?: string | null
  endpointType?: string
}

interface WeeklyReport {
  id: number
  name: string
  periodo: string
  createdAt: string
  resumo: string
  atividades: string
  objetivos: string
  desafios: string
  feedback?: string
}

interface AssignedMission {
  id: number
  title: string
  description: string
  deadline: string
  priority: string
  status: string
  assignedDate: string
}

interface CreateDisposalDialogProps {
  userId: string
  onSuccess?: () => void
}

export default function StudentAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("project-donations")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [projectDonations, setProjectDonations] = useState<ProjectDonation[]>([])
  const [userDonations, setUserDonations] = useState<UserDonation[]>([])
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    id: number
    type: "project" | "user" | "request" | "disposal" | "electronic"
    electronicType?: string
  } | null>(null)
  const [electronics, setElectronics] = useState<Electronic[]>([])
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([])
  const [assignedMissions, setAssignedMissions] = useState<AssignedMission[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    name: "",
    resumo: "",
    periodo: "",
    atividades: "",
    objetivos: "",
    desafios: ""
  })
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [disposals, setDisposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const itemsPerPage = 5
  const [disposalRefreshKey, setDisposalRefreshKey] = useState(0)
  const [selectedDisposal, setSelectedDisposal] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isElectronicsModalOpen, setIsElectronicsModalOpen] = useState(false)

  const API_URL = "http://26.99.103.209:3456"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const matricula = localStorage.getItem("userMatricula")
        const storedUserType = localStorage.getItem("userType")

        if (!matricula || storedUserType !== "STUDENT") {
          router.push("/login")
          return
        }

        const response = await fetch(`${API_URL}/alunos/matricula/${matricula}`)
        if (response.ok) {
          const data: StudentData = await response.json()
          setStudentData(data)
        } else {
          throw new Error("Failed to fetch student data")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error in checkAuth:", error)
        localStorage.removeItem("userMatricula")
        localStorage.removeItem("userType")
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectDonationsRes, userDonationsRes, studentRequestsRes] = await Promise.all([
          fetch(`${API_URL}/doacoes`),
          fetch(`${API_URL}/doacoesUsuarios`),
          fetch(`${API_URL}/solicitacoes`),
        ])

        if (projectDonationsRes.ok && userDonationsRes.ok && studentRequestsRes.ok) {
          const projectDonationsData: ProjectDonation[] = await projectDonationsRes.json()
          const userDonationsData: UserDonation[] = await userDonationsRes.json()
          const studentRequestsData: StudentRequest[] = await studentRequestsRes.json()

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
    const fetchWeeklyReports = async () => {
      if (!studentData?.id) return
      try {
        const res = await fetch(`http://localhost:3456/relatorios/usuario/${studentData.id}`)
        if (!res.ok) throw new Error("Erro ao buscar relatórios semanais")
        const reports = await res.json()
        setWeeklyReports(reports)
      } catch (err) {
        console.error("Erro ao buscar relatórios semanais:", err)
      }
    }
    fetchWeeklyReports()
  }, [studentData])

  const fetchElectronics = async (): Promise<void> => {
    try {
      const endpoints = [
        { key: "teclados", url: "teclados", label: "Teclado" },
        { key: "hds", url: "hds", label: "HD" },
        { key: "estabilizadores", url: "estabilizadores", label: "Estabilizador" },
        { key: "monitores", url: "monitores", label: "Monitor" },
        { key: "mouses", url: "mouses", label: "Mouse" },
        { key: "gabinetes", url: "gabinetes", label: "Gabinete" },
        { key: "impressoras", url: "impressoras", label: "Impressora" },
        { key: "placasMae", url: "placasMae", label: "Placa Mãe" },
        { key: "notebooks", url: "notebooks", label: "Notebook" },
        { key: "processadores", url: "processadores", label: "Processador" },
      ];
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`http://localhost:3456/${endpoint.url}`).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              // Para cada eletrônico, buscar a imagem
              const withImages = await Promise.all(
                data.map(async (item: any) => {
                  try {
                    const imgRes = await fetch(`http://localhost:3456/imagens/${endpoint.label}/${item.id}`);
                    if (imgRes.ok) {
                      const imgData = await imgRes.json();
                      let caminho = null;
                      if (Array.isArray(imgData) && imgData.length > 0) {
                        caminho = imgData[0].url;
                      } else if (imgData && imgData.caminho) {
                        caminho = imgData.url;
                      }
                      let imgUrl = null;
                      if (caminho) {
                        let finalPath = caminho.startsWith('/') ? caminho : `/${caminho}`;
                        imgUrl = `http://localhost:3456${finalPath}`;
                      }
                      return { ...item, tipo: endpoint.label, endpointType: endpoint.url, imagem: imgUrl };
                    }
                  } catch {}
                  return { ...item, tipo: endpoint.label, endpointType: endpoint.url, imagem: null };
                })
              );
              return withImages;
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

  useEffect(() => {
    fetchElectronics();
  }, []);

  useEffect(() => {
    const fetchAssignedMissions = async () => {
      if (!studentData?.id) return
      try {
        const res = await fetch(`http://localhost:3456/missoes/usuario/${studentData.id}`)
        if (!res.ok) throw new Error("Erro ao buscar missões atribuídas")
        const missions = await res.json()
        setAssignedMissions(missions)
      } catch (err) {
        console.error("Erro ao buscar missões atribuídas:", err)
      }
    }
    fetchAssignedMissions()
  }, [studentData])

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

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Rejeitado" },
      NEW: { variant: "secondary", label: "Novo" },
      IN_PROGRESS: { variant: "default", label: "Em Andamento" },
    }
    const statusInfo = variants[status as keyof typeof variants] || variants.PENDING
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleLogout = () => {
    localStorage.removeItem("userMatricula")
    localStorage.removeItem("userType")
    router.push("/login")
  }

  const renderFilterPanel = (type: string) => {
    if (type === "weekly-reports") {
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
                    placeholder="Pesquisar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (type === "assigned-missions") {
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
            </div>
          </CardContent>
        </Card>
      );
    }
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
                  placeholder={type === "eletronicos" ? "Pesquisar por nome..." : "Pesquisar..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{type === "eletronicos" ? "Tipo" : "Status"}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={type === "eletronicos" ? "Filtrar por tipo" : "Filtrar por status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {type === "eletronicos" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="aprovado">Aprovados</SelectItem>
                      <SelectItem value="rejeitado">Rejeitados</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Urgência só para requests, não para eletrônicos */}
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
        </CardContent>
      </Card>
    )
  }

  const handleOpenModal = (
    id: number,
    type: "project" | "user" | "request" | "disposal" | "electronic",
    electronicType?: string,
  ) => {
    setSelectedItem({ id, type, electronicType })
    setIsModalOpen(true)
  }

  const handleOpenReportModal = () => setIsReportModalOpen(true)
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false)
    setReportForm({
      name: "",
      resumo: "",
      periodo: "",
      atividades: "",
      objetivos: "",
      desafios: ""
    })
  }
  const handleReportInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value })
  }
  const handleCreateReport = async () => {
    if (!studentData?.id) return
    setIsSubmittingReport(true)
    try {
      const res = await fetch("http://localhost:3456/relatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: studentData.id,
          name: reportForm.name,
          resumo: reportForm.resumo,
          periodo: reportForm.periodo,
          atividades: reportForm.atividades,
          objetivos: reportForm.objetivos,
          desafios: reportForm.desafios,
        })
      })
      if (!res.ok) throw new Error("Erro ao criar relatório")
      handleCloseReportModal()
      // Atualiza a lista após criar
      const updated = await fetch(`http://localhost:3456/relatorios/usuario/${studentData.id}`)
      if (updated.ok) setWeeklyReports(await updated.json())
    } catch (err) {
      alert("Erro ao criar relatório semanal!")
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const handleOpenReportDetail = (report: WeeklyReport) => {
    setSelectedReport(report)
    setIsReportDetailOpen(true)
  }
  const handleCloseReportDetail = () => {
    setIsReportDetailOpen(false)
    setSelectedReport(null)
  }

  useEffect(() => {
    async function fetchDisposals() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3456/descartes");
        const data = await res.json();
        setDisposals(data);
        console.log("Quantidade máxima de descartes retornados pelo backend:", data.length);
        // Se a página atual não existir mais, volta para a última página disponível
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1);
      } catch (e) {
        setDisposals([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDisposals();
  }, [disposalRefreshKey]);

  // Função para filtrar eletrônicos por nome e tipo
  const getFilteredElectronics = () => {
    return electronics.filter((electronic) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        (electronic.nome && electronic.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType =
        statusFilter === "all" ||
        (electronic.tipo && electronic.tipo === statusFilter);
      return matchesSearch && matchesType;
    });
  };

  // Funções de refresh para cada aba
  const handleRefreshProjectDonations = async () => {
    try {
      const res = await fetch(`${API_URL}/doacoes`);
      if (res.ok) setProjectDonations(await res.json());
    } catch {}
  };
  const handleRefreshUserDonations = async () => {
    try {
      const res = await fetch(`${API_URL}/doacoesUsuarios`);
      if (res.ok) setUserDonations(await res.json());
    } catch {}
  };
  const handleRefreshStudentRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitacoes`);
      if (res.ok) setStudentRequests(await res.json());
    } catch {}
  };
  const handleRefreshDisposals = () => setDisposalRefreshKey(k => k + 1);
  const handleRefreshElectronics = () => fetchElectronics();
  const handleRefreshWeeklyReports = async () => {
    if (!studentData?.id) return;
    try {
      const res = await fetch(`http://localhost:3456/relatorios/usuario/${studentData.id}`);
      if (res.ok) setWeeklyReports(await res.json());
    } catch {}
  };
  const handleRefreshAssignedMissions = async () => {
    if (!studentData?.id) return;
    try {
      const res = await fetch(`http://localhost:3456/missoes/usuario/${studentData.id}`);
      if (res.ok) setAssignedMissions(await res.json());
    } catch {}
  };

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Painel do Estudante</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <p className="font-medium">{studentData?.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback>{studentData?.name?.charAt(0) || "A"}</AvatarFallback>
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

      <Tabs defaultValue="project-donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="project-donations">Doação Projeto</TabsTrigger>
          <TabsTrigger value="user-donations">Doação Usuário</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="descarte">Descarte</TabsTrigger>
          <TabsTrigger value="eletronicos">Eletrônicos</TabsTrigger>
          <TabsTrigger value="weekly-reports">Relatório Semanal</TabsTrigger>
          <TabsTrigger value="assigned-missions">Missões Atribuídas</TabsTrigger>
        </TabsList>

        <TabsContent value="project-donations">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("project-donations")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Doações do Projeto RECOM</CardTitle>
                  <CardDescription>
                    Aqui você pode visualizar as doações realizadas pelo projeto RECOM para pessoas e entidades sem fins lucrativos.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRefreshProjectDonations}>Atualizar</Button>
                  <CreateProjectDonationDialog userId={studentData?.id?.toString() ?? ""} />
                </div>
              </CardHeader>
              <CardContent>
                {projectDonations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectDonations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>#{donation.id}</TableCell>
                          <TableCell>{donation.name}</TableCell>
                          <TableCell>{donation.descricao}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(donation.data).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(donation.status)}</TableCell>
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
                    <p>Ainda não há doações para projetos disponíveis.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-donations">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("user-donations")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Doações de Usuários</CardTitle>
                  <CardDescription>Aqui você pode ver doações feitas por usuários individuais.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRefreshUserDonations}>Atualizar</Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Filtragem por status e nome
                  const filteredDonations = userDonations.filter((donation) => {
                    const matchesStatus = statusFilter === "all" || donation.status === statusFilter;
                    const matchesSearch =
                      searchTerm.trim() === "" ||
                      donation.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesStatus && matchesSearch;
                  });
                  return filteredDonations.length > 0 ? (
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
                        {filteredDonations.map((donation) => (
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
                            <TableCell>{getStatusBadge(donation.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleOpenModal(donation.id, "user")}>Ver Detalhes</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>Ainda não há doações de usuários disponíveis.</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("requests")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Minhas Solicitações</CardTitle>
                  <CardDescription>Aqui você pode ver suas solicitações existentes e criar novas.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRefreshStudentRequests}>Atualizar</Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Filtragem por status e nome
                  const filteredRequests = studentRequests.filter((request) => {
                    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
                    const matchesSearch =
                      searchTerm.trim() === "" ||
                      request.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesStatus && matchesSearch;
                  });
                  return filteredRequests.length > 0 ? (
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
                        {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>#{request.id}</TableCell>
                            <TableCell>{request.name}</TableCell>
                            <TableCell>{request.eletronicos}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                {request.data ? new Date(request.data).toLocaleDateString() : "-"}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleOpenModal(request.id, "request")}>Ver Detalhes</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>Você ainda não tem solicitações.</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="descarte">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("descarte")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Descarte de Equipamentos</CardTitle>
                  <CardDescription>Gerencie o descarte adequado de equipamentos eletrônicos.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRefreshDisposals}>Atualizar</Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <CreateDisposalDialog userId={studentData?.id ? studentData.id.toString() : ""} onSuccess={() => setDisposalRefreshKey(k => k + 1)} />
                </div>
                <DisposalsList refreshKey={disposalRefreshKey} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eletronicos">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("eletronicos")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestão de Eletrônicos</CardTitle>
                  <CardDescription>Visualize e gerencie equipamentos eletrônicos disponíveis.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRefreshElectronics}>Atualizar</Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>Cadastrar Eletrônico</Button>
                </div>
                <CreateElectronicDialog
                  userId={studentData?.id ? studentData.id.toString() : ""}
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  onSuccess={() => {
                    fetchElectronics();
                    setIsCreateDialogOpen(false);
                  }}
                />
              </CardHeader>
              <CardContent>
                {getFilteredElectronics().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredElectronics().map((electronic) => {
                        const pluralToSingular: Record<string, string> = {
                          teclados: "teclado",
                          hds: "hd",
                          fontesDeAlimentacao: "fontedealimentacao",
                          gabinetes: "gabinete",
                          monitores: "monitor",
                          mouses: "mouse",
                          estabilizadores: "estabilizador",
                          impressoras: "impressora",
                          notebooks: "notebook",
                          placasMae: "placamae",
                          processadores: "processador",
                        };
                        let singularType = electronic.tipo;
                        if (electronic.endpointType && pluralToSingular.hasOwnProperty(electronic.endpointType)) {
                          singularType = pluralToSingular[electronic.endpointType];
                        } else if (pluralToSingular.hasOwnProperty(electronic.tipo)) {
                          singularType = pluralToSingular[electronic.tipo];
                        }
                        // Só mostrar botão de detalhes se não for tipo desconhecido
                        const tiposSuportados = [
                          "teclado", "hd", "fontedealimentacao", "gabinete", "monitor", "mouse", "estabilizador", "impressora", "notebook", "placamae", "processador"
                        ];
                        const mostrarDetalhes = tiposSuportados.includes(singularType);
                        return (
                          <TableRow key={`${electronic.endpointType}-${electronic.id}`}>
                            <TableCell>#{electronic.id}</TableCell>
                            <TableCell>{electronic.nome}</TableCell>
                            <TableCell>{electronic.tipo}</TableCell>
                            <TableCell>
                              {mostrarDetalhes && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenModal(electronic.id, "electronic", singularType)}
                                >
                                  Ver Detalhes
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Nenhum eletrônico disponível no momento.</p>
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
                  <CardDescription>Acompanhe seus relatórios semanais de atividades.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRefreshWeeklyReports}>Atualizar</Button>
                <Button onClick={handleOpenReportModal}>Novo Relatório</Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const filteredReports = weeklyReports.filter((report) =>
                    searchTerm.trim() === "" ||
                    (report.name && report.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  );
                  return filteredReports.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Semana</TableHead>
                          <TableHead>Data de Envio</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>#{report.id}</TableCell>
                            <TableCell>{report.name}</TableCell>
                            <TableCell>{report.periodo}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleOpenReportDetail(report)}>
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>Você ainda não tem relatórios semanais.</p>
                    </div>
                  );
                })()}
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
                  <CardTitle>Missões Atribuídas</CardTitle>
                  <CardDescription>Visualize e gerencie as missões atribuídas a você.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRefreshAssignedMissions}>Atualizar</Button>
              </CardHeader>
              <CardContent>
                {assignedMissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedMissions.map((mission) => (
                        <TableRow key={mission.id}>
                          <TableCell>#{mission.id}</TableCell>
                          <TableCell>{mission.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(mission.deadline).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                mission.priority === "high"
                                  ? "destructive"
                                  : mission.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {mission.priority === "high" ? "Alta" : mission.priority === "medium" ? "Média" : "Baixa"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(mission.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Você não tem missões atribuídas no momento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {selectedItem && selectedItem.type === "project" && (
        <ProjectDonationDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          donationId={selectedItem.id}
        />
      )}
      {selectedItem && selectedItem.type !== "project" && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemId={selectedItem.id}
          itemType={selectedItem.type}
          electronicType={selectedItem.electronicType}
        />
      )}
      {/* Modal de novo relatório semanal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Relatório Semanal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            Preencha abaixo o seu relatório semanal de atividades realizadas no projeto RECOM. Seja detalhado sobre o que você fez nesta semana.
          </p>
          <div className="space-y-4">
            <div>
              <Label>Nome do Relatório</Label>
              <Input name="name" value={reportForm.name} onChange={handleReportInputChange} placeholder="Ex: Relatório Semana 1" />
            </div>
            <div>
              <Label>Resumo</Label>
              <Textarea name="resumo" value={reportForm.resumo} onChange={handleReportInputChange} placeholder="Resumo geral das atividades da semana..." />
            </div>
            <div>
              <Label>Período</Label>
              <Input name="periodo" value={reportForm.periodo} onChange={handleReportInputChange} placeholder="Ex: 01/01/2024 a 07/01/2024" />
            </div>
            <div>
              <Label>Atividades Desenvolvidas</Label>
              <Textarea name="atividades" value={reportForm.atividades} onChange={handleReportInputChange} placeholder="Descreva detalhadamente as atividades realizadas..." />
            </div>
            <div>
              <Label>Objetivos Alcançados</Label>
              <Textarea name="objetivos" value={reportForm.objetivos} onChange={handleReportInputChange} placeholder="Liste os objetivos atingidos nesta semana..." />
            </div>
            <div>
              <Label>Desafios Encontrados</Label>
              <Textarea name="desafios" value={reportForm.desafios} onChange={handleReportInputChange} placeholder="Relate os principais desafios enfrentados..." />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCloseReportModal} disabled={isSubmittingReport}>Cancelar</Button>
              <Button
                onClick={handleCreateReport}
                disabled={
                  isSubmittingReport ||
                  !reportForm.name ||
                  !reportForm.resumo ||
                  !reportForm.periodo ||
                  !reportForm.atividades ||
                  !reportForm.objetivos ||
                  !reportForm.desafios
                }
              >
                {isSubmittingReport ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de detalhes do relatório semanal */}
      <Dialog open={isReportDetailOpen} onOpenChange={setIsReportDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Relatório Semanal</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label className="font-bold">Nome</Label>
                <div>{selectedReport.name}</div>
              </div>
              <div>
                <Label className="font-bold">Resumo</Label>
                <div>{selectedReport.resumo}</div>
              </div>
              <div>
                <Label className="font-bold">Período</Label>
                <div>{selectedReport.periodo}</div>
              </div>
              <div>
                <Label className="font-bold">Atividades Desenvolvidas</Label>
                <div>{selectedReport.atividades}</div>
              </div>
              <div>
                <Label className="font-bold">Objetivos Alcançados</Label>
                <div>{selectedReport.objetivos}</div>
              </div>
              <div>
                <Label className="font-bold">Desafios Encontrados</Label>
                <div>{selectedReport.desafios}</div>
              </div>
              <div>
                <Label className="font-bold">Feedback</Label>
                <div>{selectedReport.feedback || "Nenhum feedback ainda."}</div>
              </div>
              <div>
                <Label className="font-bold">Data de Envio</Label>
                <div>{selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : "N/A"}</div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={handleCloseReportDetail}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <DisposalDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        disposalId={selectedDisposal?.id}
      />
    </div>
  )
}

function DisposalsList({ refreshKey }: { refreshKey?: number }) {
  const [disposals, setDisposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDisposal, setSelectedDisposal] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    async function fetchDisposals() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3456/descartes");
        const data = await res.json();
        setDisposals(data);
        console.log("Quantidade máxima de descartes retornados pelo backend:", data.length);
        // Se a página atual não existir mais, volta para a última página disponível
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1);
      } catch (e) {
        setDisposals([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDisposals();
  }, [refreshKey]);

  if (loading) return <div>Carregando descartes...</div>;
  if (!disposals.length) return <div>Nenhum descarte encontrado.</div>;

  // Paginação
  const totalPages = Math.ceil(disposals.length / itemsPerPage);
  const paginatedDisposals = disposals.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  console.log(`Página ${page} de ${totalPages} | Exibindo descartes:`, paginatedDisposals.length, '/', disposals.length);

  return (
    <div className="grid gap-4 mt-6">
      {paginatedDisposals.map((d, idx) => (
        <div key={d.id} className="border rounded-md p-4 bg-white shadow">
          <div className="text-xs text-gray-400">Índice global: {(page - 1) * itemsPerPage + idx + 1}</div>
          <div className="font-bold text-lg">{d.name}</div>
          <div className="text-sm text-muted-foreground mb-2">Código: {d.codigoDeReferencias}</div>
          <div className="text-sm">Data: {d.data ? new Date(d.data.split('T')[0]).toLocaleDateString() : "-"}</div>
          <div className="text-sm">Status: {d.status || "-"}</div>
          <div className="mt-2">
            <div className="font-medium">Eletrônicos:</div>
            <ul className="list-disc ml-6">
              {Object.entries(d).filter(([k, v]) => Array.isArray(v) && v.length > 0).map(([cat, arr]) => (
                <li key={cat}>
                  <span className="capitalize font-semibold">{cat}:</span> {(arr as any[]).map((e: any) => e.nome || e.name || e.id).join(", ")}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => { setSelectedDisposal(d); setIsDetailOpen(true); }}
            >
              Ver Mais
            </button>
          </div>
        </div>
      ))}
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded ${num === page ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
      <DisposalDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        disposalId={selectedDisposal?.id}
      />
    </div>
  );
}

// Modal de detalhes do descarte
function DisposalDetailModal({ isOpen, onClose, disposalId }: { isOpen: boolean, onClose: () => void, disposalId?: number }) {
  const [disposal, setDisposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [electronics, setElectronics] = useState<any[]>([]);
  const [isElectronicsModalOpen, setIsElectronicsModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !disposalId) return;
    setLoading(true);
    // Buscar detalhes do descarte
    fetch(`http://26.99.103.209:3456/descartes/${disposalId}`)
      .then(res => res.json())
      .then(data => setDisposal(data))
      .catch(() => setDisposal(null));
    // Buscar eletrônicos de todas as categorias
    const endpoints = [
      { key: "teclados", url: "teclados", label: "Teclados" },
      { key: "hds", url: "hds", label: "HDs" },
      { key: "estabilizadores", url: "estabilizadores", label: "Estabilizadores" },
      { key: "monitores", url: "monitores", label: "Monitores" },
      { key: "mouses", url: "mouses", label: "Mouses" },
      { key: "gabinetes", url: "gabinetes", label: "Gabinetes" },
      { key: "impressoras", url: "impressoras", label: "Impressoras" },
      { key: "placasMae", url: "placasMae", label: "Placas Mãe" },
      { key: "notebooks", url: "notebooks", label: "Notebooks" },
      { key: "processadores", url: "processadores", label: "Processadores" },
    ];
    Promise.all(
      endpoints.map(async (ep) => {
        const res = await fetch(`http://26.99.103.209:3456/descartes/${disposalId}/${ep.url}`);
        if (!res.ok) return { key: ep.key, label: ep.label, items: [] };
        const data = await res.json();
        return { key: ep.key, label: ep.label, items: Array.isArray(data) ? data.map(item => ({ ...item, tipoCategoria: ep.key })) : [] };
      })
    ).then((all) => setElectronics(all));
    setLoading(false);
  }, [isOpen, disposalId]);

  // Verifica se há algum eletrônico em qualquer categoria
  const hasAnyElectronics = electronics.some(cat => cat.items && cat.items.length > 0);

  // Função para buscar imagem de um eletrônico (agora dentro do componente)
  const getElectronicImage = async (catKey: string, id: number) => {
    const imageEndpointMap: Record<string, string> = {
      teclados: "teclado",
      hds: "hd",
      fontesDeAlimentacao: "fonteDeAlimentacao",
      gabinetes: "gabinete",
      monitores: "monitor",
      mouses: "mouse",
      estabilizadores: "estabilizado",
      impressoras: "impressora",
      placasMae: "placaMae",
      notebooks: "notebook",
      processadores: "processador",
    };
    const endpoint = imageEndpointMap[catKey];
    if (!endpoint) return null;
    try {
      const res = await fetch(`http://localhost:3456/imagens/${endpoint}/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      console.log("Imagem retornada:", data);
      // Tente url, caminho, ou outro campo
      if (Array.isArray(data) && data.length > 0) {
        const caminho = data[0].url || data[0].caminho;
        if (caminho) return `http://localhost:3456${caminho.startsWith('/') ? caminho : '/' + caminho}`;
      }
      if (data && (data.url || data.caminho)) {
        const caminho = data.url || data.caminho;
        return `http://localhost:3456${caminho.startsWith('/') ? caminho : '/' + caminho}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Descarte</DialogTitle>
        </DialogHeader>
        {loading || !disposal ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <strong>Nome:</strong> {disposal.name}
            </div>
            <div>
              <strong>Descrição:</strong> {disposal.descricao}
            </div>
            <div>
              <strong>Data:</strong> {disposal.data ? new Date(disposal.data.split('T')[0]).toLocaleDateString() : "-"}
            </div>
            <div>
              <strong>Código de Referência:</strong> {disposal.codigoDeReferencias}
            </div>
            <div>
              <strong>ID Usuário:</strong> {disposal.usuarioId}
            </div>
            <div className="mt-4">
              <strong>Eletrônicos deste descarte:</strong>
              {electronics.map((cat) => (
                <div key={cat.label} className="mt-2">
                  <span className="font-semibold">{cat.label}:</span> {cat.items.length > 0 ? cat.items.map((e: any) => e.nome || e.name || e.id).join(", ") : "Nenhum"}
                </div>
              ))}
            </div>
            {hasAnyElectronics && (
              <div className="mt-4 flex justify-end">
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setIsElectronicsModalOpen(true)}
                >
                  Ver Eletrônicos
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
      {/* Modal de Eletrônicos */}
      <Dialog open={isElectronicsModalOpen} onOpenChange={setIsElectronicsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Eletrônicos do Descarte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {electronics.filter(cat => cat.items.length > 0).length === 0 ? (
              <div>Nenhum eletrônico associado a este descarte.</div>
            ) : (
              electronics.filter(cat => cat.items.length > 0).map(cat => (
                <div key={cat.label}>
                  <div className="font-semibold mb-1">{cat.label}:</div>
                  <ul className="list-disc ml-6">
                    {cat.items.map((e: any) => (
                      <ElectronicWithImage key={e.id} catKey={e.tipoCategoria} electronic={e} />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// Componente auxiliar para exibir eletrônico com imagem
function ElectronicWithImage({ catKey, electronic }: { catKey: string, electronic: any }) {
  console.log('Renderizando ElectronicWithImage', catKey, electronic);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    console.log('Vai buscar imagem para', catKey, electronic.id);
    const imageEndpointMap: Record<string, string> = {
      teclados: "teclado",
      hds: "hd",
      fontesDeAlimentacao: "fonteDeAlimentacao",
      gabinetes: "gabinete",
      monitores: "monitor",
      mouses: "mouse",
      estabilizadores: "estabilizado",
      impressoras: "impressora",
      placasMae: "placaMae",
      notebooks: "notebook",
      processadores: "processador",
    };
    const endpoint = imageEndpointMap[catKey];
    if (!endpoint) return;
    let mounted = true;
    const url = `http://localhost:3456/imagens/${endpoint}/${electronic.id}`;
    console.log('Fetch disparado para:', url);
    fetch(url)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!mounted) return;
        let caminho = null;
        if (Array.isArray(data) && data.length > 0) {
          caminho = data[0].url || data[0].caminho;
        } else if (data && (data.url || data.caminho)) {
          caminho = data.url || data.caminho;
        }
        if (caminho) {
          if (!caminho.startsWith('/')) caminho = '/' + caminho;
          setImgUrl(`http://localhost:3456${caminho}`);
        } else {
          setImgUrl(null);
        }
      })
      .catch(() => setImgUrl(null));
    return () => { mounted = false; };
  }, [catKey, electronic.id]);
  return (
    <li className="mb-1 flex items-center gap-3">
      <img src={imgUrl || "/placeholder.svg"} alt={electronic.nome || electronic.name || `ID ${electronic.id}`} className="w-12 h-12 object-cover rounded border" />
      <div>
        <span className="font-medium">{electronic.nome || electronic.name || `ID ${electronic.id}`}</span>
        {electronic.modelo && <span className="ml-2 text-gray-500">Modelo: {electronic.modelo}</span>}
        {electronic.marca && <span className="ml-2 text-gray-500">Marca: {electronic.marca}</span>}
        {electronic.serialNumber && <span className="ml-2 text-gray-500">S/N: {electronic.serialNumber}</span>}
      </div>
    </li>
  );
}

function ProjectDonationDetailModal({ isOpen, onClose, donationId }: { isOpen: boolean, onClose: () => void, donationId?: number }) {
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [electronics, setElectronics] = useState<any[]>([]);
  const [isElectronicsModalOpen, setIsElectronicsModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !donationId) return;
    setLoading(true);
    // Buscar detalhes da doação
    fetch(`http://localhost:3456/doacoes/${donationId}`)
      .then(res => res.json())
      .then(data => setDetails(data))
      .catch(() => setDetails(null));
    // Buscar eletrônicos de todas as categorias
    const endpoints = [
      { key: "teclados", url: "teclados", label: "Teclados" },
      { key: "hds", url: "hds", label: "HDs" },
      { key: "estabilizadores", url: "estabilizadores", label: "Estabilizadores" },
      { key: "monitores", url: "monitores", label: "Monitores" },
      { key: "mouses", url: "mouses", label: "Mouses" },
      { key: "gabinetes", url: "gabinetes", label: "Gabinetes" },
      { key: "impressoras", url: "impressoras", label: "Impressoras" },
      { key: "placasMae", url: "placas-mae", label: "Placas Mãe" },
      { key: "notebooks", url: "notebooks", label: "Notebooks" },
      { key: "processadores", url: "processadores", label: "Processadores" },
      { key: "fontes", url: "fontes", label: "Fontes de Alimentação" },
    ];
    Promise.all(
      endpoints.map(async (ep) => {
        const res = await fetch(`http://localhost:3456/doacoes/${donationId}/${ep.url}`);
        if (!res.ok) return { key: ep.key, label: ep.label, items: [] };
        const data = await res.json();
        return { key: ep.key, label: ep.label, items: Array.isArray(data) ? data.map(item => ({ ...item, tipoCategoria: ep.key })) : [] };
      })
    ).then((all) => setElectronics(all));
    setLoading(false);
  }, [isOpen, donationId]);

  // Verifica se há algum eletrônico em qualquer categoria
  const hasAnyElectronics = electronics.some(cat => cat.items && cat.items.length > 0);

  // Função para buscar imagem de um eletrônico
  const getElectronicImage = async (catKey: string, id: number) => {
    const imageEndpointMap: Record<string, string> = {
      teclados: "teclado",
      hds: "hd",
      fontes: "fonteDeAlimentacao",
      gabinetes: "gabinete",
      monitores: "monitor",
      mouses: "mouse",
      estabilizadores: "estabilizado",
      impressoras: "impressora",
      placasMae: "placaMae",
      notebooks: "notebook",
      processadores: "processador",
    };
    const endpoint = imageEndpointMap[catKey];
    if (!endpoint) return null;
    try {
      const res = await fetch(`http://localhost:3456/imagens/${endpoint}/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const caminho = data[0].url || data[0].caminho;
        if (caminho) return `http://localhost:3456${caminho.startsWith('/') ? caminho : '/' + caminho}`;
      }
      if (data && (data.url || data.caminho)) {
        const caminho = data.url || data.caminho;
        return `http://localhost:3456${caminho.startsWith('/') ? caminho : '/' + caminho}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Doação de Projeto</DialogTitle>
        </DialogHeader>
        {loading || !details ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4">
            <div><strong>Nome:</strong> {details.name}</div>
            <div><strong>Descrição:</strong> {details.descricao}</div>
            <div><strong>Data:</strong> {details.data ? new Date(details.data.split('T')[0]).toLocaleDateString() : "-"}</div>
            <div><strong>Código de Referência:</strong> {details.codigoDeReferencias}</div>
            <div><strong>Status:</strong> {details.status}</div>
            <div><strong>Justificativa:</strong> {details.justificativa}</div>
            <div><strong>Contato:</strong> {details.contato}</div>
            {/* Forçar o botão aparecer sempre */}
            <div className="mt-4 flex justify-end">
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setIsElectronicsModalOpen(true)}
              >
                Ver Eletrônicos
              </button>
            </div>
          </div>
        )}
      </DialogContent>
      {/* Modal de Eletrônicos */}
      <Dialog open={isElectronicsModalOpen} onOpenChange={setIsElectronicsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Eletrônicos da Doação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {electronics.filter(cat => cat.items.length > 0).length === 0 ? (
              <div style={{color: 'red'}}>Nenhum eletrônico associado a esta doação.</div>
            ) : (
              electronics.filter(cat => cat.items.length > 0).map(cat => (
                <div key={cat.label}>
                  <div className="font-semibold mb-1">{cat.label}:</div>
                  <ul className="list-disc ml-6">
                    {cat.items.map((e: any) => (
                      <ProjectDonationElectronicWithImage key={e.id} catKey={cat.key} electronic={e} getElectronicImage={getElectronicImage} />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function ProjectDonationElectronicWithImage({ catKey, electronic, getElectronicImage }: { catKey: string, electronic: any, getElectronicImage: (catKey: string, id: number) => Promise<string | null> }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    getElectronicImage(catKey, electronic.id).then(url => { if (mounted) setImgUrl(url); });
    return () => { mounted = false; };
  }, [catKey, electronic.id]);
  return (
    <li className="mb-1 flex items-center gap-3">
      <img src={imgUrl || "/placeholder.svg"} alt={electronic.nome || electronic.name || `ID ${electronic.id}`} className="w-12 h-12 object-cover rounded border" />
      <div>
        <span className="font-medium">{electronic.nome || electronic.name || `ID ${electronic.id}`}</span>
        {electronic.modelo && <span className="ml-2 text-gray-500">Modelo: {electronic.modelo}</span>}
        {electronic.marca && <span className="ml-2 text-gray-500">Marca: {electronic.marca}</span>}
        {electronic.serialNumber && <span className="ml-2 text-gray-500">S/N: {electronic.serialNumber}</span>}
      </div>
    </li>
  );
}

