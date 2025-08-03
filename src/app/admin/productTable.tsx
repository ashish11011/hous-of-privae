import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoryFromSlug } from "@/hepler";
import Link from "next/link";

export function ProductTableAdmin({ productData }: any) {
  return (
    <Table className=" w-full">
      {/* <TableCaption>A list of your recent items.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className="">Item</TableHead>
          <TableHead>Category1</TableHead>
          <TableHead>Category2</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productData.map((item: any) => (
          <TableRow key={item.id}>
            {/* <TableCell className="font-medium">{item.bannerImage}</TableCell> */}
            <TableCell>
              <Link href={`/admin/products/${item.slug}`}>{item.name}</Link>
            </TableCell>
            <TableCell className="">
              {getCategoryFromSlug(item.categoryId1)?.name}
            </TableCell>
            <TableCell className="">
              {" "}
              {getCategoryFromSlug(item.categoryId2)?.name}
            </TableCell>
            <TableCell className=" text-right">{item.basePrice}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  );
}
