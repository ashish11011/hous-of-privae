"use client";
import ShadcnPagination from "@/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGINATION_LIMIT } from "@/const";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
  createdAt: Date;
}

interface ContactsTableProps {
  contacts: Contact[];
  total?: number;
  currentPage?: number;
}

export default function ContactsTable({
  contacts,
  total = 10,
  currentPage = 1,
}: ContactsTableProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / PAGINATION_LIMIT);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, idx) => (
            <TableRow key={contact.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.phone}</TableCell>
              <TableCell>{contact.location || "-"}</TableCell>
              <TableCell>{contact.message}</TableCell>
              <TableCell>
                {new Date(contact.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ShadCN Pagination */}

      <ShadcnPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => router.push(`/admin/contacts?page=${page}`)}
      />
    </div>
  );
}
