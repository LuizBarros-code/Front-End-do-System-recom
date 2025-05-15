"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, Package, Truck, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
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
  descricao?: string
  informacoesAdicionais?: string
  horarioDeEntrega?: string
  contato?: string
  data?: string
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

  useEffect(() => {
    const fetchDonations = async () => {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const userType = typeof window !== 'undefined' ? localStorage.getItem('userTipo') : null;
      if (!userId || !userType) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/doacoesUsuarios/${userId}/${userType}`);
        if (!response.ok) throw new Error("Erro ao buscar doações");
        let data = await response.json();
        data = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDonations(data);
      } catch (e) {
        setDonations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, [router, API_URL]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pendente: { variant: "default", label: "Pendente" },
      aprovado: { variant: "secondary", label: "Aprovado" },
      rejeitado: { variant: "destructive", label: "Rejeitado" },
      default: { variant: "default", label: "Pendente" },
    };
    const statusInfo = variants[status?.toLowerCase()] || variants.default;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Minhas Doações</h1>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>Voltar para o Dashboard</Button>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>Atualizar</Button>
      </div>
      {isLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Você ainda não possui doações.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {donations.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Doação #{item.id}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-muted-foreground">{item.eletronicos}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {item.descricao && (
                  <div>
                    <span className="font-medium">Descrição: </span>
                    <span>{item.descricao}</span>
                  </div>
                )}
                {item.informacoesAdicionais && (
                  <div>
                    <span className="font-medium">Informações Adicionais: </span>
                    <span>{item.informacoesAdicionais}</span>
                  </div>
                )}
                {item.horarioDeEntrega && (
                  <div>
                    <span className="font-medium">Horário de Entrega: </span>
                    <span>{item.horarioDeEntrega}</span>
                  </div>
                )}
                {item.contato && (
                  <div>
                    <span className="font-medium">Contato: </span>
                    <span>{item.contato}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

