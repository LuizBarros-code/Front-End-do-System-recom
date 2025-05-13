"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-dropdown"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { EquipmentSelector } from "./equipment-selector"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.99.103.209:3456"

type UserType = "fisica" | "juridica"
type NameOption = {
  id: number
  name: string
}

interface CreateProjectDonationDialogProps {
  userId: string
}

export function CreateProjectDonationDialog({ userId }: CreateProjectDonationDialogProps) {
  const { toast } = useToast()
  const [userType, setUserType] = useState<UserType>("fisica")
  const [isLoading, setIsLoading] = useState(false)
  const [names, setNames] = useState<NameOption[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<any>({})
  const [formData, setFormData] = useState({
    name: "",
    codigoDeReferencias: "",
    descricao: "",
    justificativa: "",
    nomeOuEmpresa: "",
    contato: "",
    data: "",
  })

  useEffect(() => {
    const fetchNames = async () => {
      setIsLoading(true)
      try {
        const endpoint = userType === "fisica" ? "pessoasFisicas/names" : "pessoasJuridicas/names"
        const response = await fetch(`${API_URL}/${endpoint}`)
        if (!response.ok) {
          throw new Error("Falha ao carregar a lista de nomes")
        }
        const data = await response.json()
        setNames(data)
      } catch (error) {
        console.error("Erro ao carregar nomes:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a lista de nomes. Por favor, tente novamente.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNames()
  }, [userType, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!selectedUserId) {
        throw new Error("Por favor, selecione uma pessoa/empresa")
      }

      const userIdNumber = Number(userId)
      if (isNaN(userIdNumber)) {
        throw new Error("ID do usuário inválido")
      }

      const payload = {
        name: "Doação de Equipamentos",
        codigoDeReferencias: formData.codigoDeReferencias,
        descricao: formData.descricao,
        justificativa: formData.justificativa,
        nomeOuEmpresa: formData.nomeOuEmpresa,
        contato: formData.contato,
        data: new Date(formData.data).toISOString(),
        status: "PENDENTE",
        donatarioId: userIdNumber,
        usuariofisicoId: userType === "fisica" ? Number(selectedUserId) : null,
        usuariojuridicoId: userType === "juridica" ? Number(selectedUserId) : null,
        ...Object.entries(selectedEquipment).reduce(
          (acc, [key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              acc[key] = value
            }
            return acc
          },
          {} as Record<string, number[]>,
        ),
      }

      console.log("Enviando payload:", payload)

      const response = await fetch(`${API_URL}/doacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Erro do servidor: ${errorData}`)
      }

      const result = await response.json()
      console.log("Resposta do servidor:", result)

      // Update equipment with donation ID
      await Promise.all(
        Object.entries(selectedEquipment).map(async ([category, ids]) => {
          if (Array.isArray(ids) && ids.length > 0) {
            await Promise.all(
              ids.map((id) =>
                fetch(`${API_URL}/${category}/${id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ doacaoId: result.id }),
                }),
              ),
            )
          }
        }),
      )

      toast({
        title: "Sucesso",
        description: "Doação criada com sucesso!",
      })

      setFormData({
        name: "",
        codigoDeReferencias: "",
        descricao: "",
        justificativa: "",
        nomeOuEmpresa: "",
        contato: "",
        data: "",
      })
      setSelectedUserId(null)
      setSelectedEquipment({})
      setOpen(false)
    } catch (error) {
      console.error("Erro ao criar doação:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível criar a doação. Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleNameSelect = (value: string) => {
    const selectedPerson = names.find((n) => n.name === value)
    if (selectedPerson) {
      setSelectedUserId(selectedPerson.id)
      setFormData((prev) => ({ ...prev, nomeOuEmpresa: selectedPerson.name }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">Criar Doação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <DialogHeader>
              <DialogTitle>Criar Nova Doação</DialogTitle>
              <DialogDescription>Preencha os detalhes da sua doação para o projeto.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-2">
            <Label>Tipo de Usuário</Label>
            <RadioGroup
              defaultValue="fisica"
              onValueChange={(value) => {
                setUserType(value as UserType)
                setFormData((prev) => ({ ...prev, nomeOuEmpresa: "" }))
                setSelectedUserId(null)
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fisica" id="fisica" />
                <Label htmlFor="fisica">Pessoa Física</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="juridica" id="juridica" />
                <Label htmlFor="juridica">Pessoa Jurídica</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nomeOuEmpresa">Nome do Destinatário</Label>
            <Select value={formData.nomeOuEmpresa} onValueChange={handleNameSelect} disabled={isLoading} required>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Carregando..."
                      : userType === "fisica"
                        ? "Selecione uma pessoa"
                        : "Selecione uma empresa"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {names.map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="codigoDeReferencias">Código de Referência</Label>
            <Input
              id="codigoDeReferencias"
              placeholder="Digite o código de referência"
              value={formData.codigoDeReferencias}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva os detalhes da doação"
              value={formData.descricao}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="justificativa">Justificativa</Label>
            <Textarea
              id="justificativa"
              placeholder="Justifique a necessidade desta doação"
              value={formData.justificativa}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              placeholder="Seu contato para comunicação"
              value={formData.contato}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" value={formData.data} onChange={handleInputChange} required />
          </div>

          <div className="col-span-2">
            <Button type="button" variant="outline" onClick={() => setSelectorOpen(true)}>
              Selecionar Equipamentos
            </Button>
          </div>

          <div className="col-span-2">
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Doação"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
      <EquipmentSelector open={selectorOpen} onOpenChange={setSelectorOpen} onSelect={setSelectedEquipment} />
    </Dialog>
  )
}

