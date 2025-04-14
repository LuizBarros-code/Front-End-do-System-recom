"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "../../config/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StudentRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ title: string; message: string; type: "error" | "warning" | "info" } | null>(
    null,
  )
  const [isBolsista, setIsBolsista] = useState(false)
  const [day1, setDay1] = useState<string>("")
  const [day2, setDay2] = useState<string>("")
  const [curso, setCurso] = useState<string>("")
  const router = useRouter()

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
  const cursos = [
    "Ciência da Computação",
    "Direito",
    "GTI",
    "Medicina",
    "Administração",
    "Economia",
    "Comercio Exterior",
    "Ciências Contábeis",
    "Serviço Social",
    "Psicologia",
  ]

  // Função para traduzir erros técnicos em mensagens amigáveis
  const getUserFriendlyError = (error: Error, statusCode?: number) => {
    // Extrair o código de status do erro, se presente
    const errorMessage = error.message
    const statusMatch = errorMessage.match(/Status: (\d+)/)
    const status = statusCode || (statusMatch ? Number.parseInt(statusMatch[1]) : null)

    // Traduzir códigos de erro comuns em mensagens amigáveis
    switch (status) {
      case 400:
        return {
          title: "Dados inválidos",
          message:
            "Alguns campos não foram preenchidos corretamente. Por favor, verifique as informações e tente novamente.",
          type: "warning" as const,
        }
      case 401:
        return {
          title: "Acesso não autorizado",
          message: "Você precisa estar logado para realizar esta operação.",
          type: "warning" as const,
        }
      case 403:
        return {
          title: "Acesso negado",
          message: "Você não tem permissão para realizar esta operação.",
          type: "warning" as const,
        }
      case 404:
        return {
          title: "Não encontrado",
          message: "O recurso que você está tentando acessar não existe.",
          type: "info" as const,
        }
      case 409:
        return {
          title: "Informação já existe",
          message: "Parece que você já está registrado no sistema. Verifique seu e-mail ou matrícula.",
          type: "info" as const,
        }
      case 429:
        return {
          title: "Muitas tentativas",
          message:
            "Você fez muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.",
          type: "warning" as const,
        }
      case 500:
        return {
          title: "Erro no sistema",
          message:
            "Ocorreu um problema no nosso servidor. Isso pode acontecer quando as informações já existem no banco de dados ou quando o sistema está temporariamente indisponível. Por favor, tente novamente mais tarde.",
          type: "error" as const,
        }
      case 503:
        return {
          title: "Serviço indisponível",
          message: "O sistema está temporariamente indisponível. Por favor, tente novamente mais tarde.",
          type: "warning" as const,
        }
      default:
        return {
          title: "Erro inesperado",
          message: "Ocorreu um erro inesperado. Por favor, verifique sua conexão com a internet e tente novamente.",
          type: "error" as const,
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    // Validações básicas do formulário
    if (!curso) {
      setError({
        title: "Curso não selecionado",
        message: "Por favor, selecione seu curso antes de continuar.",
        type: "warning",
      })
      setIsLoading(false)
      return
    }

    if (!isBolsista && !day1) {
      setError({
        title: "Dia não selecionado",
        message: "Por favor, selecione pelo menos o primeiro dia de preferência.",
        type: "warning",
      })
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        dias: isBolsista ? daysOfWeek.join(", ") : [day1, day2].filter(Boolean).join(", "),
        matricula: formData.get("matricula"),
        curso: curso,
        periodo: formData.get("periodo"),
        bolsista: isBolsista,
      }

      const response = await fetch(`${API_BASE_URL}/inscritos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      // Tentar obter dados da resposta, mesmo em caso de erro
      let data
      try {
        data = await response.json()
      } catch (e) {
        // Se não conseguir parsear JSON, continua sem os dados
      }

      if (!response.ok) {
        // Usar o código de status da resposta para gerar mensagem amigável
        const friendlyError = getUserFriendlyError(
          new Error(`Erro no servidor. Status: ${response.status}`),
          response.status,
        )

        // Se temos uma mensagem específica do servidor, usá-la
        if (data && data.message) {
          friendlyError.message = data.message
        }

        throw friendlyError
      }

      console.log("Registro realizado com sucesso:", data)
      router.push("/register/registro-sucesso")
    } catch (error) {
      console.error("Erro no registro:", error)

      if (error && typeof error === "object" && "title" in error && "message" in error && "type" in error) {
        // Se já é um erro formatado, use-o diretamente
        setError(error as any)
      } else {
        // Caso contrário, converta para um erro amigável
        setError(getUserFriendlyError(error instanceof Error ? error : new Error("Erro desconhecido ao criar conta")))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Prevenir scroll no input de período
  const preventScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-slate-300 hover:text-slate-100 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para página inicial
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Registro de Aluno - RECOM
              </CardTitle>
              <CardDescription className="text-slate-400">
                Período de inscrição do RECOM aberto. Preencha o formulário abaixo para se registrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Digite seu nome completo"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Digite seu e-mail"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bolsista" className="text-slate-200 flex items-center space-x-2">
                      <Checkbox
                        id="bolsista"
                        checked={isBolsista}
                        onCheckedChange={(checked) => setIsBolsista(checked as boolean)}
                      />
                      <span>Bolsista</span>
                    </Label>
                  </div>
                  {!isBolsista && (
                    <div className="space-y-2">
                      <Label htmlFor="dias" className="text-slate-200">
                        Dias da semana em prioridade ( você pode ser realocado para outro dia ):
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Select value={day1} onValueChange={setDay1}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                            <SelectValue placeholder="Selecione o primeiro dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={day2} onValueChange={setDay2}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                            <SelectValue placeholder="Selecione o segundo dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="matricula" className="text-slate-200">
                      Matrícula
                    </Label>
                    <Input
                      id="matricula"
                      name="matricula"
                      placeholder="Digite sua matrícula"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curso" className="text-slate-200">
                      Curso
                    </Label>
                    <Select value={curso} onValueChange={setCurso}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Selecione o seu curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((cursoOption) => (
                          <SelectItem key={cursoOption} value={cursoOption}>
                            {cursoOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo" className="text-slate-200">
                      Período
                    </Label>
                    <Input
                      id="periodo"
                      name="periodo"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Digite seu período (1-20)"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      onWheel={preventScroll}
                      onKeyDown={(e) => {
                        // Permitir apenas: números, backspace, delete, tab, escape, enter
                        const allowedKeys = [
                          "0",
                          "1",
                          "2",
                          "3",
                          "4",
                          "5",
                          "6",
                          "7",
                          "8",
                          "9",
                          "Backspace",
                          "Delete",
                          "Tab",
                        ]
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement
                        // Remover qualquer caractere não numérico
                        input.value = input.value.replace(/[^0-9]/g, "")

                        const value = Number.parseInt(input.value || "0")
                        if (value > 20) input.value = "20"
                        if (value < 1 && input.value !== "") input.value = "1"
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <Alert
                    variant={error.type === "error" ? "destructive" : error.type === "warning" ? "default" : "info"}
                    className={`
                      ${
                        error.type === "error"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : error.type === "warning"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      }
                    `}
                  >
                    {error.type === "error" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : error.type === "warning" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                    <AlertTitle>{error.title}</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-pulse mr-2">●</span>
                      Registrando...
                    </>
                  ) : (
                    "Registrar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
