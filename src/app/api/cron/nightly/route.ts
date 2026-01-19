import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reconcileProductSalesCountsInternal } from '@/actions/admin'

// Vercel Cron - runs at 2:00 AM Mongolia time (UTC+8) = 18:00 UTC previous day
// This unified endpoint runs all nightly maintenance jobs
export async function GET(request: Request) {
  // Verify cron secret (Vercel adds this header)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, { success: boolean; updated?: number; errors?: number; error?: string }> = {}
  const supabase = createAdminClient()

  try {
    // ============================================
    // JOB 1: Reconcile Product Sales Counts
    // ============================================
    console.log('[Nightly Cron] Starting: reconcile_sales_counts')
    const salesResult = await reconcileProductSalesCountsInternal(supabase)
    // Normalize the result to always have success field
    results['reconcile_sales_counts'] = {
      success: salesResult.success ?? !salesResult.error,
      updated: salesResult.updated,
      errors: salesResult.errors,
      error: salesResult.error,
    }

    if (results['reconcile_sales_counts'].success) {
      // Log to audit
      await (supabase as any)
        .from('admin_audit_log')
        .insert({
          action: 'reconcile_sales_counts',
          metadata: {
            updated: salesResult.updated,
            errors: salesResult.errors,
            triggered_by: 'cron'
          }
        })
      console.log(`[Nightly Cron] Completed: reconcile_sales_counts - ${salesResult.updated} updated, ${salesResult.errors} errors`)
    } else {
      console.error(`[Nightly Cron] Failed: reconcile_sales_counts - ${salesResult.error}`)
    }

    // ============================================
    // ADD MORE NIGHTLY JOBS HERE
    // ============================================
    // Example:
    // console.log('[Nightly Cron] Starting: cleanup_expired_sessions')
    // const cleanupResult = await cleanupExpiredSessionsInternal(supabase)
    // results['cleanup_expired_sessions'] = cleanupResult

    // ============================================
    // SUMMARY
    // ============================================
    const successCount = Object.values(results).filter(r => r.success).length
    const failCount = Object.values(results).filter(r => !r.success).length

    console.log(`[Nightly Cron] All jobs completed: ${successCount} succeeded, ${failCount} failed`)

    return NextResponse.json({
      success: failCount === 0,
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.keys(results).length,
        succeeded: successCount,
        failed: failCount
      },
      results
    })

  } catch (error) {
    console.error('[Nightly Cron] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
