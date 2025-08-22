import HeroSection from "@/components/HeroSection"
import FeaturedSection from "@/components/FeaturedSection"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <GlobalAppBar />
      
      <main>
        <HeroSection />
        <FeaturedSection />
        
        {/* Sección Call to Action para ver todos los productos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Buscás algo específico?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Explorá nuestro catálogo completo con más de 200 productos
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Ver Catálogo Completo
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
