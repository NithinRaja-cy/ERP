"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MyOpenOrders({ module = "sales" }: { module?: "sales" | "purchases" | "manufacturing" }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMyOpenOrders() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:8000/api/v1/${module}/orders?view=my&page_size=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // filter open orders (not cancelled, not completed/delivered)
          const openOrders = data.items.filter((o: any) => 
            !["cancelled", "delivered", "received", "completed"].includes(o.status)
          );
          setOrders(openOrders);
        }
      } catch (error) {
        console.error("Error fetching open orders:", error);
      }
    }
    fetchMyOpenOrders();
  }, [module]);

  return (
    <Card className="col-span-1 bg-slate-900 border-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">My Open Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No open orders assigned to you.</p>
          ) : (
            orders.map((order, i) => (
              <div key={order.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-200">{order.order_number || order.mo_number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{order.customer_name || order.vendor_name || order.product_name}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[10px]">
                  {order.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
