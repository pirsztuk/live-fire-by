'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Image from 'next/image'

interface Product {
  id: number
  Name: string
  Price: string
  ImageURL: string
  InStock: number
}

interface SelectedProduct extends Product {
  quantity: number
}

interface Customer {
  id: number
  name: string
}

// Пример данных клиентов (в реальном приложении будут загружаться с сервера)
const sampleCustomers: Customer[] = [
  { id: 1, name: "Анна Иванова" },
  { id: 2, name: "Петр Сидоров" },
  { id: 3, name: "Елена Петрова" },
]

export default function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [customerType, setCustomerType] = useState('existing')
  const [customerSearch, setCustomerSearch] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState<Date>()

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

  const filteredProducts = products.filter(product =>
    product.Name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCustomers = sampleCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const addProduct = (product: Product) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === product.id)
      if (existing) {
        return prev.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Заказы</h1>
      <h2 className="text-2xl font-bold">Новый заказ</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Product Selection */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-xl font-bold mb-4">Выбор товаров</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск товаров"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border bg-white rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <Image
                        src={`http://localhost:9000${product.ImageURL}`}
                        alt={product.Name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <span className="font-medium">{product.Name}</span>
                  </div>
                  <Button
                    onClick={() => addProduct(product)}
                    variant="default"
                  >
                    Добавить
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column - Selected Products */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-xl font-bold mb-4">Выбранные товары</h3>
            
            <ScrollArea className="h-[60vh] pr-4">
              {selectedProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Товары не выбраны
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={`http://localhost:9000${product.ImageURL}`}
                            alt={product.Name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.Name}</div>
                          <div className="text-sm text-gray-500">
                            Количество: {product.quantity}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeProduct(product.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Customer Selection */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-xl font-bold mb-4">Клиент</h3>
            
            <RadioGroup
              defaultValue="existing"
              onValueChange={(value) => {
                setCustomerType(value)
                setSelectedCustomerId(null)
                setNewCustomerName('')
              }}
              className="mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing">Существующий клиент</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Новый клиент</Label>
              </div>
            </RadioGroup>

            {customerType === 'existing' ? (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Поиск клиента"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <ScrollArea className="h-32 border rounded-md bg-white p-2">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className={cn(
                        "p-2 rounded-md cursor-pointer",
                        selectedCustomerId === customer.id ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                      )}
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      {customer.name}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            ) : (
              <Input
                type="text"
                placeholder="Имя нового клиента"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
            )}
          </div>

          {/* Due Date Selection */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-xl font-bold mb-4">Дата готовности</h3>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button className="w-full" size="lg">
            Создать заказ
          </Button>
        </div>
      </div>
    </div>
  )
}

