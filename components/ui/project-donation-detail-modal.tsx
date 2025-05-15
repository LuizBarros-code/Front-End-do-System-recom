import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProjectDonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: number;
}

export function ProjectDonationDetailModal({ isOpen, onClose, donationId }: ProjectDonationDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [isElectronicsModalOpen, setIsElectronicsModalOpen] = useState(false);
  const [electronicsByType, setElectronicsByType] = useState<any>({});
  const [loadingElectronics, setLoadingElectronics] = useState(false);
  const [selectedElectronicDetail, setSelectedElectronicDetail] = useState<any | null>(null);
  const [selectedElectronicImage, setSelectedElectronicImage] = useState<string | null>(null);

  // Carregar detalhes da doação
  React.useEffect(() => {
    if (isOpen && donationId) {
      setLoading(true);
      fetch(`http://localhost:3456/doacoes/${donationId}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, donationId]);

  // Buscar eletrônicos da doação
  const fetchDonationElectronics = async () => {
    setLoadingElectronics(true);
    const endpoints = [
      { key: "teclados", url: "teclados", image: "teclado" },
      { key: "hds", url: "hds", image: "hd" },
      { key: "estabilizadores", url: "estabilizadores", image: "estabilizado" },
      { key: "monitores", url: "monitores", image: "monitor" },
      { key: "mouses", url: "mouses", image: "mouse" },
      { key: "gabinetes", url: "gabinetes", image: "gabinete" },
      { key: "impressoras", url: "impressoras", image: "impressora" },
      { key: "placas-mae", url: "placas-mae", image: "placaMae" },
      { key: "notebooks", url: "notebooks", image: "notebook" },
      { key: "processadores", url: "processadores", image: "processador" },
      { key: "fontes", url: "fontes", image: "fonteDeAlimentacao" },
    ];
    const result: any = {};
    await Promise.all(
      endpoints.map(async (ep) => {
        try {
          const res = await fetch(`http://localhost:3456/doacoes/${donationId}/${ep.url}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              result[ep.key] = data.map((item: any) => ({ ...item, _imageType: ep.image }));
            }
          }
        } catch {}
      })
    );
    setElectronicsByType(result);
    setLoadingElectronics(false);
  };

  // Buscar imagem do eletrônico
  const fetchElectronicImage = async (type: string, id: number) => {
    try {
      const res = await fetch(`http://localhost:3456/imagens/${type}/${id}`);
      if (res.ok) {
        const data = await res.json();
        let caminho = null;
        if (Array.isArray(data) && data.length > 0) {
          caminho = data[0].url || data[0].caminho;
        } else if (data && (data.url || data.caminho)) {
          caminho = data.url || data.caminho;
        }
        if (caminho) {
          if (!caminho.startsWith('/')) caminho = '/' + caminho;
          setSelectedElectronicImage(`http://localhost:3456${caminho}`);
        } else {
          setSelectedElectronicImage(null);
        }
      } else {
        setSelectedElectronicImage(null);
      }
    } catch {
      setSelectedElectronicImage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">Carregando detalhes da doação...</div>
        ) : details ? (
          <>
            <DialogHeader>
              <DialogTitle>Detalhes da Doação para Projeto</DialogTitle>
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className="text-xl font-bold">{details.name || details.nome || "Doação de Projeto"}</span>
                {details.status && <Badge>{details.status}</Badge>}
              </div>
            </DialogHeader>
            <Separator className="my-4" />
            <div className="mb-4">
              <div className="mb-2">
                <b>Descrição</b>
                <div className="bg-muted rounded p-2">{details.descricao}</div>
              </div>
              <div className="mb-2">
                <b>Justificativa</b>
                <div className="bg-muted rounded p-2">{details.justificativa}</div>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <b>Data</b>
                <span className="bg-muted rounded p-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {details.data ? new Date(details.data).toLocaleString() : ""}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => { setIsElectronicsModalOpen(true); fetchDonationElectronics(); }}>
                Ver Eletrônicos
              </Button>
            </div>
            {/* Modal de Eletrônicos da Doação */}
            <Dialog open={isElectronicsModalOpen} onOpenChange={setIsElectronicsModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Eletrônicos da Doação</DialogTitle>
                </DialogHeader>
                {loadingElectronics ? (
                  <div>Carregando eletrônicos...</div>
                ) : Object.keys(electronicsByType).length === 0 ? (
                  <div>Nenhum eletrônico encontrado para esta doação.</div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {Object.entries(electronicsByType).map(([type, items]: any) => (
                      <div key={type}>
                        <div className="font-semibold mb-1 capitalize">{type.replace(/-/g, ' ')}</div>
                        <ul className="list-disc ml-6">
                          {items.map((e: any) => (
                            <li key={e.id} className="mb-2 flex items-center gap-3">
                              <span className="font-medium">{e.nome || e.name || `ID ${e.id}`}</span>
                              <span className="text-xs text-muted-foreground">ID: {e.id}</span>
                              <Button size="sm" variant="outline" onClick={() => { setSelectedElectronicDetail(e); fetchElectronicImage(e._imageType, e.id); }}>
                                Ver Detalhes
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {/* Modal de detalhes do eletrônico */}
                <Dialog open={!!selectedElectronicDetail} onOpenChange={() => setSelectedElectronicDetail(null)}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Detalhes do Eletrônico</DialogTitle>
                    </DialogHeader>
                    {selectedElectronicDetail && (
                      <div className="space-y-2">
                        <img
                          src={selectedElectronicImage || "/placeholder.svg"}
                          alt={selectedElectronicDetail.nome || selectedElectronicDetail.name || `ID ${selectedElectronicDetail.id}`}
                          className="w-24 h-24 object-cover rounded border mb-2"
                        />
                        <div><b>ID:</b> {selectedElectronicDetail.id}</div>
                        <div><b>Nome:</b> {selectedElectronicDetail.nome || selectedElectronicDetail.name}</div>
                        {selectedElectronicDetail.modelo && <div><b>Modelo:</b> {selectedElectronicDetail.modelo}</div>}
                        {selectedElectronicDetail.marca && <div><b>Marca:</b> {selectedElectronicDetail.marca}</div>}
                        {selectedElectronicDetail.serialNumber && <div><b>S/N:</b> {selectedElectronicDetail.serialNumber}</div>}
                        {selectedElectronicDetail.estado && <div><b>Estado:</b> {selectedElectronicDetail.estado}</div>}
                        {selectedElectronicDetail.situacao && <div><b>Situação:</b> {selectedElectronicDetail.situacao}</div>}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="py-8 text-center">Nenhum detalhe encontrado para esta doação.</div>
        )}
      </DialogContent>
    </Dialog>
  );
} 