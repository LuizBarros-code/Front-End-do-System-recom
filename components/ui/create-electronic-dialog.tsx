"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { FileInput } from "@/components/ui/file-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormFooter } from "@/components/ui/form"

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().min(1, { message: "Descrição é obrigatória" }),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
  codigoDereferencia: z.string().min(1, { message: "Código de referência é obrigatório" }),
  marca: z.string().min(1, { message: "Marca é obrigatória" }),
  modelo: z.string().min(1, { message: "Modelo é obrigatório" }),
  situacao: z.string().min(1, { message: "Situação é obrigatória" }),
  dataDeChegada: z.string().min(1, { message: "Data de chegada é obrigatória" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  tipoDeCapacidade: z.string().optional(),
  capacidade: z.number().optional(),
  tipoDeConexao: z.string().optional(),
  potencia: z.number().optional(),
  polegadas: z.number().optional(),
  tipoDeTinta: z.string().optional(),
  socket: z.string().optional(),
  velocidade: z.number().optional(),
})

type FormData = z.infer<typeof formSchema>

const electronicTypes = [
  { name: "Teclado", route: "teclados" },
  { name: "HD", route: "hds" },
  { name: "Fonte de Alimentação", route: "fontesDeAlimentacao" },
  { name: "Gabinete", route: "gabinetes" },
  { name: "Monitor", route: "monitores" },
  { name: "Mouse", route: "mouses" },
  { name: "Estabilizador", route: "estabilizadores" },
  { name: "Impressora", route: "impressoras" },
  { name: "Placa Mãe", route: "placasMae" },
  { name: "Notebook", route: "notebooks" },
  { name: "Processador", route: "processadores" },
]

