'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'

type UserType = 'PHYSICAL' | 'LEGAL' | 'STUDENT'

const API_URL = 'http://localhost:3456'

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>('PHYSICAL')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const matricula = formData.get('enrollment') as string
      const password = formData.get('password') as string

      let endpoint = ''

      switch (userType) {
        case 'PHYSICAL':
          endpoint = `/pessoasFisicas/verify/${email}/${password}`
          break
        case 'LEGAL':
          endpoint = `/pessoasJuridicas/verify/${email}/${password}`
          break
        case 'STUDENT':
          endpoint = `/alunos/verify/${matricula}/${password}`
          break
      }

      const response = await fetch(`${API_URL}${endpoint}`)

      if (response.ok) {
        const data = await response.json()
        
        if (userType === 'STUDENT') {
          localStorage.setItem('userMatricula', matricula)
        } else {
          localStorage.setItem('userEmail', email)
        }
        localStorage.setItem('userType', userType)

        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando...",
        })

        // Redirect based on user type
        if (userType === 'STUDENT') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Try to get error message from response
        let errorMessage = 'Credenciais inválidas'
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch {
            errorMessage = response.statusText || errorMessage
          }
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <Link 
        href="/" 
        className="absolute top-4 left-4 inline-flex items-center text-slate-300 hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para página inicial
      </Link>
      <Card className="w-[400px] bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-slate-200">Sistema de Doações</CardTitle>
          <CardDescription className="text-slate-400">
            Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="PHYSICAL" onValueChange={(value) => setUserType(value as UserType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="PHYSICAL">Pessoa Física</TabsTrigger>
              <TabsTrigger value="LEGAL">Pessoa Jurídica</TabsTrigger>
              <TabsTrigger value="STUDENT">Aluno</TabsTrigger>
            </TabsList>
            
            <TabsContent value="PHYSICAL">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    required 
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">Senha</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-slate-200" 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="LEGAL">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    required 
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">Senha</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-slate-200" 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="STUDENT">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollment" className="text-slate-200">Matrícula</Label>
                  <Input 
                    id="enrollment" 
                    name="enrollment"
                    type="text" 
                    required 
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">Senha</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-slate-200" 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

