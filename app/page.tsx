"use client"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { PartnersCarousel } from "@/components/PartnersCarousel"

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
            <span className="text-sm font-medium text-[#84e100]">Transformando vidas através da tecnologia</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 text-[#84e100]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            RECOM
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-2xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Projeto de recondicionamento de computadores para doação a pessoas e entidades sem fins lucrativos
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
        </div>

        {/* Partners Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">Nossos Parceiros</h2>
          <PartnersCarousel />
        </motion.div>
      </div>
    </main>
  )
}

