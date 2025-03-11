"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: number
  itemType: "project" | "user" | "request" | "disposal" | "electronic"
}

export function DetailModal({ isOpen, onClose, itemId, itemType }: DetailModalProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = ""
      switch (itemType) {
        case "project":
          url = `http://localhost:3456/doacoes/${itemId}`
          break
        case "user":
          url = `http://localhost:3456/doacoesUsuarios/${itemId}`
          break
        case "request":
          url = `http://localhost:3456/solicitacoes/${itemId}`
          break
        case "disposal":
          url = `http://localhost:3456/descartes/${itemId}`
          break
        case "electronic":
          url = `http://localhost:3456/eletronicos/${itemId}`
          break
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
      const result = await response.json()
      setData(result)

      // Fetch additional data for project donations
      if (itemType === "project") {
        const donatorResponse = await fetch(`http://localhost:3456/alunos/${result.donatarioId}`)
        const donatorData = await donatorResponse.json()
        setData((prevData) => ({ ...prevData, donator: donatorData }))

        if (result.usuariofisicoId) {
          const receiverResponse = await fetch(`http://localhost:3456/pessoasFisicas/${result.usuariofisicoId}`)
          const receiverData = await receiverResponse.json()
          setData((prevData) => ({ ...prevData, receiver: receiverData }))
        } else if (result.usuariojuridicoId) {
          const receiverResponse = await fetch(`http://localhost:3456/pessoasJuridicas/${result.usuariojuridicoId}`)
          const receiverData = await receiverResponse.json()
          setData((prevData) => ({ ...prevData, receiver: receiverData }))
        }
      }

      // Fetch additional data for user donations
      if (itemType === "user") {
        if (result.donatariofisicoId) {
          const donatorResponse = await fetch(`http://localhost:3456/pessoasFisicas/${result.donatariofisicoId}`)
          const donatorData = await donatorResponse.json()
          setData((prevData) => ({ ...prevData, donator: donatorData }))
        } else if (result.donatariojuridicoId) {
          const donatorResponse = await fetch(`http://localhost:3456/pessoasJuridicas/${result.donatariojuridicoId}`)
          const donatorData = await donatorResponse.json()
          setData((prevData) => ({ ...prevData, donator: donatorData }))
        }
      }

      // Fetch additional data for requests
      if (itemType === "request") {
        if (result.solicitacaofisicoId) {
          const requesterResponse = await fetch(`http://localhost:3456/pessoasFisicas/${result.solicitacaofisicoId}`)
          const requesterData = await requesterResponse.json()
          setData((prevData) => ({ ...prevData, requester: requesterData }))
        } else if (result.solicitacaojuridicoId) {
          const requesterResponse = await fetch(
            `http://localhost:3456/pessoasJuridicas/${result.solicitacaojuridicoId}`,
          )
          const requesterData = await requesterResponse.json()
          setData((prevData) => ({ ...prevData, requester: requesterData }))
        }
      }
    } catch (err) {
      setError("An error occurred while fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Item</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data ? (
            <div className="space-y-4">
              {itemType === "project" && (
                <>
                  <p>
                    <strong>Nome do Projeto:</strong> {data.name}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {data.descricao}
                  </p>
                  <p>
                    <strong>Justificativa:</strong> {data.justificativa}
                  </p>
                  <p>
                    <strong>Status:</strong> {data.status}
                  </p>
                  <p>
                    <strong>Doador:</strong> {data.donator?.name}
                  </p>
                  <p>
                    <strong>Receptor:</strong> {data.receiver?.name}
                  </p>
                </>
              )}
              {itemType === "user" && (
                <>
                  <p>
                    <strong>Nome:</strong> {data.name}
                  </p>
                  <p>
                    <strong>Eletrônicos:</strong> {data.eletronicos}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {data.descricao}
                  </p>
                  <p>
                    <strong>Status:</strong> {data.status}
                  </p>
                  <p>
                    <strong>Doador:</strong> {data.donator?.name}
                  </p>
                </>
              )}
              {itemType === "request" && (
                <>
                  <p>
                    <strong>Nome:</strong> {data.name}
                  </p>
                  <p>
                    <strong>Eletrônicos:</strong> {data.eletronicos}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {data.descricao}
                  </p>
                  <p>
                    <strong>Status:</strong> {data.status}
                  </p>
                  <p>
                    <strong>Solicitante:</strong> {data.requester?.name}
                  </p>
                </>
              )}
              {itemType === "disposal" && (
                <>
                  <p>
                    <strong>Tipo de Equipamento:</strong> {data.tipoEquipamento}
                  </p>
                  <p>
                    <strong>Quantidade:</strong> {data.quantidade}
                  </p>
                  <p>
                    <strong>Data de Descarte:</strong> {new Date(data.dataDescarte).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Método de Descarte:</strong> {data.metodoDescarte}
                  </p>
                </>
              )}
              {itemType === "electronic" && (
                <>
                  <p>
                    <strong>Nome:</strong> {data.nome}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {data.tipo}
                  </p>
                  <p>
                    <strong>Modelo:</strong> {data.modelo}
                  </p>
                  <p>
                    <strong>Estado:</strong> {data.estado}
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

