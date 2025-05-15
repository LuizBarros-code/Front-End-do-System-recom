"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UserType = "PHYSICAL" | "LEGAL" | "STUDENT" | "ADMIN"

const API_URL = "http://26.99.103.209:3456"

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>("PHYSICAL")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{
    email?: string
    enrollment?: string
    cpf?: string
    cnpj?: string
    password?: string
  }>({})
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = (formData: FormData): boolean => {
    const newErrors: {
      email?: string
      enrollment?: string
      cpf?: string
      cnpj?: string
      password?: string
    } = {}
    let isValid = true

    if (userType === "PHYSICAL") {
      const cpf = formData.get("cpf") as string
      if (!cpf) {
        newErrors.cpf = "O CPF é obrigatório"
        isValid = false
      } else if (!/^\d{11}$/.test(cpf.replace(/\D/g, ""))) {
        newErrors.cpf = "CPF inválido"
        isValid = false
      }
    }
    if (userType === "LEGAL") {
      const cnpj = formData.get("cnpj") as string
      if (!cnpj) {
        newErrors.cnpj = "O CNPJ é obrigatório"
        isValid = false
      } else if (!/^\d{14}$/.test(cnpj.replace(/\D/g, ""))) {
        newErrors.cnpj = "CNPJ inválido"
        isValid = false
      }
    }
    if (userType === "STUDENT") {
      const enrollment = formData.get("enrollment") as string
      if (!enrollment) {
        newErrors.enrollment = "A matrícula é obrigatória"
        isValid = false
      } else if (enrollment.length < 5) {
        newErrors.enrollment = "Matrícula inválida"
        isValid = false
      }
    }
    if (userType === "ADMIN") {
      const email = formData.get("email") as string
      if (!email) {
        newErrors.email = "O email é obrigatório"
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Email inválido"
        isValid = false
      }
    }
    const password = formData.get("password") as string
    if (!password) {
      newErrors.password = "A senha é obrigatória"
      isValid = false
    } else if (password.length < 6 && userType !== "ADMIN") {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
      isValid = false
    }
    setFormErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    // Validar o formulário antes de enviar
    if (!validateForm(formData)) {
      return
    }
    setIsLoading(true)
    try {
      const cpf = formData.get("cpf") as string
      const cnpj = formData.get("cnpj") as string
      const matricula = formData.get("enrollment") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      // Special case for admin login
      if (userType === "ADMIN") {
        try {
          console.log("Attempting admin login with:", { email, password })
          const response = await fetch(`${API_URL}/coordenadores/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })
          console.log("Admin login response status:", response.status)
          let data = null;
          try {
            data = await response.json();
            console.log("Admin login response JSON:", data);
          } catch (jsonErr) {
            console.error("Erro ao fazer parse do JSON da resposta:", jsonErr);
          }
          if (response.ok) {
            const coordenador = data && data.coordenador;
            if (coordenador && coordenador.id) {
              localStorage.setItem("userType", "ADMIN");
              localStorage.setItem("userId", coordenador.id.toString());
              localStorage.setItem("coordinatorEmail", email);
              localStorage.setItem("coordinatorName", coordenador.name || "");
              console.log("Login admin bem-sucedido, redirecionando para /admin");
              router.push("/admin");
            } else {
              console.error("Dados do coordenador não encontrados na resposta:", data);
              setError("Falha na autenticação. Dados do coordenador não encontrados.");
            }
          } else {
            let errorMessage = "Credenciais inválidas";
            if (data && data.message) errorMessage = data.message;
            if (response.status === 404) {
              errorMessage = "Email não encontrado. Verifique e tente novamente.";
            } else if (response.status === 401) {
              errorMessage = "Senha incorreta. Verifique e tente novamente.";
            } else if (response.status === 403) {
              errorMessage = "Acesso negado. Sua conta pode estar bloqueada.";
            } else if (response.status >= 500) {
              errorMessage = "Erro no servidor. Tente novamente mais tarde.";
            }
            console.error("Erro no login admin:", errorMessage, data);
            setError(errorMessage);
          }
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Erro ao fazer login como administrador:", error);
          setError("Erro inesperado ao tentar logar como administrador.");
          setIsLoading(false);
          return;
        }
      }
      let endpoint = ""
      let fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
        },
      }
      switch (userType) {
        case "PHYSICAL":
          endpoint = `/pessoasFisicas/verify`
          fetchOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf: cpf.replace(/\D/g, ""), password }),
          }
          break
        case "LEGAL":
          endpoint = `/pessoasJuridicas/verify`
          fetchOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cnpj: cnpj.replace(/\D/g, ""), password }),
          }
          break
        case "STUDENT":
          endpoint = `/alunos/verify`
          fetchOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matricula, password }),
          }
          break
      }
      const response = await fetch(`${API_URL}${endpoint}`, fetchOptions)
      if (response.ok) {
        const data = await response.json()
        if (userType === "STUDENT") {
          localStorage.setItem("userMatricula", matricula)
        } else if (userType === "PHYSICAL") {
          localStorage.setItem("userCpf", cpf.replace(/\D/g, ""))
          localStorage.setItem("userPassword", password)
          // Salvar id, tipo e name do usuário
          if (data && data.pessoaFisica) {
            localStorage.setItem("userId", String(data.pessoaFisica.id))
            localStorage.setItem("userTipo", data.pessoaFisica.tipo)
            localStorage.setItem("userName", data.pessoaFisica.name)
          }
        } else if (userType === "LEGAL") {
          localStorage.setItem("userCnpj", cnpj)
          // Salvar id, tipo e name do usuário jurídico
          if (data && data.pessoaJuridica) {
            localStorage.setItem("userId", String(data.pessoaJuridica.id))
            localStorage.setItem("userTipo", data.pessoaJuridica.tipo)
            localStorage.setItem("userName", data.pessoaJuridica.name)
          }
        }
        localStorage.setItem("userType", userType)
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando...",
        })
        // Redirect based on user type
        if (userType === "STUDENT") {
          router.push("/student")
        } else if (userType === "PHYSICAL") {
          router.push("/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Try to get error message from response
        let errorMessage = "Credenciais inválidas"
        const contentType = response.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch {
            errorMessage = response.statusText || errorMessage
          }
        }

        // Mensagens de erro mais específicas baseadas no status
        if (response.status === 404) {
          if (userType === "STUDENT") {
            errorMessage = "Matrícula não encontrada. Verifique e tente novamente."
            setFormErrors({ enrollment: "Matrícula não encontrada" })
          } else {
            errorMessage = "Email não encontrado. Verifique e tente novamente."
            setFormErrors({ email: "Email não encontrado" })
          }
        } else if (response.status === 401) {
          errorMessage = "Senha incorreta. Verifique e tente novamente."
          setFormErrors({ password: "Senha incorreta" })
        } else if (response.status === 403) {
          errorMessage = "Acesso negado. Sua conta pode estar bloqueada."
        } else if (response.status >= 500) {
          errorMessage = "Erro no servidor. Tente novamente mais tarde."
        }

        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      // O erro já foi definido no setError acima
    } finally {
      setIsLoading(false)
    }
  }

  const clearErrors = () => {
    setError(null)
    setFormErrors({})
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#141922] p-4">
      {/* Simple gradient background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 70%, rgba(132, 225, 0, 0.15), rgba(0, 0, 0, 0) 60%)",
        }}
      />

      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center text-white hover:text-[#84e100] transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para página inicial
      </Link>

      <Card className="w-[480px] bg-[#1a212b]/90 backdrop-blur-sm border-gray-800 z-10">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#84e100] text-2xl text-center">Projeto Recom</CardTitle>
          <CardDescription className="text-gray-400 text-center">Faça login para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            defaultValue="PHYSICAL"
            onValueChange={(value) => {
              setUserType(value as UserType)
              clearErrors()
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
                  <Label htmlFor="cpf" className="text-white">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    placeholder="Digite seu CPF"
                    maxLength={14}
                    onChange={e => {
                      // Máscara simples de CPF
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                      e.target.value = value;
                    }}
                    required
                    autoComplete="cpf"
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.cpf ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                  />
                  {formErrors.cpf && <p className="text-red-400 text-sm mt-1">{formErrors.cpf}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    onChange={() => {
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: undefined })
                      }
                    }}
                  />
                  {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-[#84e100]">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="LEGAL">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-white">
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    placeholder="Digite seu CNPJ"
                    maxLength={18}
                    onChange={e => {
                      // Máscara simples de CNPJ
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.replace(/(\d{2})(\d)/, "$1.$2");
                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                      value = value.replace(/(\d{3})(\d)/, "$1/$2");
                      value = value.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
                      e.target.value = value;
                    }}
                    required
                    autoComplete="cnpj"
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.cnpj ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                  />
                  {formErrors.cnpj && <p className="text-red-400 text-sm mt-1">{formErrors.cnpj}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    onChange={() => {
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: undefined })
                      }
                    }}
                  />
                  {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-[#84e100]">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="STUDENT">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollment" className="text-white">
                    Matrícula
                  </Label>
                  <Input
                    id="enrollment"
                    name="enrollment"
                    type="text"
                    required
                    disabled={isLoading}
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.enrollment ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    onChange={() => {
                      if (formErrors.enrollment) {
                        setFormErrors({ ...formErrors, enrollment: undefined })
                      }
                    }}
                  />
                  {formErrors.enrollment && <p className="text-red-400 text-sm mt-1">{formErrors.enrollment}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    onChange={() => {
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: undefined })
                      }
                    }}
                  />
                  {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-[#84e100]">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </form>
            </TabsContent>

            {/* New Admin Tab Content */}
            <TabsContent value="ADMIN">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    onChange={() => {
                      if (formErrors.email) {
                        setFormErrors({ ...formErrors, email: undefined })
                      }
                    }}
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className={`bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 ${
                      formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    onChange={() => {
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: undefined })
                      }
                    }}
                  />
                  {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Entrar como Administrador
                    </>
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-[#84e100]">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-[#84e100] hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
