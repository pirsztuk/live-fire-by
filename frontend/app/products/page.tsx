'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'

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
        const response = await fetch('http://localhost:8000/api/v1/products/get_products/', {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MzYwNjIzNTYsInR5cGUiOiJhY2Nlc3MifQ.JEdYMQGrBI_EzaVJUMd2sCcFuxbuj-xFFto1JO7qC1Q'
          }
        })
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
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="relative h-48 mb-4">
                <Image
                  src={`http://localhost:9000${product.ImageURL}`}
                  alt={product.Name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{product.Name}</h2>
              <p className="text-gray-600 mb-2">Price: ${product.Price}</p>
              <p className="text-gray-600">In Stock: {product.InStock}</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">{product.Description}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

