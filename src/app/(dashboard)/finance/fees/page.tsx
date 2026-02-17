import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { FeeStructureManagement } from "@/modules/finance/components/FeeStructureManagement"

export default async function FinanceFeesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FINANCE") {
    return null
  }

  // Fetch fee structures
  const feeStructures = await db.feeStructure.findMany({
    include: {
      department: true,
      _count: {
        select: {
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch departments for the form
  const departments = await db.department.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Structure Management</h1>
        <p className="text-muted-foreground">Create and manage fee structures</p>
      </div>

      <FeeStructureManagement
        feeStructures={feeStructures}
        departments={departments}
      />
    </div>
  )
}




