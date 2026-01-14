import { Button } from "@/components/ui/button";
import Link from "next/link";

const InventoryPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link href="/inventory/add">
          <Button>Add Livestock</Button>
        </Link>
      </div>
      <p>Manage your inventory here.</p>
    </div>
  );
};

export default InventoryPage;
