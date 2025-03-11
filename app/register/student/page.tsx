"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export default function StudentRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    matricula: "",
    curso: "",
    dias: "",
  })
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "password" || name === "passwordConfirm") {
      setError(null) // Clear any existing password mismatch error
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, curso: value }))
  }

  const handleDiasChange = (day: string) => {
    setFormData((prev) => {
      const currentDias = prev.dias.split(",").filter((d) => d.trim() !== "")
      const newDias = currentDias.includes(day) ? currentDias.filter((d) => d !== day) : [...currentDias, day]
      return {
        ...prev,
        dias: newDias.join(","),
      }
    })
  }

  const router = useRouter()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError(null)

      if (formData.password !== formData.passwordConfirm) {
        setError("As senhas não coincidem.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("http://localhost:3456/alunos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            matricula: formData.matricula,
            curso: formData.curso,
            dias: formData.dias,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create student account")
        }

        const data = await response.json()
        console.log("Student account created:", data)
        router.push("/login") // Redirect to login page after successful registration
      } catch (error) {
        console.error("Error creating student account:", error)
        setError("Failed to create account. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [formData, router],
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/register"
          className="inline-flex items-center text-slate-300 hover:text-slate-100 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para página de registro
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Registro de Aluno
              </CardTitle>
              <CardDescription className="text-slate-400">
                Preencha seus dados para criar uma conta de aluno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Digite seu nome completo"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricula" className="text-slate-200">
                      Matrícula
                    </Label>
                    <Input
                      id="matricula"
                      name="matricula"
                      value={formData.matricula}
                      onChange={handleInputChange}
                      placeholder="Digite sua matrícula"
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
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Digite seu e-mail"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curso" className="text-slate-200">
                      Curso
                    </Label>
                    <Select onValueChange={handleSelectChange} value={formData.curso}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Selecione seu curso" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="cc">Ciência da Computação</SelectItem>
                        <SelectItem value="si">Sistemas de Informação</SelectItem>
                        <SelectItem value="ec">Engenharia da Computação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Digite sua senha"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm" className="text-slate-200">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      placeholder="Confirme sua senha"
                      required
                      className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Dias disponíveis</Label>
                  <div className="flex flex-wrap gap-4">
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.dias.split(",").includes(day)}
                          onCheckedChange={() => handleDiasChange(day)}
                        />
                        <label
                          htmlFor={day}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-6">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                  Faça login
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}

