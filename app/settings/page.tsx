"use client"

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  useEffect(() => {
    const type = localStorage.getItem("userType") as UserType
    const email = localStorage.getItem("userEmail")
    if (!type || !email) {
      router.push("/login")
      return
    }
    setUserType(type)
    setUserEmail(email)
    setReturnPath(type === "STUDENT" ? "/admin" : "/dashboard")

    // Fetch user data including the current file URL and user ID
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/pessoaFisicas/email/${email}`)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Fetch user data error:", errorText)
          throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`)
        }
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!")
        }
        const userData = await response.json()
        setCurrentFileUrl(userData.comprovanteDeBaixaRendaAttachment)
        setUserId(userData.id)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados. Por favor, tente novamente mais tarde.",
        })
      }
    }

    fetchUserData()
  }, [router, toast, API_URL])

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

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

      const response = await fetch(`${API_URL}/pessoaFisicas/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) {
        throw new Error("Erro ao alterar a senha")
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!")
      }

      await response.json() // Ensure we can parse the response as JSON

      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi atualizada com sucesso.",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao alterar a senha",
      })
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

        const contentType = uploadResponse.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Resposta inesperada do servidor: não é JSON")
        }

        const responseData = await uploadResponse.json()
        console.log("Full server response:", responseData)

        const { fileUrl } = responseData
        if (!fileUrl) {
          throw new Error("URL do arquivo não recebida do servidor")
        }

        console.log(`Arquivo ${isUpdate ? "atualizado" : "enviado"} com sucesso. URL:`, fileUrl)

        console.log("Atualizando registro do usuário...")
        console.log("Payload para atualização:", {
          comprovanteDeBaixaRenda: fileUrl,
        })
        const updateResponse = await fetch(`${API_URL}/pessoaFisicas/${userId}`, {
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

        const updateContentType = updateResponse.headers.get("content-type")
        if (!updateContentType || !updateContentType.includes("application/json")) {
          throw new TypeError("Resposta inesperada do servidor de atualização: não é JSON")
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
          body: JSON.stringify({ comprovanteProjeto: projectDescription }),
        })

        if (!response.ok) {
          throw new Error("Erro ao atualizar descrição do projeto")
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!")
        }

        await response.json() // Ensure we can parse the response as JSON

        toast({
          title: "Projeto atualizado com sucesso",
          description: "A descrição do seu projeto foi atualizada com sucesso.",
        })

        setProjectDescription("")
      }
    } catch (error) {
      console.error("Erro detalhado:", error)
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description:
          error instanceof Error
            ? `${error.message}. Por favor, tente novamente ou contate o suporte.`
            : "Ocorreu um erro ao atualizar as informações. Por favor, tente novamente mais tarde.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <div>
          <p className="text-sm text-gray-600">Email: {userEmail}</p>
          <Button onClick={() => router.push(returnPath)}>Voltar ao Dashboard</Button>
        </div>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList>
          <TabsTrigger value="password">Alterar Senha</TabsTrigger>
          {userType !== "STUDENT" && (
            <TabsTrigger value="document">
              {userType === "PHYSICAL" ? "Alterar Documento" : "Alterar Projeto"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha de acesso ao sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" name="newPassword" type="password" required disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required disabled={isLoading} />
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao alterar sua senha, você será o único responsável por manter essa informação segura.
                        Certifique-se de guardar sua nova senha em um local seguro.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction type="submit">Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {userType !== "STUDENT" && (
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle>{userType === "PHYSICAL" ? "Alterar Documento" : "Alterar Projeto"}</CardTitle>
                <CardDescription>
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
                      <Label htmlFor="document">Comprovante de Baixa Renda</Label>
                      <Input
                        id="document"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        required
                        disabled={isLoading}
                      />
                      {currentFileUrl && (
                        <p className="text-sm text-gray-500">
                          Arquivo atual:{" "}
                          <a
                            href={currentFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Visualizar
                          </a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="project">Descrição do Projeto</Label>
                      <Textarea
                        id="project"
                        placeholder="Descreva seu projeto..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                        disabled={isLoading}
                        className="min-h-[150px]"
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enviando..." : userType === "PHYSICAL" ? "Enviar Documento" : "Atualizar Projeto"}
                  </Button>
                </form>

                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {userType === "PHYSICAL"
                          ? "Ao enviar um novo documento, você será o único responsável pela veracidade das informações fornecidas. Certifique-se de que o documento está correto e legível."
                          : "Ao atualizar a descrição do projeto, você será o único responsável pela veracidade das informações fornecidas. Certifique-se de que todos os detalhes estão corretos."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDocumentUpdate}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

