import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "./LoadingSpinner"

interface LoadingCardProps {
  message?: string
}

export function LoadingCard({ message = "Loading..." }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text={message} />
      </CardContent>
    </Card>
  )
}



