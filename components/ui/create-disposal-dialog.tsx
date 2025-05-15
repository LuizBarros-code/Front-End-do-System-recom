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
  const [selectedEquipment, setSelectedEquipment] = useState<any>({
    teclados: [],
    hds: [],
    fontesDeAlimentacao: [],
    gabinetes: [],
    monitores: [],
    mouses: [],
    estabilizadores: [],
    impressoras: [],
    placasmae: [],
    notebooks: [],
    processadores: []
  })
  const [allEquipment, setAllEquipment] = useState<any>({
    teclados: [],
    hds: [],
    fontesDeAlimentacao: [],
    gabinetes: [],
    monitores: [],
    mouses: [],
    estabilizadores: [],
    impressoras: [],
    placasmae: [],
    notebooks: [],
    processadores: []
  })
  const [formData, setFormData] = useState({
    name: "",
    codigoDeReferencias: "",
    descricao: "",
    contato: "",
    data: "",
  })

  const handleEquipmentSelect = (selected: any, all: any) => {
    setSelectedEquipment(selected);
    setAllEquipment(all);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const allCategories = [
        "teclados", "hds", "fontesDeAlimentacao", "gabinetes", "monitores", "mouses",
        "estabilizadores", "impressoras", "placasmae", "notebooks", "processadores"
      ];

      const payload = {
        name: formData.name,
        codigoDeReferencias: formData.codigoDeReferencias,
        descricao: formData.descricao,
        data: new Date(formData.data).toISOString(),
        usuarioId: Number(userId),
        teclados: selectedEquipment.teclados || [],
        hds: selectedEquipment.hds || [],
        fontesDeAlimentacao: selectedEquipment.fontesDeAlimentacao || [],
        gabinetes: selectedEquipment.gabinetes || [],
        monitores: selectedEquipment.monitores || [],
        mouses: selectedEquipment.mouses || [],
        estabilizadores: selectedEquipment.estabilizadores || [],
        impressoras: selectedEquipment.impressoras || [],
        placasmae: selectedEquipment.placasMae || [],
        notebooks: selectedEquipment.notebooks || [],
        processadores: selectedEquipment.processadores || []
      }

      console.log("IDs selecionados:", selectedEquipment);
      console.log("Payload para criação:", payload);

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

      // Atualizar status dos equipamentos para "Para descarte"
      await Promise.all(
        allCategories.map(async (category) => {
          const ids = payload[category];
          if (Array.isArray(ids) && ids.length > 0) {
            await Promise.all(
              ids.map(async (id) => {
                const typeToEndpoint: Record<string, string> = {
                  teclados: 'teclados',
                  hds: 'hds',
                  fontesDeAlimentacao: 'fontesDeAlimentacao',
                  gabinetes: 'gabinetes',
                  monitores: 'monitores',
                  mouses: 'mouses',
                  estabilizadores: 'estabilizadores',
                  impressoras: 'impressoras',
                  placasmae: 'placasMae',
                  notebooks: 'notebooks',
                  processadores: 'processadores',
                };
                const endpoint = typeToEndpoint[category];
                if (endpoint) {
                  await fetch(`${API_URL}/${endpoint}/${id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      status: "Para descarte",
                      feedback: "Equipamento incluído em descarte"
                    }),
                  });
                }
              })
            );
          }
        })
      );

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
      <EquipmentSelector open={selectorOpen} onOpenChange={setSelectorOpen} onSelect={(selected, all) => handleEquipmentSelect(selected, all)} />
    </Dialog>
  )
}

