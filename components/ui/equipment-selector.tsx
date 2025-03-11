"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3456"

interface BaseEquipment {
  id: number
  codigoDereferencia: string
  descricao: string
  status: string
  dataDeChegada: string
  dataDeSaida?: string
  marca: string
  modelo: string
  nome: string
  imagem: string
  situacao: string
}

interface Teclado extends BaseEquipment {
  tipoDeConexao: string
}

interface HD extends BaseEquipment {
  tipoDeCapacidade: string
  capacidade: number
}

interface FonteDeAlimentacao extends BaseEquipment {
  potencia: number
}

interface Monitor extends BaseEquipment {
  polegadas: number
}

interface Impressora extends BaseEquipment {
  tipoDeTinta: string
}

type Equipment = BaseEquipment | Teclado | HD | FonteDeAlimentacao | Monitor | Impressora

const EQUIPMENT_CATEGORIES = {
  estabilizadores: "Estabilizadores",
  fontesDeAlimentacao: "Fontes de Alimentação",
  gabinetes: "Gabinetes",
  hds: "HDs",
  impressoras: "Impressoras",
  monitores: "Monitores",
  notebooks: "Notebooks",
  placasMae: "Placas Mãe",
  processadores: "Processadores",
  teclados: "Teclados",
} as const

type EquipmentCategory = keyof typeof EQUIPMENT_CATEGORIES

interface EquipmentSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selectedEquipment: Record<EquipmentCategory, number[]>) => void
}

export function EquipmentSelector({ open, onOpenChange, onSelect }: EquipmentSelectorProps) {
  const [category, setCategory] = useState<EquipmentCategory | "">("")
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selected, setSelected] = useState<Record<EquipmentCategory, number[]>>({
    estabilizadores: [],
    fontesDeAlimentacao: [],
    gabinetes: [],
    hds: [],
    impressoras: [],
    monitores: [],
    notebooks: [],
    placasMae: [],
    processadores: [],
    teclados: [],
  })

  useEffect(() => {
    if (category) {
      fetch(`${API_URL}/${category}`)
        .then((res) => res.json())
        .then(setEquipment)
        .catch(console.error)
    }
  }, [category])

  const handleSelect = (id: number) => {
    if (category) {
      setSelected((prev) => ({
        ...prev,
        [category]: prev[category].includes(id)
          ? prev[category].filter((item) => item !== id)
          : [...prev[category], id],
      }))
    }
  }

  const handleConfirm = () => {
    onSelect(selected)
    onOpenChange(false)
  }

  const renderSpecificDetails = (item: Equipment) => {
    switch (category) {
      case "teclados":
        return <p>Conexão: {(item as Teclado).tipoDeConexao}</p>
      case "hds":
        return (
          <>
            <p>
              Capacidade: {(item as HD).capacidade} {(item as HD).tipoDeCapacidade}
            </p>
          </>
        )
      case "fontesDeAlimentacao":
      case "estabilizadores":
        return <p>Potência: {(item as FonteDeAlimentacao).potencia}W</p>
      case "monitores":
        return <p>Tamanho: {(item as Monitor).polegadas}&quot;</p>
      case "impressoras":
        return <p>Tipo de Tinta: {(item as Impressora).tipoDeTinta}</p>
      default:
        return null
    }
  }

  const convertGoogleDriveUrl = (url: string) => {
    const fileId = url.match(/\/file\/d\/([^/]+)\//)?.[1]
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
    return url // Retorna a URL original se não for do Google Drive
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Selecionar Equipamentos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as EquipmentCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EQUIPMENT_CATEGORIES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {category && (
            <ScrollArea className="h-[500px] rounded-md border">
              <div className="grid grid-cols-2 gap-4 p-4">
                {equipment.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-md bg-gray-100">
                        <Image
                          src={convertGoogleDriveUrl(item.imagem) || "/placeholder.svg"}
                          alt={item.nome}
                          width={96}
                          height={96}
                          className="object-cover"
                          priority={true}
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.nome}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={item.status === "DISPONIVEL" ? "default" : "secondary"}>{item.status}</Badge>
                          <Badge variant="outline">{item.situacao}</Badge>
                        </div>
                      </div>
                      <Checkbox
                        checked={selected[category].includes(item.id)}
                        onCheckedChange={() => handleSelect(item.id)}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        <p>Marca: {item.marca}</p>
                        <p>Modelo: {item.modelo}</p>
                        {renderSpecificDetails(item)}
                        <p className="text-muted-foreground">Ref: {item.codigoDereferencia}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
          <Button onClick={handleConfirm}>Confirmar Seleção</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

