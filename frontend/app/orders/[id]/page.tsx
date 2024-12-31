'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { authenticatedFetch } from "@/utils/api"
import { withAuth } from "@/components/withAuth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface OrderItem {
  id: number
  Product: {
    id: number | null
    Name: string
    Price: string | null
    ImageURL?: string
  } | null
  Quantity: number
  Price: string
}

interface Customer {
  id: number
  Name: string
  Email: string
  Phone: string
  Address: string
}

interface Order {
  id: number
  OrderItems: OrderItem[]
  Customer: Customer
  OrderDate: string
  DueDate: string
  OrderStatus: string
  OrderTotal: string
}

const orderStatuses = [
  { value: 'in_progress', label: 'В обработке' },
  { value: 'packed', label: 'Упакован' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Удален' },
]

function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (id === 'new') {
      setLoading(false)
      return
    }
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      const response = await authenticatedFetch(`/api/v1/orders/get_order/?order_id=${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.status === 'success') {
        setOrder(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (order && order.OrderStatus === 'cancelled') {
      toast({
        title: "Ошибка",
        description: "Нельзя изменить статус удаленного заказа",
        variant: "destructive",
      })
      return
    }

    setUpdatingStatus(true)
    try {
      const response = await authenticatedFetch('/api/v1/orders/update_order/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: id,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setOrder(prevOrder => prevOrder ? { ...prevOrder, OrderStatus: newStatus } : null)
        toast({
          title: "Статус заказа обновлен",
          description: "Статус заказа успешно изменен.",
        })
      } else {
        throw new Error(data.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось обновить статус заказа',
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDeleteOrder = async () => {
    try {
      const response = await authenticatedFetch(`/api/v1/orders/delete_order/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete order')
      }

      router.push('/orders')
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось удалить заказ',
        variant: "destructive",
      })
    }
  }

  if (id === 'new') {
    router.push('/orders/new')
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!order) {
    return <div>No order data available</div>
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="outline" onClick={() => router.push('/orders')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку заказов
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Информация о заказе #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Дата создания:</strong> {format(new Date(order.OrderDate), 'dd.MM.yyyy HH:mm')}</p>
          <p><strong>Дата готовности:</strong> {format(new Date(order.DueDate), 'dd.MM.yyyy')}</p>
          <div className="flex items-center space-x-2">
            <strong>Статус:</strong>
            <Select
              value={order.OrderStatus}
              onValueChange={updateOrderStatus}
              disabled={updatingStatus || order.OrderStatus === 'cancelled'}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p><strong>Сумма заказа:</strong> {parseFloat(order.OrderTotal).toFixed(2)} BYN</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Товары в заказе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.OrderItems.map((item) => (
              <Card key={item.id} className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 ${
                item.Product && item.Product.id !== null ? "hover:cursor-pointer" : "hover:cursor-not-allowed"
              }`}>
                <CardContent className="p-4">
                  <div className="relative aspect-square mb-4">
                    {item.Product && item.Product.id !== null ? (
                      <Image
                        src={`http://localhost:9000${item.Product.ImageURL}`}
                        alt={item.Product.Name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        onClick={() => router.push(`/products/${item.Product.id}?from=order&orderId=${order.id}`)}
                      />
                    ) : (
                      <Image
                        src="https://i.imgur.com/cEUuKgq_d.webp?maxwidth=760&fidelity=grand"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    )}
                  </div>
                  {item.Product && item.Product.id !== null ? (
                    <>
                      <h3 className="font-semibold mb-2">{item.Product.Name}</h3>
                      <p>Количество: {item.Quantity}</p>
                      <p>Цена: {parseFloat(item.Price).toFixed(2)} BYN</p>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <h3 className="font-semibold mb-2">Товар удален</h3>
                      <p>Количество: {item.Quantity}</p>
                      <p>Цена: {parseFloat(item.Price).toFixed(2)} BYN</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация о заказчике</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Имя:</strong> {order.Customer.Name}</p>
          <p><strong>Email:</strong> {order.Customer.Email || 'Не указан'}</p>
          <p><strong>Телефон:</strong> {order.Customer.Phone || 'Не указан'}</p>
          <p><strong>Адрес:</strong> {order.Customer.Address || 'Не указан'}</p>
        </CardContent>
      </Card>
      <Button 
        variant="outline" 
        className="border-red-500 text-red-500 hover:bg-red-100"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        Удалить заказ
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(OrderDetailPage)

