"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, ArrowLeft } from "lucide-react"
import { DetailsDialog } from "@/components/ui/details-dialog"

interface UserData {
  id: number
  name: string
  email: string
}

interface Solicitation {
  id: number
  eletronicos: string
  status: string
  createdAt: string
  descricao: string
  informacoes: string
  horarioparapegar: string
  contato: string
}

export default function MyRequestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [solicitations, setSolicitations] = useState<Solicitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Solicitation | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<"pessoaFisicas" | "pessoaJuridicas" | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

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
        fetchSolicitations(data.id, storedUserType === "PHYSICAL" ? "fisico" : "juridico")
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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const fetchSolicitations = async (userId: number, userType: string) => {
    try {
      const response = await fetch(`${API_URL}/solicitacoes/${userId}/${userType}`)

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "success" | "destructive"; label: string }> = {
      pendente: { variant: "default", label: "Pendente" },
      aprovado: { variant: "success", label: "Aprovado" },
      rejeitado: { variant: "destructive", label: "Rejeitado" },
      default: { variant: "default", label: "Pendente" },
    }

    const statusInfo = variants[status.toLowerCase()] || variants.default
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
    <div className="container mx-auto py-8 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      {solicitations.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Você ainda não possui solicitações.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solicitations.map((solicitation) => (
            <Card key={solicitation.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Solicitação #{solicitation.id}
                  {getStatusBadge(solicitation.status)}
                </CardTitle>
                <CardDescription>{solicitation.eletronicos}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date(solicitation.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-sm">{solicitation.descricao.slice(0, 100)}...</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      setSelectedItem(solicitation)
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
      )}
      <DetailsDialog data={selectedItem} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} type="solicitacao" />
    </div>
  )
}

