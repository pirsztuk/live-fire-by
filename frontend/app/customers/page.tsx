'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from 'lucide-react'

// Примерные данные о клиентах (в реальном приложении эти данные будут загружаться с сервера)
const customersData = [
  { id: 1, name: "Анна Иванова", orderCount: 5, totalPurchases: 15000 },
  { id: 2, name: "Петр Сидоров", orderCount: 3, totalPurchases: 8000 },
  { id: 3, name: "Елена Петрова", orderCount: 7, totalPurchases: 22000 },
  { id: 4, name: "Алексей Смирнов", orderCount: 2, totalPurchases: 5000 },
  { id: 5, name: "Ольга Козлова", orderCount: 4, totalPurchases: 12000 },
]

export default function CustomersPage() {
  const [customers] = useState(customersData)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Клиенты</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">Количество заказов: {customer.orderCount}</p>
              <p className="text-sm text-gray-600 mb-4">Сумма покупок: {customer.totalPurchases} ₽</p>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Подробнее
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

