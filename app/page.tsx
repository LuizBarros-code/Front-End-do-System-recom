'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { GraduationCap, Users, Building2, ArrowRight, Heart, Gift, HandHeart } from 'lucide-react'
import Link from "next/link"


const stats = [
  { value: '500+', label: 'Doações Realizadas' },
  { value: '1000+', label: 'Pessoas Impactadas' },
  { value: '50+', label: 'Parceiros' },
]

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(0,0,0,0))]" />
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-xl"
            style={{
              width: Math.random() * 400 + 100,
              height: Math.random() * 400 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Heart className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Faça a diferença hoje</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Sistema de Doações
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-8">
            Conectando pessoas e transformando vidas através da tecnologia e solidariedade
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Link href="/login" className="text-lg px-8">
                Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-slate-300 border-slate-700 hover:bg-slate-800/50">
              <Link href="/register" className="text-lg px-8">Criar Conta</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  {stat.value}
                </div>
                <div className="text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cards Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="group relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50 hover:border-indigo-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-2">
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
              <CardTitle className="text-xl text-slate-200">Pessoa Física</CardTitle>
              <CardDescription className="text-slate-400">
                Para indivíduos que desejam contribuir ou precisam de apoio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Faça doações de forma segura',
                  'Acompanhe o impacto de suas contribuições',
                  'Solicite apoio quando necessário',
                  'Conecte-se com a comunidade'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2 text-slate-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Gift className="h-4 w-4 text-indigo-400" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="group relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-2">
                <Building2 className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-xl text-slate-200">Pessoa Jurídica</CardTitle>
              <CardDescription className="text-slate-400">
                Para empresas e organizações comprometidas com a mudança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Gerencie doações em larga escala',
                  'Acompanhe métricas de impacto',
                  'Emita relatórios detalhados',
                  'Integre-se com projetos sociais'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2 text-slate-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <HandHeart className="h-4 w-4 text-purple-400" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="group relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-slate-800/50 hover:border-green-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-2">
                <GraduationCap className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-xl text-slate-200">Alunos</CardTitle>
              <CardDescription className="text-slate-400">
                Para estudantes engajados em projetos sociais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Acesse recursos exclusivos',
                  'Participe de projetos sociais',
                  'Acompanhe seu progresso',
                  'Conecte-se com mentores'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2 text-slate-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Heart className="h-4 w-4 text-green-400" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}

