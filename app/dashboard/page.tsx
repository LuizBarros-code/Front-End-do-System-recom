"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CalendarIcon,
  Monitor,
  Mouse,
  Keyboard,
  Cpu,
  HardDrive,
  Printer,
  Wifi,
  Clock,
  Laptop,
  Computer,
  MemoryStickIcon as Memory,
  Headphones,
  Zap,
  Battery,
} from "lucide-react"
import { DetailsDialog } from "@/components/ui/details-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface UserData {
  id: number
  name: string
  email: string
  cpf?: string
  cnpj?: string
  telefone?: string
  endereco?: string
  comprovanteDeBaixaRenda?: string
  comprovanteDeProjeto?: string
  pessoaFisica?: { id: number }
  pessoaJuridica?: { id: number }
}

interface Donation {
  id: number
  createdAt: string
  eletronicos: string
  status: string // Changed to string to accept any status value
}

interface Solicitation {
  id: number
  eletronicos: string
  status: string // Changed to string to accept any status value
  createdAt: string
}

const AVAILABLE_HOURS = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8
  return `${hour.toString().padStart(2, "0")}:00`
})

const ELECTRONIC_CATEGORIES = [
  { id: "notebooks", label: "Notebooks", icon: Laptop },
  { id: "computers", label: "Computadores Completos", icon: Computer },
  { id: "monitors", label: "Monitores", icon: Monitor },
  { id: "mice", label: "Mouses", icon: Mouse },
  { id: "keyboards", label: "Teclados", icon: Keyboard },
  { id: "processors", label: "Processadores", icon: Cpu },
  { id: "ram", label: "Memória RAM", icon: Memory },
  { id: "storage", label: "HDs/SSDs", icon: HardDrive },
  { id: "printers", label: "Impressoras", icon: Printer },
  { id: "headsets", label: "Headsets", icon: Headphones },
  { id: "network", label: "Equipamentos de Rede", icon: Wifi },
  { id: "stabilizer", label: "Estabilizadores", icon: Zap },
  { id: "nobreak", label: "Nobreaks", icon: Battery },
]

