"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Product } from "@/lib/products"
import FinancingPlans from "./FinancingPlans"
import { useShoppingList } from "@/hooks/use-shopping-list"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInList } = useShoppingList()
  const productCategory = product.categoria?.descripcion || product.category || 'Sin categoría'
  const productBrand = product.marca?.descripcion || product.brand || 'Sin marca'
  const productPrice = product.precio || product.price || 0

  const productUrl = product.categoria && product.categoria.descripcion && 
    !product.categoria.descripcion.toLowerCase().includes('categor') &&
    product.categoria.descripcion.trim() !== '' ? 
    `/${productCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/${product.id}` :
    `/varios/${product.id}`

  const isInFavorites = isInList(product.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  return (
    <Link href={productUrl} className="block">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.imagen || product.image || '/placeholder.jpg'}
            alt={product.descripcion || product.name || 'Producto'}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Icono de Favoritos - Esquina superior izquierda */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 left-2 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 ${
              isInFavorites 
                ? 'bg-violet-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-violet-500'
            }`}
            title={isInFavorites ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isInFavorites ? 'fill-current' : ''
              }`} 
            />
          </button>

          {/* Badge Destacado - Esquina superior derecha */}
          {product.destacado && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
              Destacado
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-3 sm:p-4">
          {/* Marca */}
          <div className="flex gap-1 sm:gap-2 mb-2 flex-wrap">
            <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 rounded-full truncate font-semibold shadow-sm">
              {productBrand}
            </span>
          </div>

          {/* Título del producto */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
            {product.descripcion || product.name || 'Sin descripción'}
          </h3>

          {/* Planes de Financiación - Versión simplificada */}
          <FinancingPlans productoId={product.id} precio={productPrice} />
        </div>
      </div>
    </Link>
  )
}
