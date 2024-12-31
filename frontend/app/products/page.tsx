'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { authenticatedFetch } from "@/utils/api"

interface Product {
  id: number
  Name: string
  Price: string
  Costs: string
  Description: string
  ImageURL: string
  InStock: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await authenticatedFetch('/api/v1/products/get_products/')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data.data.products)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Product
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="relative aspect-square mb-4">
                  <Image
                    src={`http://localhost:9000${product.ImageURL}`}
                    alt={product.Name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">{product.Name}</h2>
                <p className="text-green-600 font-bold mb-2">{product.Price} <span className="text-sm font-normal">BYN</span></p>
                <p className="text-gray-600 font-bold">{product.InStock} <span className="text-sm font-normal">шт.</span></p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">{product.Description}</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

