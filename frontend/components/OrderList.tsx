import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Order = {
  id: number
  customerName: string
  totalAmount: number
  status: 'processing' | 'completed' | 'cancelled'
  date: string
}

type OrderListProps = {
  orders: Order[]
}

export function OrderList({ orders }: OrderListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Клиент</TableHead>
          <TableHead>Сумма</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Дата</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{order.totalAmount} ₽</TableCell>
            <TableCell>
              <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'default'}>
                {order.status === 'processing' ? 'В обработке' : order.status === 'completed' ? 'Выполнен' : 'Отменен'}
              </Badge>
            </TableCell>
            <TableCell>{order.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

