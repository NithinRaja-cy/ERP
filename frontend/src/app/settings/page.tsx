"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [activeConfig, setActiveConfig] = useState<string | null>(null);
  
  // Mock states for configuration
  const [threshold, setThreshold] = useState("50");
  const [roleName, setRoleName] = useState("");

  const handleSave = () => {
    // Simulate save
    alert("Settings saved successfully.");
    setActiveConfig(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">System Settings</h2>
          <p className="text-slate-400 mt-1">Configure ERP rules, users, and master data.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">User & Role Management</CardTitle>
            <CardDescription className="text-slate-400">Configure Advanced RBAC permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button 
                variant="outline" 
                onClick={() => setActiveConfig('roles')}
                className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800"
             >
               Manage Roles
             </Button>
             
             {activeConfig === 'roles' && (
               <div className="p-4 mt-2 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                 <label className="text-xs text-slate-400 uppercase tracking-wider">Create New Role</label>
                 <input 
                   type="text" 
                   placeholder="e.g. Warehouse Manager"
                   value={roleName}
                   onChange={(e) => setRoleName(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                 />
                 <div className="flex space-x-2">
                   <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">Save Role</Button>
                   <Button onClick={() => setActiveConfig(null)} variant="ghost" className="h-8 text-xs text-slate-400">Cancel</Button>
                 </div>
               </div>
             )}

             <Button variant="outline" className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800">Invite Users</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Business Rules Engine</CardTitle>
            <CardDescription className="text-slate-400">Configure automated alerts and thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button 
                variant="outline" 
                onClick={() => setActiveConfig('thresholds')}
                className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800"
             >
               Low Stock Thresholds
             </Button>

             {activeConfig === 'thresholds' && (
               <div className="p-4 mt-2 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                 <label className="text-xs text-slate-400 uppercase tracking-wider">Global Minimum Stock Quantity</label>
                 <input 
                   type="number" 
                   value={threshold}
                   onChange={(e) => setThreshold(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                 />
                 <p className="text-xs text-slate-500">Alerts will trigger if on-hand quantity falls below this number.</p>
                 <div className="flex space-x-2">
                   <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">Update Rules</Button>
                   <Button onClick={() => setActiveConfig(null)} variant="ghost" className="h-8 text-xs text-slate-400">Cancel</Button>
                 </div>
               </div>
             )}

             <Button variant="outline" className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800">Approval Chains</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
