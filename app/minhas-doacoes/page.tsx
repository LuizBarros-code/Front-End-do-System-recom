"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, Package, Truck, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface Donation {
  id: number
  eletronicos: string
  status: string
  createdAt: string
  descricao: string
  informacoesAdicionais: string
  horarioDeEntrega: string
  contato: string
}

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
}

export default function MinhasDoacoesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [donations, setDonations] = useState<Donation[]>([])
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<"pessoaFisicas" | "pessoaJuridicas" | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const email = localStorage.getItem("userEmail")
        const storedUserType = localStorage.getItem("userType")

        if (!email || !storedUserType) {
          router.push("/login")
          return
        }

        let endpoint = ""
        if (storedUserType === "PHYSICAL") {
          endpoint = `/pessoaFisicas/email/${email}`
          setUserType("pessoaFisicas")
        } else if (storedUserType === "LEGAL") {
          endpoint = `/pessoaJuridicas/email/${email}`
          setUserType("pessoaJuridicas")
        } else {
          throw new Error("Invalid user type")
        }

        const response = await fetch(`${API_URL}${endpoint}`)

        if (response.status === 404) {
          throw new Error("User not found")
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUserData(data)
        fetchDonations(data.id, storedUserType === "PHYSICAL" ? "fisico" : "juridico")
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
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userType")
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, toast])

  const fetchDonations = async (userId: number, type: string) => {
    try {
      const response = await fetch(`${API_URL}/doacoesUsuarios/${userId}/${type}`)

      if (!response.ok) {
        throw new Error("Failed to fetch donations")
      }

      const data = await response.json()
      setDonations(data)
    } catch (error) {
      console.error("Error fetching donations:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar doações",
        description: "Não foi possível carregar suas doações. Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "warning" | "success"; label: string; icon: any }> = {
      pendente: { variant: "default", label: "Pendente", icon: Package },
      em_transito: { variant: "warning", label: "Em Trânsito", icon: Truck },
      concluido: { variant: "success", label: "Concluído", icon: CheckCircle },
      default: { variant: "default", label: "Pendente", icon: Package },
    }
    const statusInfo = variants[status.toLowerCase()] || variants.default
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <statusInfo.icon className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    )
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Minhas Doações</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Doações</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-center py-4">Você ainda não possui doações registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.id}</TableCell>
                    <TableCell>{donation.eletronicos}</TableCell>
                    <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(donation.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedDonation(donation)}>
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Doação</DialogTitle>
                            <DialogDescription>Informações detalhadas sobre a doação #{donation.id}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">Itens:</h4>
                              <p>{selectedDonation?.eletronicos}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Descrição:</h4>
                              <p>{selectedDonation?.descricao}</p>
                            </div>
                            {selectedDonation?.informacoesAdicionais && (
                              <div>
                                <h4 className="font-semibold">Informações Adicionais:</h4>
                                <p>{selectedDonation.informacoesAdicionais}</p>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {new Date(selectedDonation?.createdAt || "").toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {selectedDonation?.horarioDeEntrega}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold">Status:</h4>
                              {selectedDonation && getStatusBadge(selectedDonation.status)}
                            </div>
                            <div>
                              <h4 className="font-semibold">Contato:</h4>
                              <p>{selectedDonation?.contato}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

