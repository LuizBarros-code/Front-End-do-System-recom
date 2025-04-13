"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { GraduationCap, Users, Building2, ArrowRight, Heart, Gift, HandHeart, Sparkles } from "lucide-react"
import Link from "next/link"

const stats = [
  { value: "500+", label: "Doações Realizadas" },
  { value: "1000+", label: "Pessoas Impactadas" },
  { value: "50+", label: "Parceiros" },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#141922] relative overflow-hidden">
      {/* Simple gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#141922] via-[#141922] to-[#1c2a1c] opacity-80"
        style={{
          background: "radial-gradient(circle at 50% 70%, rgba(132, 225, 0, 0.15), rgba(0, 0, 0, 0) 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a3a1c] border border-[#84e100]/30 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-[#84e100]" />
            <span className="text-sm font-medium text-[#84e100]">Faça a diferença hoje</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 text-[#84e100]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Sistema de Doações
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-2xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Conectando pessoas e transformando vidas através da tecnologia e solidariedade
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-md mx-auto">
            <Link
              href="/login"
              className="bg-[#84e100] hover:bg-[#9aff00] text-[#141922] font-medium rounded-md flex items-center justify-center gap-2 px-6 py-3 text-base transition-colors duration-200 w-full"
            >
              Começar Agora <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-[#141922] font-medium rounded-md flex items-center justify-center px-6 py-3 text-base transition-colors duration-200 w-full"
            >
              Criar Conta
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-[#1a212b]/80 rounded-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <div className="text-3xl font-bold text-[#84e100]">{stat.value}</div>
                <div className="text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              title: "Pessoa Física",
              description: "Para indivíduos que desejam contribuir ou precisam de apoio",
              icon: Users,
              items: [
                "Faça doações de forma segura",
                "Acompanhe o impacto de suas contribuições",
                "Solicite apoio quando necessário",
                "Conecte-se com a comunidade",
              ],
              itemIcon: Gift,
            },
            {
              title: "Pessoa Jurídica",
              description: "Para empresas e organizações comprometidas com a mudança",
              icon: Building2,
              items: [
                "Gerencie doações em larga escala",
                "Acompanhe métricas de impacto",
                "Emita relatórios detalhados",
                "Integre-se com projetos sociais",
              ],
              itemIcon: HandHeart,
            },
            {
              title: "Alunos",
              description: "Para estudantes engajados em projetos sociais",
              icon: GraduationCap,
              items: [
                "Acesse recursos exclusivos",
                "Participe de projetos sociais",
                "Acompanhe seu progresso",
                "Conecte-se com mentores",
              ],
              itemIcon: Heart,
            },
          ].map((card, cardIndex) => (
            <Card
              key={card.title}
              className="bg-[#1a212b]/80 border-gray-800 hover:border-[#84e100]/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-[#2a3a1c] border border-[#84e100]/30 mb-2">
                  <card.icon className="h-6 w-6 text-[#84e100]" />
                </div>
                <CardTitle className="text-xl text-white">{card.title}</CardTitle>
                <CardDescription className="text-gray-400">{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <card.itemIcon className="h-4 w-4 text-[#84e100]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

