'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { authenticatedFetch } from "@/utils/api"

interface Order {
  id: number
  CustomerName: string
  DueDate: string
  OrderStatus: string
  OrderTotal: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [filterType])

  const fetchOrders = async () => {
    try {
      const response = await authenticatedFetch(`/api/v1/orders/get_orders/?type=${filterType}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'cancelled':
        return 'text-red-600'
      case 'packed':
        return 'text-blue-600'
      default:
        return 'text-yellow-600'
    }
  }

  const getDaysUntilDueColor = (daysUntilDue: number) => {
    if (daysUntilDue >= 3) return 'text-green-600'
    if (daysUntilDue === 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Заказы</h1>
        <div className="flex items-center space-x-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр заказов" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все заказы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="packed">Упакованные</SelectItem>
              <SelectItem value="completed">Завершенные</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/orders/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Новый заказ
            </Button>
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg text-gray-600">
              {filterType === 'all' 
                ? 'Нет доступных заказов.' 
                : `Нет заказов со статусом "${filterType}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <CardHeader>
                <CardTitle>Заказ #{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Клиент: {order.CustomerName}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Дата готовности: {format(new Date(order.DueDate), 'dd.MM.yyyy')}
                </p>
                <p className={`text-sm font-semibold ${getStatusColor(order.OrderStatus)} mb-2`}>
                  Статус: {order.OrderStatus}
                </p>
                {order.OrderStatus !== 'completed' && order.OrderStatus !== 'cancelled' && (
                  <p className={`text-sm font-semibold ${getDaysUntilDueColor(differenceInDays(new Date(order.DueDate), new Date()))} mb-2`}>
                    Дней до готовности: {Math.max(0, differenceInDays(new Date(order.DueDate), new Date()))}
                  </p>
                )}
                <p className="text-lg font-bold">
                  Сумма: {parseFloat(order.OrderTotal).toFixed(2)} BYN
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

