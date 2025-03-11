"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "../../config/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function StudentRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isBolsista, setIsBolsista] = useState(false)
  const [day1, setDay1] = useState<string>("")
  const [day2, setDay2] = useState<string>("")
  const router = useRouter()

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    try {
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        dias: isBolsista ? daysOfWeek.join(", ") : [day1, day2].filter(Boolean).join(", "),
        matricula: formData.get("matricula"),
        curso: formData.get("curso"),
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

      if (!response.ok) {
        throw new Error(`Erro no servidor. Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Registro realizado com sucesso:", data)
      router.push("/register/registro-sucesso")
    } catch (error) {
      console.error("Erro no registro:", error)
      setError(error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
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
                        Dias da Semana
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
                    <Input
                      id="curso"
                      name="curso"
                      placeholder="Digite seu curso"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo" className="text-slate-200">
                      Período
                    </Label>
                    <Input
                      id="periodo"
                      name="periodo"
                      placeholder="Digite seu período"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 rounded text-red-400">{error}</div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrando..." : "Registrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

