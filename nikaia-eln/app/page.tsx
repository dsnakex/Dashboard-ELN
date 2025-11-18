import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FlaskConical,
  Folder,
  ClipboardList,
  Box,
  BarChart3,
  Search
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Nikaia ELN</span>
          </div>
          <Button variant="outline">Login</Button>
        </div>
      </header>

      {/* Hero */}
      <main className="container px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Electronic Lab Notebook
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Professional ELN for research teams. Manage experiments, protocols,
            samples, and more with a modern, intuitive interface.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 max-w-6xl">
          <h2 className="text-center text-2xl font-bold mb-10">Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <FlaskConical className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Experiments</CardTitle>
                <CardDescription>
                  Document and track your experiments with rich text editing and templates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ClipboardList className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Protocols</CardTitle>
                <CardDescription>
                  Create and share reusable protocols across your team.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Box className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Track samples, reagents, and equipment with barcode support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Folder className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Organize work into projects and studies for better management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Real-time KPIs and activity tracking for your research.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Global Search</CardTitle>
                <CardDescription>
                  Find anything instantly with Cmd+K global search.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Status */}
        <div className="mx-auto mt-20 max-w-2xl">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-primary">Setup Complete!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Next.js 14, Tailwind CSS, and Shadcn/ui are configured.
                  <br />
                  Configure your Supabase credentials in <code className="bg-muted px-1 rounded">.env.local</code> to connect to your database.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container flex h-16 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            Nikaia ELN - Professional Electronic Lab Notebook
          </p>
        </div>
      </footer>
    </div>
  )
}
