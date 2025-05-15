"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"

type UserType = "PHYSICAL" | "LEGAL" | "STUDENT" | "ADMIN"

export default function ForgotPasswordPage() {
  const [userType, setUserType] = useState<UserType>("PHYSICAL")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    let endpoint = ""
    let payload: any = {}
    if (userType === "STUDENT") {
      endpoint = "/alunos/forgot-password"
      payload = { matricula: formData.get("matricula") }
    } else if (userType === "PHYSICAL") {
      endpoint = "/pessoaFisicas/forgot-password"
      payload = { cpf: formData.get("cpf") }
    } else if (userType === "LEGAL") {
      endpoint = "/pessoasJuridicas/forgot-password"
      payload = { cnpj: formData.get("cnpj") }
    } else if (userType === "ADMIN") {
      endpoint = "/coordenadores/forgot-password"
      payload = { email: formData.get("email") }
    }
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setSuccess("Se os dados estiverem corretos, você receberá instruções no seu email cadastrado.")
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.message || "Não foi possível enviar o email de recuperação.")
      }
    } catch (err) {
      setError("Erro ao tentar recuperar a senha. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#141922] p-4">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 70%, rgba(132, 225, 0, 0.15), rgba(0, 0, 0, 0) 60%)",
        }}
      />
      <Link
        href="/login"
        className="absolute top-4 left-4 inline-flex items-center text-white hover:text-[#84e100] transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para login
      </Link>
      <Card className="w-[480px] bg-[#1a212b]/90 backdrop-blur-sm border-gray-800 z-10">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#84e100] text-2xl text-center">Recuperar Senha</CardTitle>
          <CardDescription className="text-gray-400 text-center">Informe seus dados para receber instruções de recuperação</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4 bg-green-900/20 border-green-900 text-green-300">
              <Mail className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <Tabs
            defaultValue="PHYSICAL"
            onValueChange={(value) => {
              setUserType(value as UserType)
              setError(null)
              setSuccess(null)
            }}
          >
            <TabsList className="grid w-full grid-cols-4 gap-1 bg-[#141922] p-1 rounded-lg">
              <TabsTrigger
                value="PHYSICAL"
                className="px-2 py-1.5 text-sm data-[state=active]:bg-[#84e100] data-[state=active]:text-[#141922]"
              >
                Pessoa Física
              </TabsTrigger>
              <TabsTrigger
                value="LEGAL"
                className="px-2 py-1.5 text-sm data-[state=active]:bg-[#84e100] data-[state=active]:text-[#141922]"
              >
                Pessoa Jurídica
              </TabsTrigger>
              <TabsTrigger
                value="STUDENT"
                className="px-2 py-1.5 text-sm data-[state=active]:bg-[#84e100] data-[state=active]:text-[#141922]"
              >
                Aluno
              </TabsTrigger>
              <TabsTrigger
                value="ADMIN"
                className="px-2 py-1.5 text-sm data-[state=active]:bg-[#84e100] data-[state=active]:text-[#141922]"
              >
                Admin
              </TabsTrigger>
            </TabsList>
            <TabsContent value="PHYSICAL">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    placeholder="Digite seu CPF"
                    maxLength={14}
                    required
                    autoComplete="cpf"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="LEGAL">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-white">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    placeholder="Digite seu CNPJ"
                    maxLength={18}
                    required
                    autoComplete="cnpj"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="STUDENT">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula" className="text-white">Matrícula</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    placeholder="Digite sua matrícula"
                    required
                    autoComplete="matricula"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="ADMIN">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu email"
                    required
                    autoComplete="email"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 