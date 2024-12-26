'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Заказы</h1>
        <Link href="/orders/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Новый заказ
          </Button>
        </Link>
      </div>
      
      {/* Orders list will be implemented here */}
    </div>
  )
}

