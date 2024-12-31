'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authenticatedFetch } from "@/utils/api"

export default function CreateProductPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    Name: '',
    Price: '',
    Costs: '',
    Description: '',
    InStock: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formDataToSend = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      formDataToSend.append(key, value)
    }
    if (image) {
      formDataToSend.append('Image', image)
    }

    try {
      const response = await authenticatedFetch('/api/v1/products/create_product/', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'An error occurred while creating the product.')
      }

      router.push('/products')
    } catch (error) {
      console.error('Error creating product:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while creating the product.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Создать новый товар</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="Name">Название товара</Label>
                <Input
                  id="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Price">Цена</Label>
                  <Input
                    id="Price"
                    name="Price"
                    type="number"
                    step="0.01"
                    value={formData.Price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="Costs">Себестоимость</Label>
                  <Input
                    id="Costs"
                    name="Costs"
                    type="number"
                    step="0.01"
                    value={formData.Costs}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="InStock">В наличии</Label>
                <Input
                  id="InStock"
                  name="InStock"
                  type="number"
                  value={formData.InStock}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="Description">Описание</Label>
                <Textarea
                  id="Description"
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="Image">Изображение товара</Label>
                <Input
                  id="Image"
                  name="Image"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
                  required
                />
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <Label>Предпросмотр изображения</Label>
                  <div className="relative h-48 w-full mt-2">
                    <img
                      src={imagePreview}
                      alt="Предпросмотр товара"
                      className="rounded-md object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать товар'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

