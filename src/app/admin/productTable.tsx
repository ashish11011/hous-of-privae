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
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  basePrice: number | null;
  categoryId1: string | null;
  categoryId2: string | null;
  slug: string | null;
  bannerImage: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  materials: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

interface ContactsTableProps {
  productData: Product[];
  total?: number;
  currentPage?: number;
}

export function ProductTableAdmin({
  productData,
  total = 10,
  currentPage = 1,
}: ContactsTableProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / PAGINATION_LIMIT);
  return (
    <div className=" w-full overflow-x-auto p-4 h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Category 1</TableHead>
            <TableHead>Category 2</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productData.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.name ? (
                  <Link href={`/admin/products/${product.slug}`}>
                    {product.name}
                  </Link>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className=" max-w-24 overflow-hidden">
                {product.description || "-"}
              </TableCell>
              <TableCell>
                {product.basePrice != null ? `₹${product.basePrice}` : "-"}
              </TableCell>
              <TableCell>{product.categoryId1 || "-"}</TableCell>
              <TableCell>{product.categoryId2 || "-"}</TableCell>

              <TableCell>{product.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ShadcnPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => router.push(`/admin?page=${page}`)}
      />
    </div>
  );
}
