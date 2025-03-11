"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { EquipmentSelector } from "./equipment-selector"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

interface CreateDisposalDialogProps {
  userId: string
}

export function CreateDisposalDialog({ userId }: CreateDisposalDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<any>({})
  const [formData, setFormData] = useState({
    name: "",
    codigoDeReferencias: "",
    descricao: "",
    contato: "",
    data: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        data: new Date(formData.data).toISOString(),
        usuarioId: Number(userId),
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

      const response = await fetch(`${API_URL}/descartes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Falha ao criar descarte")
      }

      const result = await response.json()

      // Update equipment with disposal ID
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
                  body: JSON.stringify({ descarteId: result.id }),
                }),
              ),
            )
          }
        }),
      )

      toast({
        title: "Sucesso",
        description: "Descarte criado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao criar descarte:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o descarte. Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-auto">Criar Descarte</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criação Descarte</DialogTitle>
          <DialogDescription>Preencha as informações sobre o equipamento a ser descartado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="codigoDeReferencias">Código de Referência</Label>
            <Input
              id="codigoDeReferencias"
              value={formData.codigoDeReferencias}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={formData.descricao} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contato">Contato para Retirada</Label>
            <Input id="contato" value={formData.contato} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" value={formData.data} onChange={handleInputChange} required />
          </div>
          <Button type="button" variant="outline" onClick={() => setSelectorOpen(true)}>
            Selecionar Equipamentos
          </Button>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Criar Descarte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <EquipmentSelector open={selectorOpen} onOpenChange={setSelectorOpen} onSelect={setSelectedEquipment} />
    </Dialog>
  )
}

