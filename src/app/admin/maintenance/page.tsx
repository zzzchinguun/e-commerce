'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, Play, Clock, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { reconcileProductSalesCounts, getLastMaintenanceRun } from '@/actions/admin'

interface MaintenanceAction {
  id: string
  name: string
  description: string
  schedule: string
  canRunManually: boolean
  lastRun?: { created_at: string; metadata: { updated?: number; errors?: number } } | null
}

const MAINTENANCE_ACTIONS: Omit<MaintenanceAction, 'lastRun'>[] = [
  {
    id: 'reconcile-sales',
    name: 'Борлуулалтын тоо тулгах',
    description: 'Бүтээгдэхүүний борлуулалтын тоог захиалгуудаас дахин тооцоолж шинэчилнэ. Өгөгдлийн бүрэн бүтэн байдлыг хангана.',
    schedule: 'Өдөр бүр шөнийн 2:00 цагт',
    canRunManually: true,
  },
]

export default function MaintenancePage() {
  const [actions, setActions] = useState<MaintenanceAction[]>(
    MAINTENANCE_ACTIONS.map(a => ({ ...a, lastRun: null }))
  )
  const [running, setRunning] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLastRuns()
  }, [])

  async function loadLastRuns() {
    setLoading(true)
    try {
      const results = await Promise.all(
        MAINTENANCE_ACTIONS.map(async (action) => {
          const lastRun = await getLastMaintenanceRun(action.id)
          return { id: action.id, lastRun }
        })
      )

      setActions(prev =>
        prev.map(a => {
          const result = results.find(r => r.id === a.id)
          return result ? { ...a, lastRun: result.lastRun } : a
        })
      )
    } catch (error) {
      console.error('Failed to load last runs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRunAction(actionId: string) {
    setRunning(actionId)
    try {
      if (actionId === 'reconcile-sales') {
        const result = await reconcileProductSalesCounts()
        if (result.error) {
          toast.error('Алдаа гарлаа', { description: result.error })
        } else {
          toast.success('Амжилттай', {
            description: result.message || `${result.updated} бүтээгдэхүүн шинэчлэгдлээ`
          })
          loadLastRuns()
        }
      }
    } catch (error) {
      toast.error('Алдаа гарлаа', {
        description: error instanceof Error ? error.message : 'Тодорхойгүй алдаа'
      })
    } finally {
      setRunning(null)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Засвар үйлчилгээ</h1>
          <p className="text-muted-foreground">
            Системийн засвар үйлчилгээний үйлдлүүд
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadLastRuns}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </Button>
      </div>

      <div className="grid gap-4">
        {actions.map((action) => (
          <Card key={action.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {action.description}
                    </CardDescription>
                  </div>
                </div>
                {action.canRunManually && (
                  <Button
                    onClick={() => handleRunAction(action.id)}
                    disabled={running === action.id}
                  >
                    {running === action.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ажиллаж байна...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Гараар ажиллуулах
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Хуваарь: {action.schedule}</span>
                </div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ачааллаж байна...</span>
                  </div>
                ) : action.lastRun ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Сүүлд: {formatDate(action.lastRun.created_at)}</span>
                    {action.lastRun.metadata?.updated !== undefined && (
                      <Badge variant="secondary">
                        {action.lastRun.metadata.updated} шинэчлэгдсэн
                      </Badge>
                    )}
                    {action.lastRun.metadata?.errors !== undefined && action.lastRun.metadata.errors > 0 && (
                      <Badge variant="destructive">
                        {action.lastRun.metadata.errors} алдаа
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>Хараахан ажиллаагүй</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Тайлбар</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <p className="font-medium text-foreground">Борлуулалтын тоо тулгах</p>
            <p>
              Энэ үйлдэл нь бүтээгдэхүүн бүрийн <code className="bg-muted px-1 rounded">sales_count</code> талбарыг
              бодит захиалгуудаас дахин тооцоолно. Хэрэв системд алдаа гарч борлуулалтын тоо буруу болсон
              бол энэ үйлдлийг ажиллуулж засах боломжтой.
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="font-medium text-foreground">Автомат хуваарь</p>
            <p>
              Бүх засвар үйлчилгээний үйлдлүүд өдөр бүр шөнийн 2:00 цагт (Монголын цагаар)
              автоматаар ажиллана. Энэ нь <code className="bg-muted px-1 rounded">/api/cron/nightly</code> endpoint-ээр
              дамжин ажиллана.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
