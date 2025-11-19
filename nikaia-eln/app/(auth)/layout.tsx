import { FlaskConical } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <div className="mb-8 flex items-center gap-2">
        <FlaskConical className="h-10 w-10 text-primary" />
        <span className="text-2xl font-bold">Nikaia ELN</span>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Electronic Lab Notebook for Research Teams
      </p>
    </div>
  )
}
