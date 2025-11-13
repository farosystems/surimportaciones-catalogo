"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { use } from "react"
import { Package } from "lucide-react"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import { getProductsByLinea, getLineas } from "@/lib/supabase-products"
import { Product, Linea } from "@/lib/products"

interface LineaPageProps {
  params: Promise<{
    linea: string
  }>
}

export default function LineaPage({ params }: LineaPageProps) {
  const resolvedParams = use(params)
  const [products, setProducts] = useState<Product[]>([])
  const [lineas, setLineas] = useState<Linea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animateProducts, setAnimateProducts] = useState(false)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Cargar líneas
  useEffect(() => {
    const loadLineas = async () => {
      try {
        const lineasData = await getLineas()
        setLineas(lineasData)
      } catch (err) {
        console.error('Error loading lineas:', err)
        setError('Error al cargar las líneas')
      }
    }
    loadLineas()
  }, [])

  // Encontrar la línea por slug
  const linea = useMemo(() => {
    return lineas.find(lin => {
      const slug = lin.descripcion?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      return slug === resolvedParams.linea
    })
  }, [lineas, resolvedParams.linea])

  // Cargar productos de la línea
  useEffect(() => {
    const loadProducts = async () => {
      if (!linea) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const productsData = await getProductsByLinea(linea.id)
        setProducts(productsData)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }

    if (linea) {
      loadProducts()
    }
  }, [linea])

  // Resetear animación cuando cambien los productos
  useEffect(() => {
    setAnimateProducts(true)
    setVisibleItems(new Set())
    const timer = setTimeout(() => setAnimateProducts(false), 100)
    return () => clearTimeout(timer)
  }, [products])

  // Intersection Observer para animaciones al hacer scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Observar elementos cuando cambien los productos
  useEffect(() => {
    const elements = document.querySelectorAll('[data-index]')
    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el)
      }
    })

    return () => {
      elements.forEach((el) => {
        if (observerRef.current) {
          observerRef.current.unobserve(el)
        }
      })
    }
  }, [products])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Cargando productos...</h2>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar productos</h2>
            <p className="text-xl text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!linea) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '140px' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Línea no encontrada</h2>
            <p className="text-xl text-gray-600">La línea "{resolvedParams.linea}" no existe</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <GlobalAppBar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4" style={{ marginTop: '40px' }}>
        {/* Header de la página */}
        <div className="mb-6">
          <div className="text-center w-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-emerald-600 bg-clip-text text-transparent">
              {linea.descripcion}
            </h1>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="mb-8">
          <div className="text-center w-full">
            <p className="text-gray-600 mb-4">
              {products.length} productos en {linea.descripcion}
            </p>
          </div>
        </div>

        {/* Grid de Productos */}
        <div id="productos-grid" className="mb-12">
          {products.length > 0 ? (
            <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 p-4 transition-all duration-300 ${
              animateProducts ? 'opacity-50' : 'opacity-100'
            }`}>
              {products.map((product, index) => (
                <div
                  key={product.id}
                  data-index={index}
                  className={`transition-all duration-700 ${
                    visibleItems.has(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay productos disponibles
              </h3>
              <p className="text-gray-500 mb-6">
                No hay productos disponibles en {linea.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
