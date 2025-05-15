"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ElectronicDetailModal } from "@/components/ui/electronic-detail-modal"

// Componente auxiliar para exibir eletrônico com imagem
function ElectronicWithImage({ catKey, electronic }: { catKey: string, electronic: any }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    const imageEndpointMap: Record<string, string> = {
      teclados: "teclado",
      hds: "hd",
      fontesDeAlimentacao: "fonteDeAlimentacao",
      gabinetes: "gabinete",
      monitores: "monitor",
      mouses: "mouse",
      estabilizadores: "estabilizado",
      impressoras: "impressora",
      placasMae: "placaMae",
      notebooks: "notebook",
      processadores: "processador",
    };
    const endpoint = imageEndpointMap[catKey];
    if (!endpoint) return;
    let mounted = true;
    const url = `http://localhost:3456/imagens/${endpoint}/${electronic.id}`;
    fetch(url)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!mounted) return;
        let caminho = null;
        if (Array.isArray(data) && data.length > 0) {
          caminho = data[0].url || data[0].caminho;
        } else if (data && (data.url || data.caminho)) {
          caminho = data.url || data.caminho;
        }
        if (caminho) {
          if (!caminho.startsWith('/')) caminho = '/' + caminho;
          setImgUrl(`http://localhost:3456${caminho}`);
        } else {
          setImgUrl(null);
        }
      })
      .catch(() => setImgUrl(null));
    return () => { mounted = false; };
  }, [catKey, electronic.id]);
  return (
    <li className="mb-1 flex items-center gap-3">
      <img src={imgUrl || "/placeholder.svg"} alt={electronic.nome || electronic.name || `ID ${electronic.id}`} className="w-12 h-12 object-cover rounded border" />
      <div>
        <span className="font-medium">{electronic.nome || electronic.name || `ID ${electronic.id}`}</span>
        {electronic.modelo && <span className="ml-2 text-gray-500">Modelo: {electronic.modelo}</span>}
        {electronic.marca && <span className="ml-2 text-gray-500">Marca: {electronic.marca}</span>}
        {electronic.serialNumber && <span className="ml-2 text-gray-500">S/N: {electronic.serialNumber}</span>}
      </div>
    </li>
  );
}

export function DisposalDetailModal({ isOpen, onClose, disposalId }: { isOpen: boolean, onClose: () => void, disposalId?: number }) {
  const [disposal, setDisposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [electronics, setElectronics] = useState<any[]>([]);
  const [isElectronicsModalOpen, setIsElectronicsModalOpen] = useState(false);
  const [selectedElectronic, setSelectedElectronic] = useState<{ id: number, type: string } | null>(null);
  const [isElectronicDetailModalOpen, setIsElectronicDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !disposalId) return;
    setLoading(true);
    // Buscar detalhes do descarte
    fetch(`http://localhost:3456/descartes/${disposalId}`)
      .then(res => res.json())
      .then(data => setDisposal(data))
      .catch(() => setDisposal(null));
    // Buscar eletrônicos de todas as categorias
    const endpoints = [
      { key: "teclados", url: "teclados", label: "Teclados" },
      { key: "hds", url: "hds", label: "HDs" },
      { key: "estabilizadores", url: "estabilizadores", label: "Estabilizadores" },
      { key: "monitores", url: "monitores", label: "Monitores" },
      { key: "mouses", url: "mouses", label: "Mouses" },
      { key: "gabinetes", url: "gabinetes", label: "Gabinetes" },
      { key: "impressoras", url: "impressoras", label: "Impressoras" },
      { key: "placasMae", url: "placasMae", label: "Placas Mãe" },
      { key: "notebooks", url: "notebooks", label: "Notebooks" },
      { key: "processadores", url: "processadores", label: "Processadores" },
    ];
    Promise.all(
      endpoints.map(async (ep) => {
        const res = await fetch(`http://localhost:3456/descartes/${disposalId}/${ep.url}`);
        if (!res.ok) return { key: ep.key, label: ep.label, items: [] };
        const data = await res.json();
        return { key: ep.key, label: ep.label, items: Array.isArray(data) ? data.map(item => ({ ...item, tipoCategoria: ep.key })) : [] };
      })
    ).then((all) => setElectronics(all));
    setLoading(false);
  }, [isOpen, disposalId]);

  // Verifica se há algum eletrônico em qualquer categoria
  const hasAnyElectronics = electronics.some(cat => cat.items && cat.items.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Descarte</DialogTitle>
        </DialogHeader>
        {loading || !disposal ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <strong>Nome:</strong> {disposal.name}
            </div>
            <div>
              <strong>Descrição:</strong> {disposal.descricao}
            </div>
            <div>
              <strong>Data:</strong> {disposal.data ? new Date(disposal.data.split('T')[0]).toLocaleDateString() : "-"}
            </div>
            <div>
              <strong>Código de Referência:</strong> {disposal.codigoDeReferencias}
            </div>
            <div>
              <strong>ID Usuário:</strong> {disposal.usuarioId}
            </div>
            <div className="mt-4">
              <strong>Eletrônicos deste descarte:</strong>
              {electronics.map((cat) => (
                <div key={cat.label} className="mt-2">
                  <span className="font-semibold">{cat.label}:</span> {cat.items.length > 0 ? cat.items.map((e: any) => e.nome || e.name || e.id).join(", ") : "Nenhum"}
                </div>
              ))}
            </div>
            {hasAnyElectronics && (
              <div className="mt-4 flex justify-end">
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setIsElectronicsModalOpen(true)}
                >
                  Ver Eletrônicos
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
      {/* Modal de Eletrônicos */}
      <Dialog open={isElectronicsModalOpen} onOpenChange={setIsElectronicsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Eletrônicos do Descarte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {electronics.filter(cat => cat.items.length > 0).length === 0 ? (
              <div>Nenhum eletrônico associado a este descarte.</div>
            ) : (
              electronics.filter(cat => cat.items.length > 0).map(cat => (
                <div key={cat.label}>
                  <div className="font-semibold mb-1">{cat.label}:</div>
                  <ul className="list-disc ml-6">
                    {cat.items.map((e: any) => (
                      <li
                        key={e.id}
                        className="mb-1 flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded p-1"
                        onClick={() => {
                          setSelectedElectronic({ id: e.id, type: cat.key });
                          setIsElectronicDetailModalOpen(true);
                        }}
                      >
                        <ElectronicWithImage catKey={cat.key} electronic={e} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      {selectedElectronic && (
        <ElectronicDetailModal
          isOpen={isElectronicDetailModalOpen}
          onClose={() => setIsElectronicDetailModalOpen(false)}
          electronicId={selectedElectronic.id}
          electronicType={selectedElectronic.type}
        />
      )}
    </Dialog>
  );
}

