import { NextRequest, NextResponse } from 'next/server'
import { syncLondonFixing } from '@/app/actions'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificação de segurança opcional: se CRON_SECRET estiver configurado nas env vars
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Iniciando atualização automática das cotações com o Fixing de Londres...')
    const result = await syncLondonFixing()

    if (!result.ok) {
      console.error('[CRON] Erro ao sincronizar fixing:', result.message)
      return NextResponse.json({ ok: false, error: result.message }, { status: 500 })
    }

    console.log('[CRON] Sincronização concluída com sucesso:', result.message)
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: result.message,
      fixing: result.fixing,
    })
  } catch (error) {
    console.error('[CRON] Exceção durante a execução do cron:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
