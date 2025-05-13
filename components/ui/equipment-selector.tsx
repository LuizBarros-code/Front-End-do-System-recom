"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
  const [allEquipment, setAllEquipment] = useState<Record<EquipmentCategory, Equipment[]>>({
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      Promise.all(
        Object.keys(EQUIPMENT_CATEGORIES).map(async (cat) => {
          const res = await fetch(`${API_URL}/${cat}`)
          const data = await res.json()
          return { cat, data }
        })
      ).then((results) => {
        const eq: Record<EquipmentCategory, Equipment[]> = {
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
        }
        results.forEach(({ cat, data }) => {
          eq[cat as EquipmentCategory] = data
        })
        setAllEquipment(eq)
        setLoading(false)
      })
    }
  }, [open])

  const handleSelect = (cat: EquipmentCategory, id: number) => {
    setSelected((prev) => ({
      ...prev,
      [cat]: prev[cat].includes(id)
        ? prev[cat].filter((item) => item !== id)
        : [...prev[cat], id],
    }))
  }

  const handleConfirm = () => {
    onSelect(selected)
    onOpenChange(false)
  }

  const renderSpecificDetails = (item: Equipment, category: EquipmentCategory) => {
    switch (category) {
      case "teclados":
        return <p>Conexão: {(item as Teclado).tipoDeConexao}</p>
      case "hds":
        return <p>Capacidade: {(item as HD).capacidade} {(item as HD).tipoDeCapacidade}</p>
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
    return url
  }

  // Resumo dos selecionados
  const selectedCount = Object.values(selected).flat().length
  const selectedBadges = Object.entries(selected).flatMap(([cat, ids]) =>
    ids.map(id => (
      <Badge key={cat+id} variant="outline">
        {EQUIPMENT_CATEGORIES[cat as EquipmentCategory]} #{id}
      </Badge>
    ))
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>Selecionar Equipamentos</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {/* Resumo fixo */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b pb-2 mb-2">
            <Label>Selecionados ({selectedCount})</Label>
            <div className="flex flex-wrap gap-2 text-sm mt-1">
              {selectedCount > 0 ? selectedBadges : <span className="text-muted-foreground">Nenhum equipamento selecionado</span>}
            </div>
          </div>
          <ScrollArea className="h-[60vh] rounded-md border">
            <div className="flex flex-col gap-8 p-2">
              {Object.entries(EQUIPMENT_CATEGORIES).map(([cat, label]) => {
                const items = allEquipment[cat as EquipmentCategory]
                if (!items || items.length === 0) return null
                return (
                  <div key={cat}>
                    <h3 className="text-lg font-semibold mb-2">{label}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {items.map((item) => {
                        const isSelected = selected[cat as EquipmentCategory].includes(item.id)
                        return (
                          <Card
                            key={item.id}
                            className={cn(
                              "relative cursor-pointer transition-all border-2",
                              isSelected ? "border-primary ring-2 ring-primary/40" : "border-muted hover:border-primary/40"
                            )}
                            onClick={() => handleSelect(cat as EquipmentCategory, item.id)}
                          >
                            <CardHeader className="flex flex-col items-center gap-2 p-2">
                              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-gray-100 mb-2">
                                <Image
                                  src={convertGoogleDriveUrl(item.imagem) || "/placeholder.svg"}
                                  alt={item.nome}
                                  width={128}
                                  height={128}
                                  className="object-cover"
                                  priority={true}
                                />
                              </div>
                              <CardTitle className="text-base text-center w-full truncate">{item.nome}</CardTitle>
                              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                                <Badge variant={item.status === "DISPONIVEL" ? "default" : "secondary"}>{item.status}</Badge>
                                <Badge variant="outline">{item.situacao}</Badge>
                                <Badge variant="secondary">{label}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-2 px-2 text-xs text-muted-foreground">
                              <div className="grid gap-1">
                                <p>Marca: {item.marca}</p>
                                <p>Modelo: {item.modelo}</p>
                                {renderSpecificDetails(item, cat as EquipmentCategory)}
                                <p className="text-muted-foreground">Ref: {item.codigoDereferencia}</p>
                              </div>
                              <div className="absolute top-2 right-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(e) => { e.stopPropagation?.(); handleSelect(cat as EquipmentCategory, item.id) }}
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <Button onClick={handleConfirm} className="mt-4" disabled={loading || selectedCount === 0}>
            Confirmar Seleção ({selectedCount} selecionado{selectedCount !== 1 ? 's' : ''})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

