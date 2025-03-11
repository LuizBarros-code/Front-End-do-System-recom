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
  dataDeSaida: z.string().optional().nullable(),
  imagem: z.string().optional(),
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

export function CreateElectronicDialog({ userId }: { userId: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      dataDeSaida: null,
      imagem: "",
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      console.log("Iniciando upload do arquivo:", file.name)

      const uploadResponse = await fetch("/api/upload-to-drive", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("Erro na resposta do servidor:", errorText)
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      const data = await uploadResponse.json()
      console.log("Upload concluído com sucesso:", data)

      form.setValue("imagem", data.fileUrl)

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      })
    } catch (error) {
      console.error("Erro detalhado no upload:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)

      const selectedType = electronicTypes.find((type) => type.name.toLowerCase() === data.tipo.toLowerCase())
      if (!selectedType) {
        throw new Error("Tipo de eletrônico inválido")
      }

      const endpoint = `http://localhost:3456/${selectedType.route}`

      const submissionData = {
        ...data,
        alunoid: Number.parseInt(userId),
        modificadorid: Number.parseInt(userId),
        dataDeChegada: new Date(data.dataDeChegada).toISOString(),
        dataDeSaida: data.dataDeSaida ? new Date(data.dataDeSaida).toISOString() : null,
      }

      // Remove fields that are not used for this type of electronic
      const fieldsToKeep = getFieldsForType(data.tipo)
      Object.keys(submissionData).forEach((key) => {
        if (!fieldsToKeep.includes(key)) {
          delete submissionData[key]
        }
      })

      console.log("Submitting data:", submissionData)

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

      setIsSubmitting(false)
      form.reset()
      toast({
        title: "Sucesso!",
        description: "Eletrônico cadastrado com sucesso.",
      })
    } catch (error) {
      setIsSubmitting(false)
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
      "dataDeSaida",
      "imagem",
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
    <Dialog>
      <DialogTrigger asChild>
        <Button>Cadastrar Eletrônico</Button>
      </DialogTrigger>
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
              name="dataDeSaida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Saída</FormLabel>
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
            <FormField
              control={form.control}
              name="imagem"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Imagem</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="URL da imagem será gerada automaticamente"
                        className="w-full"
                        readOnly
                      />
                      <div className="relative">
                        <FileInput
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <Button type="button" variant="outline" disabled={isUploading}>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Enviando..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

