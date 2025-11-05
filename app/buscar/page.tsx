"use client"

import { useState, useEffect, useMemo, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Package } from "lucide-react"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import ComboCard from "@/components/ComboCard"
import { useProducts } from "@/hooks/use-products"
import { searchCombos } from "@/lib/supabase-products"

function BuscarPageContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [animateProducts, setAnimateProducts] = useState(false)
  const [combos, setCombos] = useState<any[]>([])
  const [combosLoading, setCombosLoading] = useState(false)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  const {
    products,
    loading,
    error
  } = useProducts()

  // Obtener parámetros de la URL
  useEffect(() => {
    const searchParam = searchParams.get('q')
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [searchParams])

  // Cargar combos cuando cambie el término de búsqueda
  useEffect(() => {
    const loadCombos = async () => {
      if (!searchTerm.trim()) {
        setCombos([])
        setCombosLoading(false)
        return
      }

      try {
        setCombosLoading(true)
        const combosResults = await searchCombos(searchTerm)
        setCombos(combosResults)
      } catch (error) {
        console.error('Error loading combos:', error)
        setCombos([])
      } finally {
        setCombosLoading(false)
      }
    }

    loadCombos()
  }, [searchTerm])

  // Filtrar productos por búsqueda global
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return []
    
    return products.filter((product) => {
      const productName = product.descripcion || ''
      const productDescription = product.descripcion_detallada || ''
      const categoryName = product.categoria?.descripcion || ''
      const brandName = product.marca?.descripcion || ''
      const searchLower = searchTerm.toLowerCase()

      return productName.toLowerCase().includes(searchLower) ||
             productDescription.toLowerCase().includes(searchLower) ||
             categoryName.toLowerCase().includes(searchLower) ||
             brandName.toLowerCase().includes(searchLower)
    })
  }, [products, searchTerm])

  // Combinar productos y combos para mostrar juntos
  const allItems = useMemo(() => {
    // Combinar productos y combos, ordenando por tipo (combos primero) y luego por relevancia
    const items = [
      ...combos.map(combo => ({ ...combo, type: 'combo' })),
      ...filteredProducts.map(product => ({ ...product, type: 'product' }))
    ]
    return items
  }, [combos, filteredProducts])

  // Resetear animación cuando cambien los filtros
  useEffect(() => {
    setAnimateProducts(true)
    setVisibleItems(new Set())
    const timer = setTimeout(() => setAnimateProducts(false), 100)
    return () => clearTimeout(timer)
  }, [searchTerm, allItems])

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

  // Observar elementos cuando cambien los items
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
  }, [allItems])

  const handleClearFilters = () => {
    setSearchTerm("")
    // Actualizar URL
    window.history.replaceState({}, '', '/buscar')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Actualizar URL con el término de búsqueda
    const url = new URL(window.location.href)
    if (value.trim()) {
      url.searchParams.set('q', value)
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState({}, '', url.toString())
  }

  if (loading || combosLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '10px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Cargando productos y combos...</h2>
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

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <GlobalAppBar />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4" style={{ marginTop: '40px' }}>
        {/* Buscador principal - Solo visible cuando no hay búsqueda */}
        {!searchTerm && (
          <div className="mb-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Búsqueda de Productos
              </h1>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Buscar productos, combos, marcas, categorías..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-16 pr-4 py-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 text-xl placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}


        {/* Estado inicial sin búsqueda */}
        {!searchTerm && (
          <div className="text-center py-20">
            <Search size={80} className="mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              ¿Qué estás buscando?
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Utiliza el buscador para encontrar productos, marcas o categorías específicas
            </p>
          </div>
        )}

        {/* Información de búsqueda */}
        {searchTerm && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Resultados para: <span className="text-emerald-600">"{searchTerm}"</span>
              </h2>
              <p className="text-lg text-gray-600">
                {allItems.length === 0
                  ? "No se encontraron productos ni combos"
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto' : 'productos'}${combos.length > 0 ? ` y ${combos.length} ${combos.length === 1 ? 'combo' : 'combos'} encontrados` : ' encontrados'}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Grid de Productos y Combos */}
        {searchTerm && (
          <div id="productos-grid" className="mb-12">
            {allItems.length > 0 ? (
              <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 transition-all duration-300 ${
                animateProducts ? 'opacity-50' : 'opacity-100'
              }`}>
                {allItems.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    data-index={index}
                    className={`transition-all duration-700 ${
                      visibleItems.has(index)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {item.type === 'combo' ? (
                      <ComboCard combo={item} />
                    ) : (
                      <ProductCard product={item} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No se encontraron productos o combos
                </h3>
                <p className="text-gray-500 mb-6">
                  No hay productos o combos que coincidan con "{searchTerm}"
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Intenta con términos más generales o revisa la ortografía
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Nueva búsqueda
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20" style={{ marginTop: '10px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Cargando página de búsqueda...</h2>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <BuscarPageContent />
    </Suspense>
  )
}