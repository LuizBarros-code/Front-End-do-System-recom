"use client"

import React from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'

// Sample partners data - replace with your actual partners
const partners = [
  {
    id: 1,
    name: "FACAPE",
    logo: "/image/logo.png"
  },
  {
    id: 2,
    name: "FACAPE",
    logo: "/image/logo.png"
  },
  {
    id: 3,
    name: "FACAPE",
    logo: "/image/logo.png"
  },
  {
    id: 4,
    name: "FACAPE",
    logo: "/image/logo.png"
  },
  {
    id: 5,
    name: "FACAPE",
    logo: "/image/logo.png"
  }
]

// Duplicar os slides para garantir loop visual
const allPartners = [...partners, ...partners]

export function PartnersCarousel() {
  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <Swiper
        spaceBetween={60}
        slidesPerView={5}
        loop={true}
        autoplay={{
          delay: 1,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        speed={4000}
        allowTouchMove={false}
        cssMode={false}
        style={{ pointerEvents: 'none' }}
      >
        {allPartners.map((partner, idx) => (
          <SwiperSlide key={partner.id + '-' + idx}>
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 relative mb-3">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-white/70 text-sm text-center">{partner.name}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
} 