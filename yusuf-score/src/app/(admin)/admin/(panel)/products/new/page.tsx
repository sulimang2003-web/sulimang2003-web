import { repo } from "@/lib/data";
import { PageTitle } from "@/components/admin/card";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProduct() {
  return (<><PageTitle title="منتج جديد" /><ProductForm categories={await repo().listCategories()} /></>);
}
