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
  } | null>(null)
  const [electronics, setElectronics] = useState<any[]>([])

  const API_URL = "http://localhost:3456"

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
    const fetchElectronics = async () => {
      try {
        const urls = [
          "http://localhost:3456/estabilizadores",
          "http://localhost:3456/fontesDeAlimentacao",
          "http://localhost:3456/gabinetes",
          "http://localhost:3456/hds",
          "http://localhost:3456/impressoras",
          "http://localhost:3456/monitores",
          "http://localhost:3456/notebooks",
          "http://localhost:3456/placasMae",
          "http://localhost:3456/processadores",
          "http://localhost:3456/teclados",
        ]

        const responses = await Promise.all(urls.map((url) => fetch(url)))
        const data = await Promise.all(responses.map((res) => res.json()))
        const allElectronics = data.flat()
        setElectronics(allElectronics)
      } catch (error) {
        console.error("Error fetching electronics:", error)
      }
    }

    fetchElectronics()
  }, [])

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

  const handleOpenModal = (id: number, type: "project" | "user" | "request" | "disposal" | "electronic") => {
    setSelectedItem({ id, type })
    setIsModalOpen(true)
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
        </TabsList>

        <TabsContent value="project-donations">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {renderFilterPanel("project-donations")}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Doações para Projetos</CardTitle>
                  <CardDescription>Aqui você pode ver e gerenciar doações para projetos.</CardDescription>
                </div>
                <CreateProjectDonationDialog userId={studentData?.id.toString()} />
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
                  <CreateDisposalDialog />
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
                <CreateElectronicDialog userId={studentData?.id.toString()} />
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
                        <TableRow key={electronic.id}>
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
                              onClick={() => handleOpenModal(electronic.id, "electronic")}
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
      </Tabs>
      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemId={selectedItem.id}
          itemType={selectedItem.type}
        />
      )}
    </div>
  )
}

