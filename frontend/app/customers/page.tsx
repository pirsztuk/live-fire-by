'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Plus, Pencil, Trash } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authenticatedFetch } from "@/utils/api"

interface Customer {
  id: number
  Name: string
  MoneySpent: number
}

interface CustomerDetails {
  id: number
  Name: string
  Email: string
  Phone: string
  Address: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ Name: '', Email: '', Phone: '', Address: '' })
  const [editedCustomer, setEditedCustomer] = useState<CustomerDetails | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      const response = await authenticatedFetch(`/api/v1/customers/get_customer/?customer_id=${customerId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customer details')
      }
      const data = await response.json()
      setSelectedCustomer(data.data)
      setIsDetailsDialogOpen(true)
    } catch (error) {
      console.error('Error fetching customer details:', error)
      setError('Failed to load customer details')
    }
  }

  const handleCreateCustomer = async () => {
    try {
      const formData = new FormData()
      formData.append('Name', newCustomer.Name)
      if (newCustomer.Email) formData.append('Email', newCustomer.Email)
      if (newCustomer.Phone) formData.append('Phone', newCustomer.Phone)
      if (newCustomer.Address) formData.append('Address', newCustomer.Address)

      const response = await authenticatedFetch('/api/v1/customers/create_customer/', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      setIsCreateDialogOpen(false)
      setNewCustomer({ Name: '', Email: '', Phone: '', Address: '' })
      fetchCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      setError('Failed to create customer')
    }
  }

  const handleEditCustomer = async () => {
    if (!editedCustomer) return

    try {
      const formData = new FormData()
      formData.append('customer_id', editedCustomer.id.toString())
      
      if (editedCustomer.Name !== selectedCustomer?.Name) formData.append('Name', editedCustomer.Name)
      if (editedCustomer.Email !== selectedCustomer?.Email) formData.append('Email', editedCustomer.Email)
      if (editedCustomer.Phone !== selectedCustomer?.Phone) formData.append('Phone', editedCustomer.Phone)
      if (editedCustomer.Address !== selectedCustomer?.Address) formData.append('Address', editedCustomer.Address)

      const response = await authenticatedFetch('/api/v1/customers/update_customer/', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to update customer')
      }

      setIsEditDialogOpen(false)
      setEditedCustomer(null)
      fetchCustomers()
      fetchCustomerDetails(editedCustomer.id)
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('Failed to update customer')
    }
  }

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return

    try {
      const response = await authenticatedFetch('/api/v1/customers/delete_customer/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customer_id: selectedCustomer.id })
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }

      setIsDeleteDialogOpen(false)
      setIsDetailsDialogOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      setError('Failed to delete customer')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Добавить клиента
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить нового клиента</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Имя
                </Label>
                <Input
                  id="name"
                  value={newCustomer.Name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, Name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={newCustomer.Email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, Email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Телефон
                </Label>
                <Input
                  id="phone"
                  value={newCustomer.Phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, Phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Адрес
                </Label>
                <Input
                  id="address"
                  value={newCustomer.Address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, Address: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreateCustomer}>Создать клиента</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.Name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Сумма покупок: {customer.MoneySpent} BYN</p>
              <Button variant="outline" size="sm" onClick={() => fetchCustomerDetails(customer.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Подробнее
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Информация о клиенте</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Имя:</Label>
                <span className="col-span-3">{selectedCustomer.Name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Email:</Label>
                <span className="col-span-3">{selectedCustomer.Email || 'Не указан'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Телефон:</Label>
                <span className="col-span-3">{selectedCustomer.Phone || 'Не указан'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Адрес:</Label>
                <span className="col-span-3">{selectedCustomer.Address || 'Не указан'}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditedCustomer(selectedCustomer)
              setIsEditDialogOpen(true)
            }}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать клиента</DialogTitle>
          </DialogHeader>
          {editedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Имя
                </Label>
                <Input
                  id="edit-name"
                  value={editedCustomer.Name}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, Name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editedCustomer.Email}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, Email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Телефон
                </Label>
                <Input
                  id="edit-phone"
                  value={editedCustomer.Phone}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, Phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Адрес
                </Label>
                <Input
                  id="edit-address"
                  value={editedCustomer.Address}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, Address: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditCustomer}>Сохранить изменения</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента</DialogTitle>
          </DialogHeader>
          <p>Вы уверены, что хотите удалить этого клиента? Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

