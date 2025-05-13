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
        { url: "estabilizadores", type: "Estabilizador", img: "estabilizado" },
        { url: "fontesDeAlimentacao", type: "Fonte de Alimentação", img: "fonteDeAlimentacao" },
        { url: "gabinetes", type: "Gabinete", img: "gabinete" },
        { url: "hds", type: "HD", img: "hd" },
        { url: "impressoras", type: "Impressora", img: "impressora" },
        { url: "monitores", type: "Monitor", img: "monitor" },
        { url: "notebooks", type: "Notebook", img: "notebook" },
        { url: "placasMae", type: "Placa Mãe", img: "placaMae" },
        { url: "processadores", type: "Processador", img: "processador" },
        { url: "teclados", type: "Teclado", img: "teclado" },
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
                    const imgRes = await fetch(`http://localhost:3456/imagens/${endpoint.img}/${item.id}`);
                    if (imgRes.ok) {
                      const imgData = await imgRes.json();
                      console.log('imgData para', endpoint.img, item.id, imgData);
                      let caminho = null;
                      // Se vier array, pega o primeiro
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
                      console.log('imgUrl final para', endpoint.img, item.id, imgUrl);
                      return { ...item, tipo: endpoint.type, endpointType: endpoint.url, imagem: imgUrl };
                    }
                  } catch {}
                  return { ...item, tipo: endpoint.type, endpointType: endpoint.url, imagem: null };
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
                <CreateProjectDonationDialog userId={studentData?.id?.toString() ?? ""} />
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
              <CardHeader>
                <CardTitle>Doações de Usuários</CardTitle>
                <CardDescription>Aqui você pode ver doações feitas por usuários individuais.</CardDescription>
              </CardHeader>
              <CardContent>
                {userDonations.length > 0 ? (
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
                      {userDonations.map((donation) => (
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
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(donation.id, "user")}>
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>Ainda não há doações de usuários disponíveis.</p>
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
                <CardTitle>Minhas Solicitações</CardTitle>
                <CardDescription>Aqui você pode ver suas solicitações existentes e criar novas.</CardDescription>
              </CardHeader>
              <CardContent>
                {studentRequests.length > 0 ? (
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
                      {studentRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>#{request.id}</TableCell>
                          <TableCell>{request.name}</TableCell>
                          <TableCell>{request.eletronicos}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {new Date(request.data).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
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
                    <p>Você ainda não tem solicitações.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="descarte">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("descarte")}
            <Card>
              <CardHeader>
                <CardTitle>Descarte de Equipamentos</CardTitle>
                <CardDescription>Gerencie o descarte adequado de equipamentos eletrônicos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p>Área de descarte em desenvolvimento.</p>
                  <CreateDisposalDialog userId={studentData?.id ? studentData.id.toString() : ""} />
                </div>
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
                <Button onClick={() => setIsCreateDialogOpen(true)}>Cadastrar Eletrônico</Button>
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
                {electronics.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Imagem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {electronics.map((electronic) => (
                        <TableRow key={`${electronic.endpointType}-${electronic.id}`}>
                          <TableCell>#{electronic.id}</TableCell>
                          <TableCell>
                            <img
                              src={electronic.imagem || "/placeholder.svg"}
                              alt={electronic.nome}
                              className="w-10 h-10 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>{electronic.nome}</TableCell>
                          <TableCell>{electronic.tipo}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenModal(electronic.id, "electronic", electronic.endpointType)}
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
                <Button onClick={handleOpenReportModal}>Novo Relatório</Button>
              </CardHeader>
              <CardContent>
                {weeklyReports.length > 0 ? (
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
                      {weeklyReports.map((report) => (
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
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assigned-missions">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("assigned-missions")}
            <Card>
              <CardHeader>
                <CardTitle>Missões Atribuídas</CardTitle>
                <CardDescription>Visualize e gerencie as missões atribuídas a você.</CardDescription>
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
      {selectedItem && (
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
    </div>
  )
}

