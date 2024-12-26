'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type Product = {
  id: number
  Name: string
  Price: string
  ImageURL: string
}

type OrderItem = {
  product: Product
  quantity: number
}

export function CreateOrder() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState('')

  // Пример списка продуктов (в реальном приложении это будет загружаться с сервера)
  const products: Product[] = [
    { id: 1, Name: "Свеча 1", Price: "100", ImageURL: "/images/candle1.jpg" },
    { id: 2, Name: "Свеча 2", Price: "200", ImageURL: "/images/candle2.jpg" },
    { id: 3, Name: "Свеча 3", Price: "150", ImageURL: "/images/candle3.jpg" },
  ]

  const filteredProducts = products.filter(product => 
    product.Name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id)
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }])
    }
  }

  const removeFromOrder = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.product.id !== productId))
  }

  const createOrder = () => {
    // Здесь будет логика создания заказа
    console.log('Создан заказ:', { customerName, items: orderItems })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Выбор товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map(product => (
                <Card key={product.id} className="p-2">
                  <img src={`http://localhost:9000${product.ImageURL}`} alt={product.Name} className="w-full h-24 object-cover mb-2" />
                  <p className="font-semibold">{product.Name}</p>
                  <p className="text-sm text-gray-600">{product.Price} ₽</p>
                  <Button onClick={() => addToOrder(product)} className="mt-2 w-full">Добавить</Button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Заказ</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="customerName">Имя клиента</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] mb-4">
            {orderItems.map(item => (
              <div key={item.product.id} className="flex justify-between items-center mb-2">
                <span>{item.product.Name} x {item.quantity}</span>
                <Button variant="destructive" size="sm" onClick={() => removeFromOrder(item.product.id)}>Удалить</Button>
              </div>
            ))}
          </ScrollArea>
          <Button onClick={createOrder} className="w-full">Создать заказ</Button>
        </CardContent>
      </Card>
    </div>
  )
}

