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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<"STUDENT" | "PHYSICAL" | "LEGAL" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem("userEmail")
        const matricula = localStorage.getItem("userMatricula")
        const type = localStorage.getItem("userType") as "STUDENT" | "PHYSICAL" | "LEGAL"

        if (!email && !matricula) {
          router.push("/login")
          return
        }

        setUserType(type)

        let endpoint = ""
        if (type === "STUDENT") {
          endpoint = `${API_URL}/alunos/matricula/${matricula}`
        } else if (type === "PHYSICAL") {
          endpoint = `${API_URL}/pessoaFisicas/email/${email}`
        } else if (type === "LEGAL") {
          endpoint = `${API_URL}/pessoaJuridicas/email/${email}`
        }

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data: UserData = await response.json()
        setUserData(data)
      } catch (error) {
        console.error("Error fetching user data:", error)
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
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
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Nome</Label>
                      <p className="font-medium">{userData.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>

                  {userType === "STUDENT" && (
                    <>
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Matrícula</Label>
                          <p className="font-medium">{userData.matricula}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Curso</Label>
                          <p className="font-medium">{userData.curso}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {userType === "PHYSICAL" && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground">CPF</Label>
                        <p className="font-medium">{userData.cpf}</p>
                      </div>
                    </div>
                  )}

                  {userType === "LEGAL" && (
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground">CNPJ</Label>
                        <p className="font-medium">{userData.cnpj}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="font-medium">{userData.telefone || "Não informado"}</p>
                    </div>
                  </div>

                  {userData.endereco && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground">Endereço</Label>
                        <p className="font-medium">{userData.endereco}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {userType === "PHYSICAL" && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Comprovante de Baixa Renda</h3>
                    {userData.comprovanteDeBaixaRenda ? (
                      userData.comprovanteDeBaixaRenda.startsWith("http") ? (
                        <a
                          href={userData.comprovanteDeBaixaRenda}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver documento
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{userData.comprovanteDeBaixaRenda}</p>
                      )
                    ) : (
                      <p className="text-muted-foreground">Nenhum documento anexado</p>
                    )}
                  </div>
                )}

                {userType === "LEGAL" && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Comprovante de Projeto</h3>
                    <p className="text-muted-foreground">
                      {userData.comprovanteDeProjeto || "Nenhum documento anexado"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => router.push(userType === "STUDENT" ? "/student" : "/dashboard")}
          className="w-full sm:w-auto"
        >
          Voltar ao {userType === "STUDENT" ? "Painel do Estudante" : "Dashboard"}
        </Button>
      </div>
    </div>
  )
}

