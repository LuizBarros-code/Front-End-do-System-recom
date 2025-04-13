"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

type UserType = "STUDENT" | "PHYSICAL" | "LEGAL"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [projectDescription, setProjectDescription] = useState("")
  const [returnPath, setReturnPath] = useState("/dashboard")
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setIsInitializing(true)

        // Verificar tipo de usuário
        const type = localStorage.getItem("userType") as UserType
        if (!type) {
          throw new Error("Tipo de usuário não encontrado")
        }
        setUserType(type)

        // Definir caminho de retorno com base no tipo de usuário
        setReturnPath(type === "STUDENT" ? "/student" : "/dashboard")

        // Obter email ou matrícula com base no tipo de usuário
        let email: string | null = null

        if (type === "STUDENT") {
          const matricula = localStorage.getItem("userMatricula")
          if (!matricula) {
            throw new Error("Matrícula não encontrada")
          }

          // Buscar dados do estudante para obter o email
          const studentResponse = await fetch(`${API_URL}/alunos/matricula/${matricula}`)
          if (!studentResponse.ok) {
            throw new Error("Falha ao buscar dados do estudante")
          }

          const studentData = await studentResponse.json()
          email = studentData.email
          setUserId(studentData.id)
        } else {
          email = localStorage.getItem("userEmail")
          if (!email) {
            throw new Error("Email não encontrado")
          }

          // Buscar dados do usuário
          const endpoint = type === "PHYSICAL" ? "pessoasFisicas" : "pessoasJuridicas"
          const userResponse = await fetch(`${API_URL}/${endpoint}/email/${email}`)

          if (!userResponse.ok) {
            throw new Error(`Falha ao buscar dados do usuário: ${userResponse.statusText}`)
          }

          const userData = await userResponse.json()
          setUserId(userData.id)

          if (type === "PHYSICAL") {
            setCurrentFileUrl(userData.comprovanteDeBaixaRenda)
          } else if (type === "LEGAL") {
            setProjectDescription(userData.comprovanteDeProjeto || "")
          }
        }

        setUserEmail(email)
        console.log("Inicialização concluída com sucesso:", { type, email, userId: userId })
      } catch (error) {
        console.error("Erro na inicialização:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar configurações")

        // Não redirecionar automaticamente para login, apenas mostrar o erro
      } finally {
        setIsInitializing(false)
      }
    }

    initializeSettings()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (newPassword !== confirmPassword) {
        throw new Error("As senhas não coincidem")
      }

      if (!userId) {
        throw new Error("ID do usuário não encontrado")
      }

      let endpoint = ""
      if (userType === "STUDENT") {
        endpoint = `${API_URL}/alunos/${userId}`
      } else if (userType === "PHYSICAL") {
        endpoint = `${API_URL}/pessoasFisicas/${userId}`
      } else if (userType === "LEGAL") {
        endpoint = `${API_URL}/pessoasJuridicas/${userId}`
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao alterar a senha: ${response.statusText}`)
      }

      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi atualizada com sucesso.",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error changing password:", error)
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao alterar a senha")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log("Arquivo selecionado:", selectedFile.name)
    } else {
      setFile(null)
      console.log("Nenhum arquivo selecionado")
    }
  }

  const handleDocumentUpdate = async () => {
    setIsLoading(true)
    setIsAlertOpen(false)
    setError(null)

    try {
      if (!userId) {
        throw new Error("ID do usuário não encontrado")
      }

      if (userType === "PHYSICAL") {
        if (!file) {
          throw new Error("Nenhum arquivo selecionado")
        }

        console.log("Iniciando atualização do arquivo no Google Drive...")

        const formData = new FormData()
        formData.append("file", file)

        // If we have a current file URL, we're updating an existing file
        const isUpdate = !!currentFileUrl
        if (isUpdate && currentFileUrl) {
          formData.append("currentFileUrl", currentFileUrl)
        }

        const uploadResponse = await fetch("/api/upload-to-drive", {
          method: "POST", // Sempre usar POST, independentemente de ser uma atualização ou não
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("Upload response error:", errorText)
          throw new Error(`Erro no servidor: ${uploadResponse.statusText}. Details: ${errorText}`)
        }

        const responseData = await uploadResponse.json()
        console.log("Full server response:", responseData)

        const { fileUrl } = responseData
        if (!fileUrl) {
          throw new Error("URL do arquivo não recebida do servidor")
        }

        console.log(`Arquivo ${isUpdate ? "atualizado" : "enviado"} com sucesso. URL:`, fileUrl)

        console.log("Atualizando registro do usuário...")
        const updateResponse = await fetch(`${API_URL}/pessoasFisicas/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comprovanteDeBaixaRenda: fileUrl,
          }),
        })

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          console.error("Update response error:", errorText)
          throw new Error(`Erro ao atualizar registro do usuário: ${updateResponse.statusText}. Details: ${errorText}`)
        }

        const updateData = await updateResponse.json()
        console.log("Resposta da atualização:", updateData)

        setCurrentFileUrl(fileUrl)

        console.log("Registro do usuário atualizado com sucesso")

        toast({
          title: "Documento atualizado com sucesso",
          description: "Seu comprovante de baixa renda foi atualizado com sucesso.",
        })

        setFile(null)
      } else if (userType === "LEGAL") {
        if (!projectDescription.trim()) {
          throw new Error("A descrição do projeto é obrigatória")
        }

        const response = await fetch(`${API_URL}/pessoasJuridicas/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comprovanteDeProjeto: projectDescription }),
        })

        if (!response.ok) {
          throw new Error("Erro ao atualizar descrição do projeto")
        }

        toast({
          title: "Projeto atualizado com sucesso",
          description: "A descrição do seu projeto foi atualizada com sucesso.",
        })

        setProjectDescription("")
      }
    } catch (error) {
      console.error("Erro detalhado:", error)
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao atualizar as informações")
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#141922] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#84e100] mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141922] text-white">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#84e100]">Configurações</h1>
          <div>
            <p className="text-sm text-gray-400">Email: {userEmail}</p>
            <Button
              onClick={() => router.push(returnPath)}
              className="bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium mt-2"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="bg-[#1a212b] border-gray-700">
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-[#84e100] data-[state=active]:text-[#141922]"
            >
              Alterar Senha
            </TabsTrigger>
            {userType !== "STUDENT" && (
              <TabsTrigger
                value="document"
                className="data-[state=active]:bg-[#84e100] data-[state=active]:text-[#141922]"
              >
                {userType === "PHYSICAL" ? "Alterar Documento" : "Alterar Projeto"}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="password">
            <Card className="bg-[#1a212b]/90 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Alterar Senha</CardTitle>
                <CardDescription className="text-gray-400">Atualize sua senha de acesso ao sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">
                        Nova Senha
                      </Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        disabled={isLoading}
                        className="bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirmar Nova Senha
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        disabled={isLoading}
                        className="bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Alterar Senha"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {userType !== "STUDENT" && (
            <TabsContent value="document">
              <Card className="bg-[#1a212b]/90 backdrop-blur-sm border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    {userType === "PHYSICAL" ? "Alterar Documento" : "Alterar Projeto"}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {userType === "PHYSICAL"
                      ? "Atualize seu comprovante de baixa renda."
                      : "Atualize a descrição do seu projeto."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setIsAlertOpen(true)
                    }}
                    className="space-y-6"
                  >
                    {userType === "PHYSICAL" ? (
                      <div className="space-y-2">
                        <Label htmlFor="document" className="text-white">
                          Comprovante de Baixa Renda
                        </Label>
                        <Input
                          id="document"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
                          disabled={isLoading}
                          className="bg-[#141922]/80 border-gray-700 text-white file:text-white file:bg-[#2a3a1c] file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-[#84e100] hover:file:text-[#141922] disabled:opacity-50"
                        />
                        {currentFileUrl && (
                          <p className="text-sm text-gray-400">
                            Arquivo atual:{" "}
                            <a
                              href={currentFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#84e100] hover:underline"
                            >
                              Visualizar
                            </a>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="project" className="text-white">
                          Descrição do Projeto
                        </Label>
                        <Textarea
                          id="project"
                          placeholder="Descreva seu projeto..."
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          required
                          disabled={isLoading}
                          className="bg-[#141922]/80 border-gray-700 text-white focus:border-[#84e100] focus:ring-[#84e100]/20 min-h-[150px]"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : userType === "PHYSICAL" ? (
                        "Enviar Documento"
                      ) : (
                        "Atualizar Projeto"
                      )}
                    </Button>
                  </form>

                  <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent className="bg-[#1a212b] border-gray-700 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          {userType === "PHYSICAL"
                            ? "Ao enviar um novo documento, você será o único responsável pela veracidade das informações fornecidas. Certifique-se de que o documento está correto e legível."
                            : "Ao atualizar a descrição do projeto, você será o único responsável pela veracidade das informações fornecidas. Certifique-se de que todos os detalhes estão corretos."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDocumentUpdate}
                          className="bg-[#84e100] hover:bg-[#9aff00] text-[#141922]"
                        >
                          Continuar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

