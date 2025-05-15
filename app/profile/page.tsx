"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button, Label } from "../../components/ui/common"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Building2, GraduationCap, Phone, Mail, MapPin } from "lucide-react"

interface UserData {
  id: number
  name: string
  email: string
  matricula?: string
  curso?: string
  cpf?: string
  cnpj?: string
  telefone?: string
  endereco?: string
  comprovanteDeBaixaRenda?: string
  comprovanteDeProjeto?: string
  dias?: string
  horario?: string
  bolsistaTipo?: string
  cargo?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<"STUDENT" | "PHYSICAL" | "LEGAL" | "ADMIN" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId")
        const userTypeStorage = localStorage.getItem("userType") || localStorage.getItem("userTipo")
        if (!userId || !userTypeStorage) {
          router.push("/login")
          return
        }
        let endpoint = ""
        let type: "STUDENT" | "PHYSICAL" | "LEGAL" | "ADMIN" = "STUDENT"
        if (userTypeStorage === "STUDENT" || userTypeStorage === "student") {
          endpoint = `${API_URL}/alunos/${userId}`
          type = "STUDENT"
        } else if (userTypeStorage === "fisico" || userTypeStorage === "PHYSICAL") {
          endpoint = `${API_URL}/pessoasFisicas/${userId}`
          type = "PHYSICAL"
        } else if (userTypeStorage === "juridico" || userTypeStorage === "LEGAL") {
          endpoint = `${API_URL}/pessoasJuridicas/${userId}`
          type = "LEGAL"
        } else if (userTypeStorage === "ADMIN") {
          endpoint = `${API_URL}/coordenadores/${userId}`
          type = "ADMIN"
        } else {
          router.push("/login")
          return
        }
        setUserType(type)
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error("Erro ao buscar dados do usuário")
        const data = await response.json()
        setUserData(data)
      } catch (error) {
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Nenhum dado de usuário encontrado.</p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="outline" className="mb-4" onClick={() => {
        if (userType === "STUDENT") {
          router.push('/student')
        } else if (userType === "ADMIN") {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }}>
        Voltar
      </Button>
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg" alt={userData.name} />
              <AvatarFallback className="text-lg">{getInitials(userData.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-muted-foreground">
                {userType === "STUDENT" && "Estudante"}
                {userType === "PHYSICAL" && "Pessoa Física"}
                {userType === "LEGAL" && "Pessoa Jurídica"}
                {userType === "ADMIN" && "Administrador"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <p className="font-medium">{userData.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-medium">{userData.email}</p>
              </div>
              {userType === "STUDENT" && (
                <>
                  <div>
                    <Label>Matrícula</Label>
                    <p className="font-medium">{userData.matricula}</p>
                  </div>
                  <div>
                    <Label>Curso</Label>
                    <p className="font-medium">{userData.curso}</p>
                  </div>
                  {userData.dias && (
                    <div>
                      <Label>Dias</Label>
                      <p className="font-medium">{userData.dias}</p>
                    </div>
                  )}
                  {userData.horario && (
                    <div>
                      <Label>Horário</Label>
                      <p className="font-medium">{userData.horario}</p>
                    </div>
                  )}
                  {userData.bolsistaTipo && (
                    <div>
                      <Label>Tipo de Bolsa</Label>
                      <p className="font-medium">{userData.bolsistaTipo}</p>
                    </div>
                  )}
                  {userData.cargo && (
                    <div>
                      <Label>Cargo</Label>
                      <p className="font-medium">{userData.cargo}</p>
                    </div>
                  )}
                </>
              )}
              {userType === "PHYSICAL" && (
                <>
                  <div>
                    <Label>CPF</Label>
                    <p className="font-medium">{userData.cpf}</p>
                  </div>
                  {userData.telefone && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="font-medium">{userData.telefone}</p>
                    </div>
                  )}
                  {userData.endereco && (
                    <div>
                      <Label>Endereço</Label>
                      <p className="font-medium">{userData.endereco}</p>
                    </div>
                  )}
                  {userData.comprovanteDeBaixaRenda && (
                    <div>
                      <Label>Comprovante de Baixa Renda</Label>
                      <a href={userData.comprovanteDeBaixaRenda.startsWith('http') ? userData.comprovanteDeBaixaRenda : `http://localhost:3456${userData.comprovanteDeBaixaRenda}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver documento</a>
                    </div>
                  )}
                </>
              )}
              {userType === "LEGAL" && (
                <>
                  <div>
                    <Label>CNPJ</Label>
                    <p className="font-medium">{userData.cnpj}</p>
                  </div>
                  {userData.telefone && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="font-medium">{userData.telefone}</p>
                    </div>
                  )}
                  {userData.endereco && (
                    <div>
                      <Label>Endereço</Label>
                      <p className="font-medium">{userData.endereco}</p>
                    </div>
                  )}
                  {userData.comprovanteDeProjeto && (
                    <div>
                      <Label>Comprovante de Projeto</Label>
                      <p className="font-medium">{userData.comprovanteDeProjeto}</p>
                    </div>
                  )}
                </>
              )}
              {userType === "ADMIN" && (
                <>
                  <div>
                    <Label>Nome</Label>
                    <p className="font-medium">{userData.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  {userData.telefone && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="font-medium">{userData.telefone}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => {
          if (userType === "STUDENT") {
            router.push("/student")
          } else if (userType === "ADMIN") {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        }} className="w-full sm:w-auto">
          Voltar ao {userType === "STUDENT" ? "Painel do Estudante" : userType === "ADMIN" ? "Painel do Coordenador" : "Dashboard"}
        </Button>
      </div>
    </div>
  )
}

