import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Phone, User } from "lucide-react"

interface DetailData {
  id: number
  name: string
  eletronicos: string
  descricao: string
  informacoesAdicionais?: string
  informacoes?: string
  horarioDeEntrega?: string
  horarioparapegar?: string
  contato: string
  data: string
  status: string
  createdAt: string
}

interface DetailsDialogProps {
  data: DetailData | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  type: "doacao" | "solicitacao"
}

export function DetailsDialog({ data, isOpen, onOpenChange, type }: DetailsDialogProps) {
  if (!data) return null

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "success" | "destructive"; label: string }> = {
      pendente: { variant: "default", label: "Pendente" },
      aprovado: { variant: "success", label: "Aprovado" },
      rejeitado: { variant: "destructive", label: "Rejeitado" },
      default: { variant: "default", label: "Pendente" },
    }

    const statusInfo = variants[status?.toLowerCase()] || variants.default
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {type === "doacao" ? "Detalhes da Doação" : "Detalhes da Solicitação"} #{data.id}
            </DialogTitle>
            {getStatusBadge(data.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Principais</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{type === "doacao" ? "Doador" : "Solicitante"}</span>
                </div>
                <p>{data.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Contato</span>
                </div>
                <p>{data.contato}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Data</span>
                </div>
                <p>{new Date(data.data).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Horário</span>
                </div>
                <p>{type === "doacao" ? data.horarioDeEntrega : data.horarioparapegar}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipamentos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Equipamentos</h3>
            <p>{data.eletronicos}</p>
          </div>

          <Separator />

          {/* Descrição e Informações Adicionais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground">{data.descricao}</p>
            </div>

            {(data.informacoesAdicionais || data.informacoes) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Informações Adicionais</h3>
                <p className="text-muted-foreground">{data.informacoesAdicionais || data.informacoes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Data de Criação */}
          <div className="text-sm text-muted-foreground">
            <p>
              {type === "doacao" ? "Doação criada" : "Solicitação criada"} em{" "}
              {new Date(data.createdAt).toLocaleDateString()} às {new Date(data.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

