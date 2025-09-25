import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('🔍 Image Proxy - URL solicitada:', imageUrl)

    if (!imageUrl) {
      console.log('❌ Image Proxy - No URL parameter')
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Solo permitir URLs de Supabase para seguridad
    if (!imageUrl.includes('supabase.co')) {
      console.log('❌ Image Proxy - Invalid URL (not Supabase)')
      return new NextResponse('Invalid URL', { status: 400 })
    }

    console.log('📥 Image Proxy - Fetching from Supabase...')

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    })

    console.log('📤 Image Proxy - Supabase response status:', response.status)

    if (!response.ok) {
      console.log('❌ Image Proxy - Supabase error:', response.statusText)
      return new NextResponse('Image not found', { status: 404 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await response.arrayBuffer()

    console.log('✅ Image Proxy - Success, content type:', contentType, 'size:', imageBuffer.byteLength)

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('💥 Image Proxy - Error:', error)
    return new NextResponse('Error fetching image', { status: 500 })
  }
}