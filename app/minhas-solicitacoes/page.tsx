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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

  useEffect(() => {
    const fetchSolicitations = async () => {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userType = typeof window !== 'undefined' ? localStorage.getItem('userTipo') : null;
      if (!userId || !userType) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/solicitacoes/${userId}/${userType}`)
        if (!response.ok) throw new Error("Erro ao buscar solicitações");
        let data = await response.json();
        data = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSolicitations(data);
      } catch (error) {
        setSolicitations([]);
        toast({
          variant: "destructive",
          title: "Erro ao carregar solicitações",
          description: "Não foi possível carregar suas solicitações. Por favor, tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSolicitations();
  }, [router, API_URL, toast]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pendente: { variant: "default", label: "Pendente" },
      aprovado: { variant: "secondary", label: "Aprovado" },
      rejeitado: { variant: "destructive", label: "Rejeitado" },
      default: { variant: "default", label: "Pendente" },
    }

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

