import { reportsApi, downloadBlob } from '@/lib/api'
import { FileText, Table, Download, BarChart3, Package, Truck, Factory } from 'lucide-react'
import { useState } from 'react'

const reports = [
  {
    id: 'sales-pdf',
    title: 'Sales Report',
    description: 'Complete sales orders with totals and customer info',
    icon: BarChart3,
    format: 'PDF',
    color: 'primary',
    action: async () => {
      const res = await reportsApi.salesPdf()
      downloadBlob(res.data, 'sales_report.pdf', 'application/pdf')
    },
  },
  {
    id: 'sales-excel',
    title: 'Sales Report',
    description: 'Export all sales orders to Excel',
    icon: BarChart3,
    format: 'Excel',
    color: 'green',
    action: async () => {
      const res = await reportsApi.salesExcel()
      downloadBlob(res.data, 'sales_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    },
  },
  {
    id: 'inventory-pdf',
    title: 'Inventory Report',
    description: 'Stock levels, values, and reorder status',
    icon: Package,
    format: 'PDF',
    color: 'purple',
    action: async () => {
      const res = await reportsApi.inventoryPdf()
      downloadBlob(res.data, 'inventory_report.pdf', 'application/pdf')
    },
  },
  {
    id: 'purchases-excel',
    title: 'Purchase Report',
    description: 'All purchase orders with vendor and status info',
    icon: Truck,
    format: 'Excel',
    color: 'orange',
    action: async () => {
      const res = await reportsApi.purchasesExcel()
      downloadBlob(res.data, 'purchases_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    },
  },
  {
    id: 'manufacturing-excel',
    title: 'Manufacturing Report',
    description: 'Manufacturing orders with production stats',
    icon: Factory,
    format: 'Excel',
    color: 'blue',
    action: async () => {
      const res = await reportsApi.manufacturingExcel()
      downloadBlob(res.data, 'manufacturing_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    },
  },
]

const COLOR_CLASSES: Record<string, string> = {
  primary: 'from-primary-500 to-primary-700',
  green: 'from-emerald-500 to-emerald-700',
  purple: 'from-purple-500 to-purple-700',
  orange: 'from-orange-500 to-orange-700',
  blue: 'from-blue-500 to-blue-700',
}

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleDownload = async (report: typeof reports[0]) => {
    setLoading(report.id)
    try {
      await report.action()
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">Reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Download reports in PDF or Excel format</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon
          const FormatIcon = report.format === 'PDF' ? FileText : Table
          return (
            <div key={report.id} className="card p-5 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLOR_CLASSES[report.color]} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <span className={`badge text-[10px] ${report.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      <FormatIcon size={9} className="mr-0.5" />{report.format}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <button
                    id={`download-${report.id}`}
                    onClick={() => handleDownload(report)}
                    disabled={loading === report.id}
                    className="btn-secondary w-full justify-center text-xs group-hover:bg-primary-50 group-hover:border-primary-200 group-hover:text-primary-700 transition-colors"
                  >
                    {loading === report.id ? (
                      <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />Generating...</span>
                    ) : (
                      <><Download size={14} /> Download {report.format}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
