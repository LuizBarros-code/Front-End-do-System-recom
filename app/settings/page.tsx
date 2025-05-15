"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { AlertCircle, Loader2, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"

type UserType = "STUDENT" | "PHYSICAL" | "LEGAL" | "ADMIN"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setIsInitializing(true)
        const userType = localStorage.getItem("userType")
        const userIdStr = localStorage.getItem("userId")
        const userId = userIdStr ? Number(userIdStr) : null
        if (!userType || !userId) {
          router.push("/login")
          return
        }
        setUserId(userId)
        setUserType(userType.toUpperCase() as UserType)
      } catch (error) {
        setError("Erro ao carregar configurações")
      } finally {
        setIsInitializing(false)
      }
    }
    initializeSettings()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !userId) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      let endpoint = ''
      if (userType === "PHYSICAL") {
        endpoint = `${API_URL}/pessoaFisicas/${userId}`
        formData.delete('file');
        formData.append('comprovanteDeBaixaRenda', selectedFile);
      } else if (userType === "LEGAL") {
        endpoint = `${API_URL}/pessoasJuridicas/${userId}`
      } else {
        throw new Error("Tipo de usuário não suportado para upload de arquivo")
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do arquivo")
      }

      toast({
        title: "Arquivo enviado com sucesso!",
        description: "Seu comprovante foi atualizado.",
      })
      setSelectedFile(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao fazer upload do arquivo")
    } finally {
      setIsUploading(false)
    }
  }

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"
      let response;
      if (userType === "ADMIN") {
        response = await fetch(`${API_URL}/coordenadores/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        })
      } else if (userType === "STUDENT") {
        response = await fetch(`${API_URL}/alunos/senha/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        })
      } else if (userType === "LEGAL") {
        response = await fetch(`${API_URL}/pessoasJuridicas/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        })
      } else if (userType === "PHYSICAL") {
        response = await fetch(`${API_URL}/pessoaFisicas/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        })
      } else {
        throw new Error("Alteração de senha não suportada para este tipo de usuário.")
      }
      if (!response.ok) {
        let errorMsg = `Erro ao alterar a senha: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      setShowSuccessModal(true);
      formRef.current?.reset();
      setSelectedFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao alterar a senha")
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <div>
            <Button onClick={() => {
              if (userType === "STUDENT") {
                router.push("/student")
              } else if (userType === "ADMIN") {
                router.push("/admin")
              } else {
                router.push("/dashboard")
              }
            }} className="mt-2" variant="outline">
              Voltar ao {userType === "STUDENT" ? "Painel do Estudante" : userType === "ADMIN" ? "Painel do Coordenador" : "Dashboard"}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mb-4 text-red-600">{error}</div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Atualize sua senha de acesso ao sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handlePasswordChange} className="space-y-6">
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {(userType === "PHYSICAL" || userType === "LEGAL") && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userType === "PHYSICAL" ? "Comprovante de Baixa Renda" : "Comprovante de Projeto"}
              </CardTitle>
              <CardDescription>
                {userType === "PHYSICAL"
                  ? "Atualize seu comprovante de baixa renda"
                  : "Descreva o projeto que você está desenvolvendo"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userType === "PHYSICAL" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Selecione o arquivo</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </div>
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Arquivo
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  setIsUploading(true)
                  setError(null)
                  try {
                    const formData = new FormData(e.currentTarget)
                    const projeto = formData.get("projeto") as string
                    
                    const response = await fetch(`${API_URL}/pessoasJuridicas/${userId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ comprovanteDeProjeto: projeto }),
                    })

                    if (!response.ok) {
                      throw new Error("Erro ao atualizar o projeto")
                    }

                    toast({
                      title: "Projeto atualizado com sucesso!",
                      description: "Seu projeto foi atualizado.",
                    })
                    e.currentTarget.reset()
                  } catch (error) {
                    setError(error instanceof Error ? error.message : "Erro ao atualizar o projeto")
                  } finally {
                    setIsUploading(false)
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projeto">Descrição do Projeto</Label>
                    <Textarea
                      id="projeto"
                      name="projeto"
                      placeholder="Descreva o projeto que você está desenvolvendo..."
                      required
                      disabled={isUploading}
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Projeto"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Senha alterada com sucesso!</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <p className="text-center">Sua senha foi atualizada com sucesso.</p>
              <Button onClick={() => setShowSuccessModal(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

