'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { authenticatedFetch } from "@/utils/api"
import { withAuth } from "@/components/withAuth"

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
  Name: string
}

function NewOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerType, setCustomerType] = useState('existing')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [pinnedCustomerId, setPinnedCustomerId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

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
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await authenticatedFetch('/api/v1/customers/get_customers/')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customers')
    }
  }

  const filteredProducts = products.filter(product =>
    product.Name.toLowerCase().includes(productSearchTerm.toLowerCase())
  )

  const filteredCustomers = customers.filter(customer =>
    customer.Name.toLowerCase().includes(customerSearchTerm.toLowerCase())
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

  const updateProductQuantity = (productId: number, newQuantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: Math.max(1, newQuantity) }
          : p
      )
    )
  }

  const createCustomer = async () => {
    try {
      const formData = new FormData()
      formData.append('Name', newCustomerName)

      const response = await authenticatedFetch('/api/v1/customers/create_customer/', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      const data = await response.json()
      return data.data.customer_id
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  const selectCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setPinnedCustomerId(customerId);
  };

  const createOrder = async () => {
    try {
      let customerId = selectedCustomerId;

      if (customerType === 'new') {
        customerId = await createCustomer();
        setSelectedCustomerId(customerId);
        setPinnedCustomerId(customerId);
      }

      if (!customerId) {
        throw new Error('No customer selected')
      }

      if (!dueDate) {
        throw new Error('Due date is required')
      }

      const cartData = selectedProducts.reduce((acc, product) => {
        acc[product.id] = product.quantity
        return acc
      }, {} as Record<string, number>)

      const response = await authenticatedFetch('/api/v1/orders/create_order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cart_data: JSON.stringify(cartData),
          customer_id: customerId,
          due_date: format(dueDate, 'yyyy-MM-dd')
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create order')
      }

      const data = await response.json()
      router.push(`/orders/${data.data.order_id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while creating the order.')
    }
  }

  useEffect(() => {
    if (pinnedCustomerId) {
      const element = document.getElementById(`customer-${pinnedCustomerId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [pinnedCustomerId]);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Новый заказ</h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Product Selection - 60% */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-xl font-bold mb-4">Выбор товаров</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск товаров"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[50vh] pr-4">
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
                            width={48}
                            height={48}
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

            <div className="space-y-4">
              <h4 className="font-semibold">Выбранные товары</h4>
              <ScrollArea className="h-[50vh] pr-4">
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
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{product.Name}</div>
                            <div className="flex items-center mt-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                              >
                                -
                              </Button>
                              <Badge variant="secondary" className="mx-2 px-2 py-1">
                                {product.quantity} <span className="text-xs ml-1">штук</span>
                              </Badge>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                              >
                                +
                              </Button>
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
          </div>
        </div>

        {/* Customer Selection - 40% */}
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
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск клиентов"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-40 border rounded-md bg-white p-2" id="customerList">
                {filteredCustomers.sort((a, b) => {
                  if (a.id === pinnedCustomerId) return -1;
                  if (b.id === pinnedCustomerId) return 1;
                  return 0;
                }).map(customer => (
                  <div
                    key={customer.id}
                    id={`customer-${customer.id}`}
                    className={cn(
                      "p-2 rounded-md cursor-pointer",
                      selectedCustomerId === customer.id
                        ? "bg-primary text-primary-foreground"
                        : customer.id === pinnedCustomerId
                        ? "bg-gray-900 text-white"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => selectCustomer(customer.id)}
                  >
                    {customer.Name}
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

        <Button className="w-full" size="lg" onClick={createOrder} disabled={selectedProducts.length === 0 || (!selectedCustomerId && !newCustomerName) || !dueDate}>
          Создать заказ
        </Button>
      </div>
    </div>
  )
}

export default withAuth(NewOrderPage)

