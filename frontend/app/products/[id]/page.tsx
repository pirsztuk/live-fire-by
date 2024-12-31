'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from 'next/image'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { authenticatedFetch } from "@/utils/api"
import CreateProductPage from '../create/page'

interface Product {
  id: number
  Name: string
  Price: string
  Costs: string
  Description: string
  ImageURL: string
  InStock: number
}

interface SalesData {
  month: string
  sales: number
}

interface PurchaseLog {
  id: number
  date: string
  quantity: number
  totalPrice: number
}

const salesData: SalesData[] = [
  { month: 'Jan', sales: 65 },
  { month: 'Feb', sales: 59 },
  { month: 'Mar', sales: 80 },
  { month: 'Apr', sales: 81 },
  { month: 'May', sales: 56 },
  { month: 'Jun', sales: 55 },
  { month: 'Jul', sales: 40 },
]

const purchaseLogs: PurchaseLog[] = [
  { id: 1, date: '2023-07-15', quantity: 2, totalPrice: 940 },
  { id: 2, date: '2023-07-10', quantity: 1, totalPrice: 470 },
  { id: 3, date: '2023-07-05', quantity: 3, totalPrice: 1410 },
  { id: 4, date: '2023-06-30', quantity: 1, totalPrice: 470 },
  { id: 5, date: '2023-06-25', quantity: 2, totalPrice: 940 },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOrder = searchParams.get('from') === 'order'
  const orderId = searchParams.get('orderId')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      if (id === 'create') {
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch(`/api/v1/products/get_product/?product_id=${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        setProduct(data.data.product)
        setEditedProduct(data.data.product)
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleEdit = async () => {
    if (!product) return

    const formData = new FormData()
    formData.append('product_id', product.id.toString())

    Object.keys(editedProduct).forEach(key => {
      if (editedProduct[key as keyof Product] !== product[key as keyof Product]) {
        formData.append(key, editedProduct[key as keyof Product]?.toString() || '')
      }
    })

    try {
      const response = await authenticatedFetch('/api/v1/products/update_product/', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      // Обновляем локальное состояние продукта
      setProduct(editedProduct as Product)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating product:', error)
      setError('Failed to update product')
    }
  }

  const handleDelete = async () => {
    if (!product) return

    try {
      const response = await authenticatedFetch(`/api/v1/products/delete_product/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: product.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      router.push('/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      setError('Failed to delete product')
    }
  }

  if (id === 'create') {
    return <CreateProductPage />
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-6">
        {/*Removed Error Block*/}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => fromOrder ? router.push(`/orders/${orderId}`) : router.push('/products')} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <div>
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)} className="mr-2">
                Редактировать
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="mr-2 h-4 w-4" /> Удалить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Вы уверены, что хотите удалить этот товар?</DialogTitle>
                    <DialogDescription>
                      Это действие нельзя отменить. Товар будет навсегда удален из системы.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Отмена</Button>
                    <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {isEditing && (
            <>
              <Button onClick={handleEdit} className="mr-2">Сохранить</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Отмена</Button>
            </>
          )}
        </div>
      </div>
      
      <h1 className="text-3xl font-bold">{product.Name}</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-square">
              <Image
                src={`http://localhost:9000${product.ImageURL}`}
                alt={product.Name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div>
              {isEditing ? (
                <>
                  <Input
                    value={editedProduct.Name}
                    onChange={(e) => setEditedProduct({...editedProduct, Name: e.target.value})}
                    className="mb-2"
                  />
                  <Input
                    value={editedProduct.Price}
                    onChange={(e) => setEditedProduct({...editedProduct, Price: e.target.value})}
                    className="mb-2"
                  />
                  <Input
                    value={editedProduct.Costs}
                    onChange={(e) => setEditedProduct({...editedProduct, Costs: e.target.value})}
                    className="mb-2"
                  />
                  <Input
                    value={editedProduct.InStock}
                    onChange={(e) => setEditedProduct({...editedProduct, InStock: Number(e.target.value)})}
                    className="mb-2"
                    type="number"
                  />
                  <Textarea
                    value={editedProduct.Description}
                    onChange={(e) => setEditedProduct({...editedProduct, Description: e.target.value})}
                    className="mb-2"
                  />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold mb-2 text-green-600">{editedProduct.Price} <span className="text-sm font-normal">BYN</span></p>
                  <p className="text-xl font-bold mb-4">{editedProduct.InStock} <span className="text-sm font-normal">шт.</span></p>
                  <p className="text-gray-600 mb-2">Себестоимость: {editedProduct.Costs} BYN</p>
                  <p className="text-gray-700">{editedProduct.Description}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>График продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История покупок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Дата</th>
                  <th className="text-left p-2">Количество</th>
                  <th className="text-left p-2">Общая стоимость</th>
                </tr>
              </thead>
              <tbody>
                {purchaseLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-2">{log.date}</td>
                    <td className="p-2">{log.quantity}</td>
                    <td className="p-2">{log.totalPrice.toFixed(2)} BYN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

