import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    // Implementar lógica de atualização de status
    return NextResponse.json({ message: 'Status atualizado com sucesso' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    )
  }
}

