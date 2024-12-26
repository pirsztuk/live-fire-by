import Link from "next/link"
import { Home, Package, Users, ShoppingCart } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 h-full p-4">
      <h1 className="text-2xl font-bold mb-8">Candle Shop Admin</h1>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/products" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200">
              <Package size={20} />
              <span>Products</span>
            </Link>
          </li>
          <li>
            <Link href="/customers" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200">
              <Users size={20} />
              <span>Customers</span>
            </Link>
          </li>
          <li>
            <Link href="/orders" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200">
              <ShoppingCart size={20} />
              <span>Orders</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

