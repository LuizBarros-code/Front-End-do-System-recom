"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { GraduationCap, Users, Building2, ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "../config/api"
import { SuccessDialog } from "@/components/ui/success-dialog"

function isValidCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, "")
  if (cnpj == "") return false
  if (cnpj.length != 14) return false

  // Eliminate known invalid CNPJs
  if (
    cnpj == "00000000000000" ||
    cnpj == "11111111111111" ||
    cnpj == "22222222222222" ||
    cnpj == "33333333333333" ||
    cnpj == "44444444444444" ||
    cnpj == "55555555555555" ||
    cnpj == "66666666666666" ||
    cnpj == "77777777777777" ||
    cnpj == "88888888888888" ||
    cnpj == "99999999999999"
  )
    return false

  // Validate DVs
  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado != Number.parseInt(digitos.charAt(0))) return false

  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado != Number.parseInt(digitos.charAt(1))) return false

  return true
}

function isValidPassword(password: string) {
  return password.length >= 8 && /^[A-Z]/.test(password)
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const uploadToGoogleDrive = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/upload-to-drive", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Resposta do servidor:", errorText)
        throw new Error(`Falha ao enviar arquivo: ${response.status}. Detalhes: ${errorText}`)
      }

      const data = await response.json()

      if (!data.fileUrl) {
        throw new Error("URL do arquivo não retornada pelo servidor")
      }

      console.log("Upload bem-sucedido. URL do arquivo:", data.fileUrl)
      return data.fileUrl
    } catch (error) {
      console.error("Erro detalhado ao enviar arquivo:", error)
      setError(error instanceof Error ? error.message : "Erro ao enviar arquivo")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const password = form.querySelector<HTMLInputElement>('input[name="password"]')?.value
    const confirmPassword = form.querySelector<HTMLInputElement>('input[name="password-confirm"]')?.value

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData(form)
    const userType = form.getAttribute("data-user-type")

    try {
      let endpoint = ""
      let payload: any = {}
      let fileUrl = ""

      if (userType === "individual" && selectedFile) {
        fileUrl = await uploadToGoogleDrive(selectedFile)
      }

      if (userType === "individual") {
        endpoint = `${API_BASE_URL}/pessoasFisicas`
        payload = {
          name: formData.get("name"),
          cpf: formData.get("cpf"),
          email: formData.get("email"),
          password: formData.get("password"),
          telefone: formData.get("telefone") || "",
          comprovanteDeBaixaRenda: fileUrl,
        }
      } else if (userType === "company") {
        endpoint = `${API_BASE_URL}/pessoasJuridicas`
        payload = {
          name: formData.get("name"),
          cnpj: formData.get("cnpj"),
          email: formData.get("email"),
          password: formData.get("password"),
          comprovanteDeProjeto: formData.get("comprovanteDeProjeto") || "",
          telefone: formData.get("telefone") || "",
          endereco: formData.get("endereco") || "",
        }
      } else {
        throw new Error("Tipo de usuário inválido")
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Endpoint não encontrado. Verifique a configuração da API.")
        }
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json()
          throw new Error(errorData?.message || `Erro no servidor. Status: ${response.status}`)
        } else {
          const text = await response.text()
          console.error("Resposta não-JSON:", text)
          throw new Error(`Resposta inesperada do servidor. Status: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log("Registro realizado com sucesso:", data)
      setShowSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Criar Conta
              </CardTitle>
              <CardDescription className="text-slate-400">
                Escolha o tipo de conta que melhor se adequa ao seu perfil
              </CardDescription>
              <div className="mt-6">
                <Link href="/register/registered" passHref>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Registro de Aluno
                  </Button>
                </Link>
                <p className="mt-2 text-sm text-slate-400">Se você é aluno, clique aqui para se registrar</p>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/50">
                  <TabsTrigger
                    value="individual"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Pessoa Física
                  </TabsTrigger>
                  <TabsTrigger
                    value="company"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Pessoa Jurídica
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="individual">
                  <form onSubmit={handleSubmit} className="space-y-6" data-user-type="individual">
                    <div className="grid gap-6 md:grid-cols-2">
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
                        <Label htmlFor="cpf" className="text-slate-200">
                          CPF
                        </Label>
                        <Input
                          id="cpf"
                          name="cpf"
                          placeholder="000.000.000-00"
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
                        <Label htmlFor="telefone" className="text-slate-200">
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          placeholder="(00) 00000-0000"
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comprovanteDeBaixaRenda" className="text-slate-200">
                          Comprovante de Baixa Renda
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="comprovanteDeBaixaRenda"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  // 5MB limit
                                  setError("O arquivo deve ter no máximo 5MB")
                                  e.target.value = ""
                                  return
                                }
                                setSelectedFile(file)
                                setError(null)
                              }
                            }}
                            required
                            disabled={isLoading}
                            className="bg-slate-800/50 border-slate-700 text-slate-200 file:text-slate-200 file:bg-slate-700 file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-slate-600 disabled:opacity-50"
                          />
                          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                          {selectedFile && !isLoading && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Upload className="h-4 w-4" />
                              {selectedFile.name}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          Anexe um documento que comprove sua baixa renda (máximo 5MB)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">
                          Senha
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Digite sua senha"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                          onChange={(e) => {
                            if (!isValidPassword(e.target.value)) {
                              setError("A senha deve ter pelo menos 8 caracteres e começar com uma letra maiúscula.")
                            } else {
                              setError(null)
                            }
                          }}
                        />
                        <p className="text-sm text-slate-400">
                          A senha deve ter pelo menos 8 caracteres e começar com uma letra maiúscula.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-confirm" className="text-slate-200">
                          Confirmar Senha
                        </Label>
                        <Input
                          id="password-confirm"
                          name="password-confirm"
                          type="password"
                          placeholder="Confirme sua senha"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                          onChange={(e) => {
                            const password = (document.getElementById("password") as HTMLInputElement).value
                            if (e.target.value !== password) {
                              setError("As senhas não coincidem.")
                            } else {
                              setError(null)
                            }
                          }}
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 rounded text-red-400">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {selectedFile ? "Enviando arquivo..." : "Criando conta..."}
                        </>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="company">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget as HTMLFormElement)
                      const cnpj = formData.get("cnpj") as string
                      if (!isValidCNPJ(cnpj)) {
                        setError("CNPJ inválido. Por favor, verifique e tente novamente.")
                        return
                      }
                      handleSubmit(e)
                    }}
                    className="space-y-6"
                    data-user-type="company"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Digite o nome da empresa"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-slate-200">
                          CNPJ
                        </Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          placeholder="00.000.000/0000-00"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">
                          E-mail Corporativo
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Digite o e-mail corporativo"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-slate-200">
                          Telefone Comercial
                        </Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          placeholder="(00) 0000-0000"
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco" className="text-slate-200">
                          Endereço
                        </Label>
                        <Input
                          id="endereco"
                          name="endereco"
                          placeholder="Digite o endereço completo"
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">
                          Senha
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Digite sua senha"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                          onChange={(e) => {
                            if (!isValidPassword(e.target.value)) {
                              setError("A senha deve ter pelo menos 8 caracteres e começar com uma letra maiúscula.")
                            } else {
                              setError(null)
                            }
                          }}
                        />
                        <p className="text-sm text-slate-400">
                          A senha deve ter pelo menos 8 caracteres e começar com uma letra maiúscula.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-confirm" className="text-slate-200">
                          Confirmar Senha
                        </Label>
                        <Input
                          id="password-confirm"
                          name="password-confirm"
                          type="password"
                          placeholder="Confirme sua senha"
                          required
                          className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
                          onChange={(e) => {
                            const password = (document.getElementById("password") as HTMLInputElement).value
                            if (e.target.value !== password) {
                              setError("As senhas não coincidem.")
                            } else {
                              setError(null)
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comprovanteDeProjeto" className="text-slate-200">
                        Descrição do Projeto
                      </Label>
                      <Textarea
                        id="comprovanteDeProjeto"
                        name="comprovanteDeProjeto"
                        placeholder="Descreva seu projeto e seus objetivos..."
                        className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400 min-h-[100px]"
                        required
                        minLength={100}
                        onChange={(e) => {
                          if (e.target.value.length < 100) {
                            setError("A descrição do projeto deve conter no mínimo 100 caracteres.")
                          } else {
                            setError(null)
                          }
                        }}
                      />
                      <p className="text-sm text-slate-400">
                        Forneça uma descrição detalhada do seu projeto e seus objetivos (mínimo de 100 caracteres)
                      </p>
                    </div>
                    {error && (
                      <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 rounded text-red-400">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

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
      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} />
    </main>
  )
}