const getAvailableHours = (date?: Date) => {
  if (!date) return AVAILABLE_HOURS

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (!isToday) return AVAILABLE_HOURS

  const currentHour = now.getHours()
  return AVAILABLE_HOURS.filter((time) => {
    const hour = Number.parseInt(time.split(":")[0])
    return hour > currentHour
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [donationType, setDonationType] = useState<"GIVE" | "REQUEST">("GIVE")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<"pessoaFisicas" | "pessoaJuridicas" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [solicitations, setSolicitations] = useState<Solicitation[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [selectedItem, setSelectedItem] = useState<(Donation | Solicitation) | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [firstName, setFirstName] = useState('')
  const [firstInitial, setFirstInitial] = useState('U')
  const [descricao, setDescricao] = useState("");
  const [informacoesAdicionais, setInformacoesAdicionais] = useState("");
  const [contato, setContato] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'GIVE' | 'REQUEST'>('GIVE')
  const [solicitationsList, setSolicitationsList] = useState<Solicitation[]>([])
  const [isSolicitationBlockOpen, setIsSolicitationBlockOpen] = useState(false)
  const [solicitationBlockMsg, setSolicitationBlockMsg] = useState("")
  const [isSolicitationSuccessOpen, setIsSolicitationSuccessOpen] = useState(false)

  const API_URL = "http://26.99.103.209:3456"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserType = localStorage.getItem("userType")
        if (!storedUserType) {
          router.push("/login")
          return
        }

        if (storedUserType === "PHYSICAL") {
          const cpf = localStorage.getItem("userCpf") || ""
          const password = localStorage.getItem("userPassword") || ""
          if (!cpf || !password) {
            router.push("/login")
            return
          }
          setUserType("pessoaFisicas")
          localStorage.setItem("userTipo", "fisico")
          const response = await fetch(`${API_URL}/pessoasFisicas/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf, password }),
          })
          if (response.status === 404) {
            throw new Error("User not found")
          }
          if (!response.ok) {
            throw new Error("Failed to fetch user data")
          }
          const data = await response.json()
          setUserData(data.pessoaFisica)
          console.log('[DEBUG] setUserData:', data.pessoaFisica)
        } else if (storedUserType === "LEGAL") {
          const userId = localStorage.getItem("userId") || ""
          if (!userId) {
            router.push("/login")
            return
          }
          setUserType("pessoaJuridicas")
          localStorage.setItem("userTipo", "juridico")
          const response = await fetch(`${API_URL}/pessoasJuridicas/${userId}`)
          if (response.status === 404) {
            throw new Error("User not found")
          }
          if (!response.ok) {
            throw new Error("Failed to fetch user data")
          }
          const data = await response.json()
          setUserData(data.pessoaJuridica || data)
          console.log('[DEBUG] setUserData:', data.pessoaJuridica || data)
        } else if (storedUserType === "ADMIN") {
          const userId = localStorage.getItem("userId") || ""
          if (!userId) {
            router.push("/login")
            return
          }
          setUserType("pessoaJuridicas") // Using pessoaJuridicas for admin as well
          localStorage.setItem("userTipo", "admin")
          const response = await fetch(`${API_URL}/coordenadores/${userId}`)
          if (response.status === 404) {
            throw new Error("User not found")
          }
          if (!response.ok) {
            throw new Error("Failed to fetch user data")
          }
          const data = await response.json()
          setUserData(data)
          console.log('[DEBUG] setUserData:', data)
        } else {
          throw new Error("Invalid user type")
        }
      } catch (error) {
        console.error("Authentication error:", error)
        if (error instanceof Error && error.message === "User not found") {
          toast({
            variant: "destructive",
            title: "Usuário não encontrado",
            description: "Por favor, faça login novamente.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Ocorreu um erro ao carregar seus dados. Por favor, tente novamente.",
          })
        }
        localStorage.removeItem("userCpf")
        localStorage.removeItem("userCnpj")
        localStorage.removeItem("userType")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router, toast])

  useEffect(() => {
    // Buscar datas bloqueadas do backend
    fetch(`${API_URL}/datas`)
      .then(res => res.json())
      .then((datas: any[]) => {
        // Pega apenas datas com disponibilidade === false e converte para 'YYYY-MM-DD'
        const bloqueadas = datas
          .filter(d => d.disponibilidade === false)
          .map(d => new Date(d.data).toISOString().slice(0, 10))
        setBlockedDates(bloqueadas)
      })
      .catch(() => setBlockedDates([]))
  }, [API_URL])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName') || ''
      const first = storedName.split(' ')[0] || ''
      setFirstName(first)
      setFirstInitial(first.charAt(0).toUpperCase() || 'U')
    }
  }, [])

  const fetchSolicitations = async () => {
    if (!userData?.id || !userType) return

    try {
      const type = userType === "pessoaFisicas" ? "fisico" : "juridico"
      // Updated to use URL parameters instead of query parameters
      const response = await fetch(`${API_URL}/solicitacoes/${userData.id}/${type}`)

      if (!response.ok) {
        throw new Error("Failed to fetch solicitations")
      }

      const data = await response.json()
      setSolicitations(data)
    } catch (error) {
      console.error("Error fetching solicitations:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar solicitações",
        description: "Não foi possível carregar suas solicitações. Por favor, tente novamente.",
      })
    }
  }

  const fetchDonations = async () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const userType = typeof window !== 'undefined' ? localStorage.getItem('userTipo') : null;
    if (!userId || !userType) return;

    try {
      const response = await fetch(`${API_URL}/doacoesUsuarios/${userId}/${userType}`)
      if (!response.ok) {
        throw new Error("Failed to fetch donations")
      }
      let data = await response.json()
      // Ordenar por data decrescente
      data = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setDonations(data)
    } catch (error) {
      console.error("Error fetching donations:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar doações",
        description: "Não foi possível carregar suas doações. Por favor, tente novamente.",
      })
    }
  }

  const fetchSolicitationsList = async () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const userType = typeof window !== 'undefined' ? localStorage.getItem('userTipo') : null;
    if (!userId || !userType) return;
    try {
      const response = await fetch(`${API_URL}/solicitacoes/${userId}/${userType}`)
      if (!response.ok) {
        throw new Error("Failed to fetch solicitations")
      }
      let data = await response.json()
      data = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setSolicitationsList(data)
    } catch (error) {
      console.error("Error fetching solicitations:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar solicitações",
        description: "Não foi possível carregar suas solicitações. Por favor, tente novamente.",
      })
    }
  }

  useEffect(() => {
    if (userData?.id) {
      fetchSolicitations()
      fetchDonations()
    }
  }, [userData])

  useEffect(() => {
    if (activeTab === 'GIVE') {
      fetchDonations()
    } else {
      fetchSolicitationsList()
    }
  }, [activeTab])

  // Gerar nome aleatório DOA-XX para exibir no <pre> e enviar no payload
  const randomName = (() => {
    if (typeof window !== "undefined") {
      // Gera e mantém o mesmo valor enquanto o usuário não recarregar a página
      if (!(window as any)._doaRandomName) {
        const n = Math.floor(Math.random() * 90 + 10);
        (window as any)._doaRandomName = `DOA-${n}`;
      }
      return (window as any)._doaRandomName;
    }
    return "DOA-00";
  })();

  // Gerar nome aleatório SOL-XX para exibir no <pre> e enviar no payload
  const randomSolicitationName = (() => {
    if (typeof window !== "undefined") {
      // Gera e mantém o mesmo valor enquanto o usuário não recarregar a página
      if (!(window as any)._solRandomName) {
        const n = Math.floor(Math.random() * 90 + 10);
        (window as any)._solRandomName = `SOL-${n}`;
      }
      return (window as any)._solRandomName;
    }
    return "SOL-00";
  })();

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    alert('handleDonationSubmit chamado!');
    console.log('handleDonationSubmit chamado!');
    console.log('userData:', userData);
    console.log('userType:', userType);
    const userId = userData?.id;
    if (!userId || !userType) {
      toast({
        variant: "destructive",
        title: "Erro ao criar doação",
        description: "Usuário não autenticado. Por favor, faça login novamente.",
      })
      return;
    }

    try {
      // Usar o mesmo nome aleatório do <pre>
      const name = randomName;

      // Montar payload conforme contrato, usando os estados
      const payload: any = {
        name,
        eletronicos: selectedCategories
          .map((id) => {
            const found = ELECTRONIC_CATEGORIES.find((cat) => cat.id === id)
            return found ? found.label : id
          })
          .join(", "),
        descricao,
        informacoesAdicionais,
        horarioDeEntrega: time,
        contato,
        data: date?.toISOString() || new Date().toISOString(),
        status: "pendente",
        donatariofisico: userType === "pessoaFisicas" ? userId : null,
        donatariojuridico: userType === "pessoaJuridicas" ? userId : null,
        usuario: null,
      }

      console.log('Payload enviado para /doacoesUsuarios:', payload)
      console.log('Enviando POST para:', `${API_URL}/doacoesUsuarios`);

      const response = await fetch(`${API_URL}/doacoesUsuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log('Resposta recebida do POST:', response);

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Falha ao criar doação"
        try {
          if (errorText.trim().startsWith("{")) {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorMessage
          } else {
            console.error("Server response:", errorText)
          }
        } catch (e) {
          console.error("Error parsing response:", e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      toast({
        title: "Doação agendada com sucesso!",
        description: `Sua doação foi registrada com o ID #${data.id}`,
      })

      setIsConfirmOpen(true)

      // Reset form and refresh donations list
      setSelectedCategories([])
      setDate(new Date())
      setTime("")
      setDescricao("")
      setInformacoesAdicionais("")
      setContato("")
      if (typeof window !== "undefined") {
        const n = Math.floor(Math.random() * 90 + 10);
        (window as any)._doaRandomName = `DOA-${n}`;
      }
      fetchDonations()
    } catch (error) {
      console.error("Erro ao criar doação (detalhado):", error)
      toast({
        variant: "destructive",
        title: "Erro ao agendar doação",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao processar sua doação. Por favor, tente novamente.",
      })
    }
  }

  const handleSolicitationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = userData?.id;
    if (!userId || !userType) {
      toast({
        variant: "destructive",
        title: "Erro ao criar solicitação",
        description: "Usuário não autenticado. Por favor, faça login novamente.",
      });
      return;
    }

    // Verificação do comprovante
    if (
      userType === "pessoaFisicas" &&
      (!userData.comprovanteDeBaixaRenda || userData.comprovanteDeBaixaRenda === "")
    ) {
      setSolicitationBlockMsg("Coloque seu comprovante de baixa renda para poder solicitar a doação!\nVocê pode adicionar em Configurações (clique na bolinha com sua inicial no canto superior direito).");
      setIsSolicitationBlockOpen(true);
      return;
    }
    if (
      userType === "pessoaJuridicas" &&
      (!userData.comprovanteDeProjeto || userData.comprovanteDeProjeto === "")
    ) {
      setSolicitationBlockMsg("Preencha o comprovante do projeto para poder solicitar a doação!\nVocê pode adicionar em Configurações (clique na bolinha com sua inicial no canto superior direito).");
      setIsSolicitationBlockOpen(true);
      return;
    }

    // Montar payload conforme contrato
    try {
      const name = randomSolicitationName;
      const payload = {
        name,
        eletronicos: selectedCategories
          .map((id) => {
            const found = ELECTRONIC_CATEGORIES.find((cat) => cat.id === id);
            return found ? found.label : id;
          })
          .join(", "),
        descricao,
        informacoes: informacoesAdicionais,
        contato,
        status: "pendente",
        usuario: null,
        usuariosolicitacaofisico: userType === "pessoaFisicas" ? userId : null,
        donatariojuridico: userType === "pessoaJuridicas" ? userId : null,
      };

      const response = await fetch(`${API_URL}/solicitacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Falha ao criar solicitação";
        try {
          if (errorText.trim().startsWith("{")) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {}
        toast({
          variant: "destructive",
          title: "Erro ao criar solicitação",
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast({
        title: "Solicitação criada com sucesso!",
        description: `Sua solicitação foi registrada com o ID #${data.id}`,
      });
      setIsSolicitationSuccessOpen(true);
      setSelectedCategories([]);
      setDate(new Date());
      setTime("");
      fetchSolicitations();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar solicitação",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
      });
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userCpf")
    localStorage.removeItem("userCnpj")
    localStorage.removeItem("userType")
    router.push("/login")
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Bloquear datas vindas do backend
    const dateISO = date.toISOString().slice(0, 10)
    if (blockedDates.includes(dateISO)) {
      return true
    }

    // For donations, prevent same day and check weekends
    if (donationType === "GIVE") {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return isWeekend(date) || date < tomorrow
    }

    // For solicitations, require at least 2 business days advance notice
    const minDate = new Date(today)
    let daysToAdd = 2
    while (daysToAdd > 0) {
      minDate.setDate(minDate.getDate() + 1)
      if (!isWeekend(minDate)) {
        daysToAdd--
      }
    }

    return isWeekend(date) || date < minDate
  }

  const getStatusBadge = (status: Donation["status"] | Solicitation["status"]) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pendente: { variant: "default", label: "Pendente" },
      aprovado: { variant: "secondary", label: "Aprovado" },
      rejeitado: { variant: "destructive", label: "Rejeitado" },
      // Add fallback for unexpected status values
      default: { variant: "default", label: "Pendente" },
    }

    // Normalize the status to lowercase and get the variant info, falling back to default
    const statusInfo = variants[status?.toLowerCase()] || variants.default
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with Profile */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          <div className="text-sm text-right">
            <p className="font-medium">{firstName}</p>
            <p className="text-muted-foreground">{userData?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt="Avatar" />
                <AvatarFallback>{firstInitial}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/minhas-doacoes")}>Minhas Doações</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/minhas-solicitacoes")}>Minhas Solicitações</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Gerenciar Doações</CardTitle>
            <CardDescription>Faça uma nova doação ou solicite itens necessários</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="GIVE"
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as 'GIVE' | 'REQUEST')
                setDonationType(value as "GIVE" | "REQUEST")
                setSelectedCategories([])
                setTime("")
                setDate(new Date())
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="GIVE">Fazer Doação</TabsTrigger>
                <TabsTrigger value="REQUEST">Solicitar Doação</TabsTrigger>
              </TabsList>

              <TabsContent value="GIVE">
                <form onSubmit={handleDonationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label>Selecione os tipos de equipamentos</Label>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {ELECTRONIC_CATEGORIES.map(({ id, label, icon: Icon }) => (
                        <div
                          key={id}
                          className={`flex items-center space-x-2 rounded-md border p-3 transition-colors ${
                            selectedCategories.includes(id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            id={id}
                            checked={selectedCategories.includes(id)}
                            onCheckedChange={() => {
                              setSelectedCategories((prev) =>
                                prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
                              )
                            }}
                          />
                          <Label htmlFor={id} className="flex flex-1 items-center gap-2 cursor-pointer">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Detalhes dos Equipamentos</Label>
                        <Textarea
                          placeholder="Descreva o estado, modelo e especificações dos equipamentos..."
                          className="min-h-[120px]"
                          required
                          name="descricao"
                          value={descricao}
                          onChange={e => setDescricao(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Informações Adicionais</Label>
                        <Textarea
                          placeholder="Outras informações relevantes..."
                          className="min-h-[120px]"
                          name="informacoesAdicionais"
                          value={informacoesAdicionais}
                          onChange={e => setInformacoesAdicionais(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Data de Entrega</Label>
                      <Card>
                        <CardContent className="p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                              setDate(newDate || undefined)
                              setTime("")
                            }}
                            disabled={isDateDisabled}
                            className="rounded-md"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Horário de Entrega</Label>
                        <Select
                          onValueChange={(value) => {
                            console.log("Setting time:", value)
                            setTime(value)
                          }}
                          value={time}
                          disabled={!date || isDateDisabled(date)}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !date
                                  ? "Selecione uma data primeiro"
                                  : isDateDisabled(date)
                                    ? "Data não disponível"
                                    : "Selecione um horário"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableHours(date).map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Contato</Label>
                        <Input type="tel" placeholder="(00) 00000-0000" name="contato" required value={contato} onChange={e => setContato(e.target.value)} />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!date || !time || selectedCategories.length === 0}
                      >
                        {donationType === "GIVE" ? "Agendar Doação" : "Enviar Solicitação"}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="REQUEST">
                <form onSubmit={handleSolicitationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label>Selecione os tipos de equipamentos necessários</Label>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {ELECTRONIC_CATEGORIES.map(({ id, label, icon: Icon }) => (
                        <div
                          key={id}
                          className={`flex items-center space-x-2 rounded-md border p-3 transition-colors ${
                            selectedCategories.includes(id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            id={`request-${id}`}
                            checked={selectedCategories.includes(id)}
                            onCheckedChange={() => {
                              setSelectedCategories((prev) =>
                                prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
                              )
                            }}
                          />
                          <Label htmlFor={`request-${id}`} className="flex flex-1 items-center gap-2 cursor-pointer">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Detalhes dos Equipamentos Necessários</Label>
                        <Textarea
                          placeholder="Descreva os equipamentos que você precisa..."
                          className="min-h-[120px]"
                          required
                          name="descricao"
                          value={descricao}
                          onChange={e => setDescricao(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Informações Adicionais</Label>
                        <Textarea
                          placeholder="Outras informações relevantes..."
                          className="min-h-[120px]"
                          name="informacoesAdicionais"
                          value={informacoesAdicionais}
                          onChange={e => setInformacoesAdicionais(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Contato</Label>
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        name="contato"
                        required
                        value={contato}
                        onChange={e => setContato(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={selectedCategories.length === 0}
                    >
                      {donationType === "GIVE" ? "Agendar Doação" : "Enviar Solicitação"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Sidebar with Recent Donations */}
        <Card className="order-1 md:order-2">
          <CardHeader>
            <CardTitle>
              {activeTab === 'GIVE' ? 'Minhas Doações Recentes' : 'Minhas Solicitações Recentes'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'GIVE'
                ? 'Acompanhe o status das suas doações e solicitações'
                : 'Acompanhe o status das suas solicitações de doação'}
            </CardDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={activeTab === 'GIVE' ? fetchDonations : fetchSolicitationsList}
            >
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            {activeTab === 'GIVE'
              ? (donations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não possui doações.</p>
                    <p>Comece fazendo uma doação!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...donations]
                      .slice(0, 5)
                      .map((item) => (
                        <Card key={`${item.id}-donation`}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                  Doação #{item.id}
                                </h3>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.eletronicos}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <CalendarIcon className="mr-1 h-4 w-4" />
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ))
              : (solicitationsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não possui solicitações.</p>
                    <p>Comece solicitando uma doação!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...solicitationsList]
                      .slice(0, 5)
                      .map((item) => (
                        <Card key={`${item.id}-solicitation`}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                  Solicitação #{item.id}
                                </h3>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.eletronicos}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <CalendarIcon className="mr-1 h-4 w-4" />
                                  {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
      <DetailsDialog
        data={selectedItem ? {
          id: selectedItem.id,
          name: userData?.name || '',
          eletronicos: selectedItem.eletronicos || '',
          descricao: (selectedItem as any).descricao || '',
          informacoesAdicionais: (selectedItem as any).informacoesAdicionais,
          informacoes: (selectedItem as any).informacoes,
          horarioDeEntrega: (selectedItem as any).horarioDeEntrega,
          horarioparapegar: (selectedItem as any).horarioparapegar,
          contato: userData?.telefone || '',
          data: (selectedItem as any).data || selectedItem.createdAt,
          status: selectedItem.status,
          createdAt: selectedItem.createdAt,
        } : null}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        type={selectedItem?.hasOwnProperty("horarioparapegar") ? "solicitacao" : "doacao"}
      />
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doação criada com sucesso!</DialogTitle>
            <DialogDescription>
              Sua doação foi registrada. Estamos no aguardo da sua ajuda!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={isSolicitationBlockOpen} onOpenChange={setIsSolicitationBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atenção</DialogTitle>
            <DialogDescription>
              {solicitationBlockMsg.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
            </DialogDescription>
          </DialogHeader>
          <Button className="mt-4 w-full" onClick={() => setIsSolicitationBlockOpen(false)}>
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isSolicitationSuccessOpen} onOpenChange={setIsSolicitationSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitação enviada!</DialogTitle>
            <DialogDescription>
              Sua solicitação foi requerida com sucesso, aguarde a nossa análise.
            </DialogDescription>
          </DialogHeader>
          <Button className="mt-4 w-full" onClick={() => setIsSolicitationSuccessOpen(false)}>
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