export function CreateElectronicDialog({ userId, open, onOpenChange, onSuccess }: { userId: string, open?: boolean, onOpenChange?: (open: boolean) => void, onSuccess?: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      tipo: "",
      codigoDereferencia: "",
      marca: "",
      modelo: "",
      situacao: "Em estoque",
      dataDeChegada: "",
      status: "Novo",
      tipoDeCapacidade: "",
      capacidade: undefined,
      tipoDeConexao: "",
      potencia: undefined,
      polegadas: undefined,
      tipoDeTinta: "",
      socket: "",
      velocidade: undefined,
    },
  })

  // Reset states when modal is closed
  useEffect(() => {
    if (open === false) {
      setIsSubmitting(false)
      setIsUploading(false)
      setSelectedFiles([])
      form.reset()
    }
  }, [open])

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)

      const selectedType = electronicTypes.find((type) => type.name.toLowerCase() === data.tipo.toLowerCase())
      if (!selectedType) {
        throw new Error("Tipo de eletrônico inválido")
      }

      let submissionData: any = {
        codigoDereferencia: data.codigoDereferencia,
        descricao: data.descricao,
        status: data.status,
        dataDeChegada: new Date(data.dataDeChegada).toISOString(),
        marca: data.marca,
        modelo: data.modelo,
        nome: data.nome,
        situacao: data.situacao,
        modificadorid: Number(userId),
      }

      switch (selectedType.route) {
        case "estabilizadores":
          submissionData.alunoid = Number(userId)
          submissionData.potencia = data.potencia
          break
        case "fontesDeAlimentacao":
          submissionData.alunoid = Number(userId)
          submissionData.potencia = data.potencia
          break
        case "gabinetes":
          submissionData.alunoid = Number(userId)
          break
        case "hds":
          submissionData.capacidade = data.capacidade
          submissionData.tipoDeCapacidade = data.tipoDeCapacidade
          submissionData.usuarioId = Number(userId)
          break
        case "impressoras":
          submissionData.tipoDeTinta = data.tipoDeTinta
          submissionData.alunoid = Number(userId)
          break
        case "monitores":
          submissionData.polegadas = data.polegadas
          submissionData.alunoid = Number(userId)
          break
        case "notebooks":
          submissionData.alunoid = Number(userId)
          break
        case "placasMae":
          submissionData.alunoid = Number(userId)
          break
        case "processadores":
          submissionData.alunoid = Number(userId)
          break
        case "teclados":
          submissionData.tipoDeConexao = data.tipoDeConexao
          submissionData.usuarioId = Number(userId)
          break
        case "mouses":
          submissionData.tipoDeConexao = data.tipoDeConexao
          submissionData.usuarioId = Number(userId)
          break
      }

      // Remover campos undefined
      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === undefined) {
          delete submissionData[key]
        }
      })

      const endpoint = `http://26.99.103.209:3456/${selectedType.route}`

      // Validação extra: checar campos obrigatórios
      const missingFields: string[] = []
      Object.keys(submissionData).forEach((key) => {
        if (
          key !== "imagem" && // imagem é opcional
          (submissionData[key] === undefined || submissionData[key] === null || submissionData[key] === "")
        ) {
          missingFields.push(key)
        }
      })
      if (missingFields.length > 0) {
        setIsSubmitting(false)
        toast({
          title: "Campos obrigatórios faltando",
          description: `Preencha os campos: ${missingFields.join(", ")}`,
          variant: "destructive",
        })
        return
      }

      console.log("Submitting data (eletrônico):", submissionData)

      // 1. Cadastra o eletrônico
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const created = await response.json()
      const eletronicId = created.id || created.eletronicoId || created.eletronicId

      // 2. Se houver imagens, faz upload para /imagens
      let imageResults: string[] = []
      if (selectedFiles.length > 0 && eletronicId) {
        setIsUploading(true)
        for (const file of selectedFiles) {
          const formData = new FormData()
          formData.append("image", file)

          // Determina o ID correto baseado no tipo de eletrônico
          const selectedType = electronicTypes.find((type) => type.name.toLowerCase() === data.tipo.toLowerCase())
          if (!selectedType) {
            throw new Error("Tipo de eletrônico inválido")
          }

          // Adiciona o campo de ID correto como texto
          switch (selectedType.route) {
            case "teclados":
              formData.append("tecladoId", eletronicId.toString())
              break
            case "hds":
              formData.append("hdId", eletronicId.toString())
              break
            case "fontesDeAlimentacao":
              formData.append("fontedealimentacaoId", eletronicId.toString())
              break
            case "gabinetes":
              formData.append("gabineteId", eletronicId.toString())
              break
            case "monitores":
              formData.append("monitorId", eletronicId.toString())
              break
            case "mouses":
              formData.append("mouseId", eletronicId.toString())
              break
            case "estabilizadores":
              formData.append("estabilizadorId", eletronicId.toString())
              break
            case "impressoras":
              formData.append("impressoraId", eletronicId.toString())
              break
            case "placasMae":
              formData.append("placamaeId", eletronicId.toString())
              break
            case "notebooks":
              formData.append("notebookId", eletronicId.toString())
              break
            case "processadores":
              formData.append("processadorId", eletronicId.toString())
              break
          }

          // Log da requisição de upload da imagem
          console.log("Enviando imagem para:", "http://26.99.103.209:3456/imagens")
          console.log("FormData contém:")
          for (let pair of formData.entries()) {
            console.log(pair[0]+ ':', pair[1]);
          }

          const uploadResp = await fetch("http://26.99.103.209:3456/imagens", {
            method: "POST",
            body: formData
          })
          if (uploadResp.ok) {
            const uploadData = await uploadResp.json()
            console.log("Resposta do upload:", uploadData)
            imageResults.push(uploadData.url || uploadData.imagem || uploadData.fileUrl || file.name)
          } else {
            console.error("Erro no upload:", await uploadResp.text())
            imageResults.push(`Erro ao enviar: ${file.name}`)
          }
        }
        setIsUploading(false)
      }

      setSelectedFiles([])
      form.reset()
      toast({
        title: "Sucesso!",
        description:
          imageResults.length > 0
            ? `Eletrônico cadastrado. Imagens: ${imageResults.join(", ")}`
            : "Eletrônico cadastrado com sucesso.",
      })
      if (onSuccess) onSuccess()
      setIsSubmitting(false)
      setIsUploading(false)
    } catch (error) {
      setIsSubmitting(false)
      setIsUploading(false)
      console.error("Error details:", error)
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? `Falha ao cadastrar o eletrônico: ${error.message}`
            : "Ocorreu um erro desconhecido ao cadastrar o eletrônico.",
        variant: "destructive",
      })
    }
  }

  const getFieldsForType = (type: string): string[] => {
    const commonFields = [
      "nome",
      "descricao",
      "tipo",
      "codigoDereferencia",
      "marca",
      "modelo",
      "situacao",
      "dataDeChegada",
      "status",
      "alunoid",
      "modificadorid",
    ]

    switch (type.toLowerCase()) {
      case "teclado":
      case "mouse":
        return [...commonFields, "tipoDeConexao"]
      case "hd":
        return [...commonFields, "tipoDeCapacidade", "capacidade"]
      case "fonte de alimentação":
      case "estabilizador":
        return [...commonFields, "potencia"]
      case "monitor":
        return [...commonFields, "polegadas"]
      case "impressora":
        return [...commonFields, "tipoDeTinta"]
      case "placa mãe":
      case "processador":
        return [...commonFields, "socket"]
      default:
        return commonFields
    }
  }

  const renderSpecificFields = (type: string) => {
    switch (type.toLowerCase()) {
      case "teclado":
      case "mouse":
        return (
          <FormField
            control={form.control}
            name="tipoDeConexao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Conexão</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case "hd":
        return (
          <>
            <FormField
              control={form.control}
              name="tipoDeCapacidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Capacidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade (GB)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )
      case "fonte de alimentação":
      case "estabilizador":
        return (
          <FormField
            control={form.control}
            name="potencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potência (W)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case "monitor":
        return (
          <FormField
            control={form.control}
            name="polegadas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Polegadas</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case "impressora":
        return (
          <FormField
            control={form.control}
            name="tipoDeTinta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Tinta</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case "placa mãe":
      case "processador":
        return (
          <FormField
            control={form.control}
            name="socket"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Socket</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Eletrônico</DialogTitle>
          <DialogDescription>Cadastre um novo equipamento eletrônico no sistema.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-4 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do eletrônico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do eletrônico" {...field} className="h-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue("tipo", value)
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {electronicTypes.map((type) => (
                          <SelectItem key={type.name} value={type.name.toLowerCase()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {renderSpecificFields(form.watch("tipo"))}
            <FormField
              control={form.control}
              name="codigoDereferencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Referência</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="situacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Em estoque">Em estoque</SelectItem>
                        <SelectItem value="Em uso">Em uso</SelectItem>
                        <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataDeChegada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Chegada</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Usado">Usado</SelectItem>
                        <SelectItem value="Defeituoso">Defeituoso</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-3">
              <FormLabel>Imagens</FormLabel>
              <div className="flex gap-2 items-center">
                <Input
                  value={selectedFiles.length > 0 ? selectedFiles.map(f => f.name).join(", ") : ""}
                  placeholder="Selecione uma ou mais imagens para enviar"
                  className="w-full"
                  readOnly
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                  disabled={isUploading || isSubmitting}
                  className="block"
                />
              </div>
            </div>
            <FormFooter className="col-span-3 flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

