"use client"

import { useState } from "react"
import Image from "next/image"
import { useConfiguracion } from "@/hooks/use-configuracion"
import { useZonas } from "@/hooks/use-zonas"
import ZonaSelectorDialog from "./ZonaSelectorDialog"

export default function WhatsAppFloatingButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { telefono, loading: configLoading, error: configError } = useConfiguracion()
  const { zonas, configuracionZonas, loading: zonasLoading } = useZonas()
  
  // Función para generar el mensaje de WhatsApp general
  const generateGeneralWhatsAppMessage = (): string => {
    return `Hola! 👋 Me gustaría conocer más sobre los productos que tienen disponibles. ¿Podrían ayudarme?`
  }

  const handleClick = () => {
    // Verificar si hay zonas configuradas
    const zonasConTelefono = zonas.filter(zona => 
      configuracionZonas.some(config => config.fk_id_zona === zona.id)
    )

    if (zonasConTelefono.length > 0) {
      // Si hay zonas configuradas, abrir el diálogo de selección
      setIsDialogOpen(true)
    } else {
      // Si no hay zonas configuradas, usar el teléfono por defecto
      const phoneNumber = telefono || "5491123365608"
      const message = generateGeneralWhatsAppMessage()
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      
      // Detectar si es móvil para usar el método correcto
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // En móviles, usar window.location.href para abrir la app directamente
        window.location.href = whatsappUrl
      } else {
        // En desktop, usar window.open
        window.open(whatsappUrl, '_blank')
      }
    }
  }

  // Si está cargando, no mostrar el botón
  if (configLoading || zonasLoading) {
    return null
  }

  // Si hay error en la configuración, mostrar el botón con el número por defecto
  if (configError) {
    console.warn('Error al cargar configuración, usando número por defecto:', configError)
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleClick}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title="Chatea con nosotros"
        >
          <Image 
            src="/WhatsApp.svg.webp" 
            alt="WhatsApp" 
            width={40} 
            height={40} 
            className={`transition-all duration-300 ${isHovered ? "animate-pulse" : ""}`} 
          />
          
          {/* Efecto de ondas */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></div>
        </button>
      </div>

      <ZonaSelectorDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={null} // No hay producto específico para el botón flotante
      />
    </>
  )
}