export function convertGoogleDriveUrl(url: string) {
    if (!url) return "/placeholder.svg"
  
    // Verifica se é uma URL do Google Drive
    if (url.includes("drive.google.com/file/d/")) {
      // Extrai o ID do arquivo
      const fileId = url.match(/\/d\/([^/]+)/)?.[1]
      if (fileId) {
        // Retorna a URL direta para visualização
        return `https://drive.google.com/uc?export=view&id=${fileId}`
      }
    }
  
    return url
  }
  
  