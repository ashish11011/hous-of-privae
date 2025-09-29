import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  userId: string;
  status: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  totalAmountPaid: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            {/* <TableHead>User ID</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Pincode</TableHead>
            <TableHead>Total Paid</TableHead>
            <TableHead>Created At</TableHead>
            {/* <TableHead>Updated At</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, idx) => (
            <TableRow key={order.id}>
              <TableCell>{idx + 1}</TableCell>
              {/* <TableCell>{order.userId}</TableCell> */}
              <TableCell>{order.status}</TableCell>
              <TableCell>
                {order.addressLine1}, {order.addressLine2}
              </TableCell>
              <TableCell>{order.city}</TableCell>
              <TableCell>{order.state}</TableCell>
              <TableCell>{order.pincode}</TableCell>
              <TableCell>₹{order.totalAmountPaid?.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleString()}
              </TableCell>
              {/* <TableCell>
                {new Date(order.updatedAt).toLocaleString()}
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
