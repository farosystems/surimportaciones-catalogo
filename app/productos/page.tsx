"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Package } from "lucide-react"
import GlobalAppBar from "@/components/GlobalAppBar"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import Pagination from "@/components/Pagination"
import { useProducts } from "@/hooks/use-products"
import { Categoria } from "@/lib/products"

const PRODUCTS_PER_PAGE = 6

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [showSidebar, setShowSidebar] = useState(false)
  const [animateProducts, setAnimateProducts] = useState(false)

  const { 
    products, 
    categories, 
    loading, 
    error, 
    filterByCategory, 
    clearFilters 
  } = useProducts()

  // Filtrar productos localmente
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.descripcion || product.name || ''
      const productDescription = product.descripcion_detallada || product.description || ''

      const matchesSearch =
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productDescription.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [products, searchTerm])

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
    setAnimateProducts(true)
    const timer = setTimeout(() => setAnimateProducts(false), 100)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  const handleCategoryChange = async (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    await filterByCategory(categoryId)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory(null)
    setCurrentPage(1)
    clearFilters()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setAnimateProducts(true)
    const timer = setTimeout(() => setAnimateProducts(false), 100)

    // Scroll suave al inicio de los productos
    document.getElementById("productos-grid")?.scrollIntoView({ behavior: "smooth" })

    return () => clearTimeout(timer)
  }

  if (loading) {
    return (
      <>
        <div className="bg-gradient-to-br from-gray-50 to-blue-50">
          <GlobalAppBar />
          
          <div className="flex">
            {/* Sidebar */}
            <div className={`fixed left-0 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            } lg:sticky lg:translate-x-0 lg:block lg:flex-shrink-0 lg:self-start w-80`} 
            style={{ top: '140px' }}>
              <div className="flex flex-col max-h-screen">
                {/* Header del Sidebar */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-violet-600 to-violet-700 flex-shrink-0">
                  <h2 className="text-lg font-bold text-white">Filtros</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-2 text-white hover:text-violet-200 hover:bg-violet-800/30 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Contenido del Sidebar - Loading */}
                <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay para móviles */}
            {showSidebar && (
              <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Contenido Principal - Loading */}
            <div className="flex-1 lg:ml-0">
              <div style={{ marginTop: '80px' }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4">
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
                      <h2 className="text-2xl font-bold text-gray-900">Cargando productos...</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50">
        <GlobalAppBar />
        <div className="flex items-center justify-center py-20">
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
    <>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50">
        <GlobalAppBar />
        
        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed left-0 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } lg:sticky lg:translate-x-0 lg:block lg:flex-shrink-0 lg:self-start w-80`} 
          style={{ top: '140px' }}>
            <div className="flex flex-col max-h-screen">
              {/* Header del Sidebar */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-violet-600 to-violet-700 flex-shrink-0">
                <h2 className="text-lg font-bold text-white">Filtros</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-2 text-white hover:text-violet-200 hover:bg-violet-800/30 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido del Sidebar */}
              <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* Filtro por Categorías */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Categorías
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => handleCategoryChange(null)}
                      className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-600 transition-colors">
                      Todas las categorías
                    </span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-violet-600 transition-colors">
                        {category.descripcion}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botón para limpiar filtros */}
              {(searchTerm || selectedCategory) && (
                <div className="mb-6">
                  <button
                    onClick={handleClearFilters}
                    className="w-full py-3 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
                          </div>
            </div>
          </div>

          {/* Overlay para móviles */}
          {showSidebar && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Contenido Principal */}
          <div className="flex-1 lg:ml-0">
            <div style={{ marginTop: '30px' }}>
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-4">
            {/* Buscador Flotante */}
            <div className="mb-6">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 text-lg placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Header de la página */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center w-full">
                  <h1 className="text-4xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Catálogo de Productos
                  </h1>
                  <p className="text-gray-600">
                    Encontrá todos nuestros productos con los mejores planes de financiación
                  </p>
                </div>
                
                {/* Botón para abrir sidebar en móviles */}
                <div className="lg:hidden flex justify-center mt-4">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors shadow-lg"
                  >
                    <SlidersHorizontal size={20} />
                    Filtros
                  </button>
                </div>
              </div>

              {/* Información de resultados */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length} productos
                </span>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            </div>

            {/* Grid de Productos */}
            <div id="productos-grid" className="mb-12">
              {filteredProducts.length > 0 ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300 ${
                  animateProducts ? 'opacity-50' : 'opacity-100'
                }`}>
                  {paginatedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Intenta cambiar los filtros o el término de búsqueda
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
