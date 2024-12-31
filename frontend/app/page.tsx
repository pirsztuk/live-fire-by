'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { authenticatedFetch } from "@/utils/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import { withAuth } from "@/components/withAuth"

interface DashboardData {
  current_month_profits: number
  percentage_change: number
  products_count: number
  new_products_count: number
  new_products_percentage: number
  in_stock_products_count: number
  customers_count: number
  new_customers_count: number
  new_customers_percentage: number
}

const generateRandomRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map(month => ({
    name: month,
    revenue: Math.floor(Math.random() * 10000) + 5000
  }))
}

function Dashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenueData] = useState(generateRandomRevenueData())

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await authenticatedFetch('/api/v1/dashboard/main_dashboard/')
        if (response.status === 403) {
          // User is not authenticated, redirect to login
          router.push('/login')
          return
        }
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доход за месяц</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.current_month_profits.toFixed(2)} BYN</div>
            <p className={`text-xs ${dashboardData?.percentage_change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {dashboardData?.percentage_change >= 0 ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
              {Math.abs(dashboardData?.percentage_change ?? 0)}% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продукты</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.products_count}</div>
            <p className="text-xs text-muted-foreground">Всего продуктов</p>
            <div className="mt-2 flex items-center text-xs">
              <span className="font-medium text-green-500 mr-1">+{dashboardData?.new_products_count}</span>
              <span className="text-muted-foreground">новых ({dashboardData?.new_products_percentage}%)</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В наличии</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.in_stock_products_count}</div>
            <p className="text-xs text-muted-foreground">Товаров в наличии</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.customers_count}</div>
            <p className="text-xs text-muted-foreground">Всего клиентов</p>
            <div className="mt-2 flex items-center text-xs">
              <span className="font-medium text-green-500 mr-1">+{dashboardData?.new_customers_count}</span>
              <span className="text-muted-foreground">новых ({dashboardData?.new_customers_percentage}%)</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Доход за последние 6 месяцев</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(Dashboard)

