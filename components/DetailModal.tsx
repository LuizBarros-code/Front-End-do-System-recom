"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Tag, Info, Clock, Package, Cpu, HardDrive, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: number
  itemType: "project" | "user" | "request" | "disposal" | "electronic"
  electronicType?: string
}

export function DetailModal({ isOpen, onClose, itemId, itemType, electronicType }: DetailModalProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [pendingSituacao, setPendingSituacao] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, itemId, itemType, electronicType])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = ""
      switch (itemType) {
        case "project":
          url = `http://26.99.103.209:3456/doacoes/${itemId}`
          break
        case "user":
          url = `http://26.99.103.209:3456/doacoesUsuarios/${itemId}`
          break
        case "request":
          url = `http://26.99.103.209:3456/solicitacoes/${itemId}`
          break
        case "disposal":
          url = `http://26.99.103.209:3456/descartes/${itemId}`
          break
        case "electronic":
          if (electronicType) {
            switch (electronicType.toLowerCase()) {
              case "estabilizador":
                url = `http://26.99.103.209:3456/estabilizadores/${itemId}`
                break
              case "fonte":
              case "fonte de alimentação":
                url = `http://26.99.103.209:3456/fontesDeAlimentacao/${itemId}`
                break
              case "gabinete":
                url = `http://26.99.103.209:3456/gabinetes/${itemId}`
                break
              case "hd":
                url = `http://26.99.103.209:3456/hds/${itemId}`
                break
              case "impressora":
                url = `http://26.99.103.209:3456/impressoras/${itemId}`
                break
              case "monitor":
                url = `http://26.99.103.209:3456/monitores/${itemId}`
                break
              case "notebook":
                url = `http://26.99.103.209:3456/notebooks/${itemId}`
                break
              case "placa mãe":
              case "placa mae":
                url = `http://26.99.103.209:3456/placasMae/${itemId}`
                break
              case "processador":
                url = `http://26.99.103.209:3456/processadores/${itemId}`
                break
              case "teclado":
                url = `http://26.99.103.209:3456/teclados/${itemId}`
                break
              default:
                throw new Error(`Tipo de eletrônico não reconhecido: ${electronicType}`)
            }
          } else {
            throw new Error("Tipo de eletrônico não especificado")
          }
          break
        default:
          throw new Error(`Tipo de item não reconhecido: ${itemType}`)
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }
      const jsonData = await response.json()

      // Se for eletrônico, buscar imagem
      if (itemType === "electronic" && electronicType) {
        // Mapear o tipo para o endpoint correto
        const typeToEndpoint: Record<string, string> = {
          estabilizador: "estabilizado",
          "fonte de alimentação": "fonteDeAlimentacao",
          fonte: "fonteDeAlimentacao",
          gabinete: "gabinete",
          hd: "hd",
          impressora: "impressora",
          monitor: "monitor",
          notebook: "notebook",
          "placa mãe": "placaMae",
          "placa mae": "placaMae",
          processador: "processador",
          teclado: "teclado",
        }
        const endpoint = typeToEndpoint[electronicType.toLowerCase()]
        if (endpoint) {
          const imgRes = await fetch(`http://localhost:3456/imagens/${endpoint}/${itemId}`)
          if (imgRes.ok) {
            const images = await imgRes.json()
            if (images && images[0]?.url) {
              jsonData.imagem = `http://localhost:3456${images[0].url}`
            }
          }
        }
      }
      setData(jsonData)

      // Fetch additional data for project donations
      if (itemType === "project") {
        const donatorResponse = await fetch(`http://26.99.103.209:3456/alunos/${jsonData.donatarioId}`)
        const donatorData = await donatorResponse.json()
        setData((prevData: any) => ({ ...prevData, donator: donatorData }))

        if (jsonData.usuariofisicoId) {
          const receiverResponse = await fetch(`http://26.99.103.209:3456/pessoasFisicas/${jsonData.usuariofisicoId}`)
          const receiverData = await receiverResponse.json()
          setData((prevData: any) => ({ ...prevData, receiver: receiverData }))
        } else if (jsonData.usuariojuridicoId) {
          const receiverResponse = await fetch(`http://26.99.103.209:3456/pessoasJuridicas/${jsonData.usuariojuridicoId}`)
          const receiverData = await receiverResponse.json()
          setData((prevData: any) => ({ ...prevData, receiver: receiverData }))
        }
      }

      // Fetch additional data for user donations
      if (itemType === "user") {
        if (jsonData.donatariofisicoId) {
          const donatorResponse = await fetch(`http://26.99.103.209:3456/pessoasFisicas/${jsonData.donatariofisicoId}`)
          const donatorData = await donatorResponse.json()
          setData((prevData: any) => ({ ...prevData, donator: donatorData }))
        } else if (jsonData.donatariojuridicoId) {
          const donatorResponse = await fetch(`http://26.99.103.209:3456/pessoasJuridicas/${jsonData.donatariojuridicoId}`)
          const donatorData = await donatorResponse.json()
          setData((prevData: any) => ({ ...prevData, donator: donatorData }))
        }
      }

      // Fetch additional data for requests
      if (itemType === "request") {
        if (jsonData.solicitacaofisicoId) {
          const requesterResponse = await fetch(`http://26.99.103.209:3456/pessoasFisicas/${jsonData.solicitacaofisicoId}`)
          const requesterData = await requesterResponse.json()
          setData((prevData: any) => ({ ...prevData, requester: requesterData }))
        } else if (jsonData.solicitacaojuridicoId) {
          const requesterResponse = await fetch(
            `http://26.99.103.209:3456/pessoasJuridicas/${jsonData.solicitacaojuridicoId}`,
          )
          const requesterData = await requesterResponse.json()
          setData((prevData: any) => ({ ...prevData, requester: requesterData }))
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Update the getImageUrl function with this improved version that handles Google Drive links properly
  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg"

    // Check if it's a Google Drive URL
    if (url.includes("drive.google.com")) {
      // Extract the file ID from the URL
      let fileId = ""

      if (url.includes("/file/d/")) {
        // Format: https://drive.google.com/file/d/FILE_ID/view
        fileId = url.split("/file/d/")[1].split("/")[0]
      } else if (url.includes("id=")) {
        // Format: https://drive.google.com/open?id=FILE_ID
        fileId = url.split("id=")[1].split("&")[0]
      } else if (url.includes("drive.google.com/uc")) {
        // Already in the correct format, just return it
        return url
      }

      if (fileId) {
        // Use the direct view URL format
        return `https://drive.google.com/uc?export=view&id=${fileId}`
      }
    }

    // Return the original URL if it's not a Google Drive URL or we couldn't extract the ID
    return url
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; label: string }> = {
      Disponivel: { variant: "success", label: "Disponível" },
      Indisponivel: { variant: "destructive", label: "Indisponível" },
      Novo: { variant: "success", label: "Novo" },
      Usado: { variant: "default", label: "Usado" },
      Defeituoso: { variant: "destructive", label: "Defeituoso" },
      PENDING: { variant: "default", label: "Pendente" },
      APPROVED: { variant: "success", label: "Aprovado" },
      REJECTED: { variant: "destructive", label: "Rejeitado" },
      NEW: { variant: "secondary", label: "Novo" },
      IN_PROGRESS: { variant: "default", label: "Em Andamento" },
    }

    const statusInfo = variants[status] || { variant: "default", label: status }
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      // Se for meia-noite, mostra só a data
      if (date.getHours() === 0 && date.getMinutes() === 0) {
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return dateString
    }
  }

  // Função para atualizar status ou situação
  const handleSave = async () => {
    if (!data || !itemType || itemType !== "electronic" || !electronicType) return
    let endpoint = ""
    switch (electronicType.toLowerCase()) {
      case "estabilizador": endpoint = `estabilizadores/${itemId}`; break
      case "fonte": case "fonte de alimentação": endpoint = `fontesDeAlimentacao/${itemId}`; break
      case "gabinete": endpoint = `gabinetes/${itemId}`; break
      case "hd": endpoint = `hds/${itemId}`; break
      case "impressora": endpoint = `impressoras/${itemId}`; break
      case "monitor": endpoint = `monitores/${itemId}`; break
      case "notebook": endpoint = `notebooks/${itemId}`; break
      case "placa mãe": case "placa mae": endpoint = `placasMae/${itemId}`; break
      case "processador": endpoint = `processadores/${itemId}`; break
      case "teclado": endpoint = `teclados/${itemId}`; break
      default: return
    }
    setIsSaving(true)
    try {
      const body: Record<string, string> = {}
      if (pendingStatus !== null && pendingStatus !== data.status) body.status = pendingStatus
      if (pendingSituacao !== null && pendingSituacao !== data.situacao) body.situacao = pendingSituacao
      const res = await fetch(`http://localhost:3456/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error("Erro ao atualizar")
      setData((prev: any) => ({ ...prev, ...body }))
      setPendingStatus(null)
      setPendingSituacao(null)
      toast({ title: "Sucesso", description: `Alterações salvas!` })
    } catch (e) {
      toast({ title: "Erro", description: `Não foi possível salvar as alterações.` })
    } finally {
      setIsSaving(false)
    }
  }

  const renderElectronicDetails = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        {/* Image Section */}
        <div className="flex justify-center">
          {data.imagem ? (
            <div className="relative w-full h-64 overflow-hidden rounded-lg">
              <img
                src={getImageUrl(data.imagem) || "/placeholder.svg"}
                alt={data.nome || "Eletrônico"}
                className="object-contain w-full h-full"
                onError={(e) => {
                  // If the image fails to load, replace with placeholder
                  e.currentTarget.src = "/placeholder.svg"
                  console.error("Failed to load image:", data.imagem)
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-64 bg-muted rounded-lg">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Title and Status */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">{data.nome || "Eletrônico"}</h2>
          <div className="flex items-center justify-center mt-2 space-x-2">
            {data.status && getStatusBadge(data.status)}
            {data.situacao && getStatusBadge(data.situacao)}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
            <div className="min-w-[180px]">
              <Label className="mb-1 block">Status</Label>
              <Select value={pendingStatus !== null ? pendingStatus : (data.status || "")} onValueChange={v => setPendingStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Usado">Usado</SelectItem>
                  <SelectItem value="Defeituoso">Defeituoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[180px]">
              <Label className="mb-1 block">Situação</Label>
              <Select value={pendingSituacao !== null ? pendingSituacao : (data.situacao || "")} onValueChange={v => setPendingSituacao(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em estoque">Em estoque</SelectItem>
                  <SelectItem value="Em uso">Em uso</SelectItem>
                  <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {((pendingStatus !== null && pendingStatus !== data.status) || (pendingSituacao !== null && pendingSituacao !== data.situacao)) && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={
                  isSaving
                    ? "bg-gray-200 text-gray-500 border border-gray-300 font-semibold rounded-full px-8 py-3 shadow flex items-center gap-2 cursor-not-allowed"
                    : "border border-green-600 text-green-700 bg-white hover:bg-green-50 font-semibold rounded-full px-8 py-3 shadow flex items-center gap-2 transition-all"
                }
                style={{ minWidth: 160 }}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.tipo && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Tag className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{data.tipo}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.marca && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Info className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-medium">{data.marca}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.modelo && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Cpu className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Modelo</p>
                  <p className="font-medium">{data.modelo}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.potencia && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <HardDrive className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Potência</p>
                  <p className="font-medium">{data.potencia} W</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.dataDeChegada && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Chegada</p>
                  <p className="font-medium">{formatDate(data.dataDeChegada)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.updatedAt && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="font-medium">{formatDate(data.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {data.descricao && (
          <div className="p-4 border rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Descrição</h3>
            <p className="text-muted-foreground">{data.descricao}</p>
          </div>
        )}

        {/* Additional Info */}
        {data.codigoDeReferencia && (
          <div className="p-4 border rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Código de Referência</h3>
            <p className="font-mono text-sm bg-muted p-2 rounded">{data.codigoDeReferencia}</p>
          </div>
        )}
      </div>
    )
  }

  const renderProjectDetails = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{data.name || "Projeto"}</h2>
          <div className="flex items-center justify-center mt-2 space-x-2">
            {data.status && getStatusBadge(data.status)}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {data.descricao && (
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">Descrição</h3>
              <p className="text-muted-foreground">{data.descricao}</p>
            </div>
          )}

          {data.justificativa && (
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">Justificativa</h3>
              <p className="text-muted-foreground">{data.justificativa}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.donator && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">Doador</h3>
                  <p className="font-medium">{data.donator.name}</p>
                </CardContent>
              </Card>
            )}

            {data.receiver && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">Receptor</h3>
                  <p className="font-medium">{data.receiver.name}</p>
                </CardContent>
              </Card>
            )}

            {data.data && (
              <Card>
                <CardContent className="flex items-center p-4 space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{formatDate(data.data)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderUserDonationDetails = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{data.name || "Doação de Usuário"}</h2>
          <div className="flex items-center justify-center mt-2 space-x-2">
            {data.status && getStatusBadge(data.status)}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {data.descricao && (
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">Descrição</h3>
              <p className="text-muted-foreground">{data.descricao}</p>
            </div>
          )}

          {data.eletronicos && (
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">Eletrônicos</h3>
              <p className="text-muted-foreground">{data.eletronicos}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.donator && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">Doador</h3>
                  <p className="font-medium">{data.donator.name}</p>
                </CardContent>
              </Card>
            )}

            {data.data && (
              <Card>
                <CardContent className="flex items-center p-4 space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{formatDate(data.data)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.horarioDeEntrega && (
              <Card>
                <CardContent className="flex items-center p-4 space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horário de Entrega</p>
                    <p className="font-medium">{data.horarioDeEntrega}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.contato && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">Contato</h3>
                  <p className="font-medium">{data.contato}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderRequestDetails = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{data.name || "Solicitação"}</h2>
          <div className="flex items-center justify-center mt-2 space-x-2">
            {data.status && getStatusBadge(data.status)}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {data.descricao && (
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">Descrição</h3>
              <p className="text-muted-foreground">{data.descricao}</p>
            </div>
          )}

          {data.eletronicos && (
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">Eletrônicos</h3>
              <p className="text-muted-foreground">{data.eletronicos}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.requester && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-medium">Solicitante</h3>
                  <p className="font-medium">{data.requester.name}</p>
                </CardContent>
              </Card>
            )}

            {data.data && (
              <Card>
                <CardContent className="flex items-center p-4 space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{formatDate(data.data)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.dataparapegar && (
              <Card>
                <CardContent className="flex items-center p-4 space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data para Retirada</p>
                    <p className="font-medium">{formatDate(data.dataparapegar)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.horarioparapegar && (
              <Card>
                <CardContent className="flex items-center p-4 space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horário para Retirada</p>
                    <p className="font-medium">{data.horarioparapegar}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderDisposalDetails = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Descarte de Equipamento</h2>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.tipoEquipamento && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Tag className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Equipamento</p>
                  <p className="font-medium">{data.tipoEquipamento}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.quantidade && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade</p>
                  <p className="font-medium">{data.quantidade}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.dataDescarte && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Descarte</p>
                  <p className="font-medium">{formatDate(data.dataDescarte)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data.metodoDescarte && (
            <Card>
              <CardContent className="flex items-center p-4 space-x-3">
                <Info className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Método de Descarte</p>
                  <p className="font-medium">{data.metodoDescarte}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Carregando detalhes...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium">Erro ao carregar dados</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      )
    }

    if (!data) {
      return (
        <div className="p-6 text-center">
          <p>Nenhum dado disponível</p>
        </div>
      )
    }

    switch (itemType) {
      case "electronic":
        return renderElectronicDetails()
      case "project":
        return renderProjectDetails()
      case "user":
        return renderUserDonationDetails()
      case "request":
        return renderRequestDetails()
      case "disposal":
        return renderDisposalDetails()
      default:
        return <pre className="p-4 overflow-auto bg-muted rounded-md">{JSON.stringify(data, null, 2)}</pre>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {itemType === "electronic" && "Detalhes do Eletrônico"}
            {itemType === "project" && "Detalhes da Doação para Projeto"}
            {itemType === "user" && "Detalhes da Doação de Usuário"}
            {itemType === "request" && "Detalhes da Solicitação"}
            {itemType === "disposal" && "Detalhes do Descarte"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">{renderContent()}</div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

