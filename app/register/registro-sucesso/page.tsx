import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RegistroSucessoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                Registro Concluído!
              </CardTitle>
              <CardDescription className="text-slate-400">
                Seu registro no RECOM foi realizado com sucesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 mb-6">
                Agradecemos pelo seu interesse. Entraremos em contato em breve com mais informações.
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                  Voltar para a página inicial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

