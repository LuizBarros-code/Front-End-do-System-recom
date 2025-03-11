import { NextResponse } from "next/server"
import { google } from "googleapis"
import { Readable } from "stream"

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"],
})

const drive = google.drive({ version: "v3", auth })

export async function POST(req: Request) {
  console.log("Iniciando processamento do upload")
  try {
    const formData = await req.formData()
    console.log("FormData recebido")
    const file = formData.get("file") as File | null
    console.log("Arquivo extraído do FormData:", file?.name)

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    console.log("Arquivo recebido:", file.name)

    const buffer = Buffer.from(await file.arrayBuffer())

    const fileMetadata = {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_ELECTRONICS_FOLDER_ID!],
    }

    const media = {
      mimeType: file.type || "application/octet-stream",
      body: Readable.from(buffer),
    }

    console.log("Enviando arquivo para o Google Drive...")

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id,webViewLink",
    })

    console.log("Arquivo enviado com sucesso. ID:", response.data.id)

    // Set file permissions to anyone with the link can view
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    return NextResponse.json({
      fileUrl: response.data.webViewLink,
      fileId: response.data.id,
    })
  } catch (error) {
    console.error("Erro detalhado no upload do arquivo:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack de erro:", error.stack)
    }
    return NextResponse.json({ error: "Erro ao fazer upload do arquivo", details: String(error) }, { status: 500 })
  }
}

