import { RegisterForm } from "@/modules/auth/components/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full px-4 py-8">
        <RegisterForm />
      </div>
    </div>
  )
}



