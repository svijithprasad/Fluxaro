"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  saveActivityLogsNotification,
  updateFunnelProducts,
} from "@/lib/queries";
import { Funnel } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FunnelProductsTableProps {
  defaultData: Funnel;
  products: any[];
}

const FunnelProductsTable: React.FC<FunnelProductsTableProps> = ({
  products,
  defaultData,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<
    { productId: string; recurring: boolean }[] | []
  >(JSON.parse(defaultData.liveProducts || "[]"));

  // ⚠️ DISABLED: Stripe product management functionality has been removed
  // Product/payment management is no longer available
  return (
    <div className="p-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Products/Payments Disabled:</strong> Stripe product management has been removed. 
          Payment functionality is no longer available.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FunnelProductsTable;
