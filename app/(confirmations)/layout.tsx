import { ClientOnly } from '@/components/ui/client-only'

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <ClientOnly
        fallback={
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-96 h-96" />
          </div>
        }
      >
        {children}
      </ClientOnly>
    </div>
  )
}
