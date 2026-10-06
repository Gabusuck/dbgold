/**
 * Utilitario para obtencao das cotacoes oficiais de Ouro e Prata.
 * 
 * Fontes:
 * 1. Primaria: LBMA Official JSON Feeds (London Bullion Market Association)
 * 2. Contingencia / Fallback: Yahoo Finance Live Metals + Cambio BCE/OpenER
 * 
 * Fatores de conversao:
 * 1 Onca Troy = 31.1034768 gramas
 */

export const TROY_OUNCE_IN_GRAMS = 31.1034768

export interface LondonFixingResult {
  success: boolean
  goldPricePerGram24k: number
  silverPricePerGram999: number
  date: string
  goldFixingType: 'AM' | 'PM'
  goldEurPerOz: number
  silverEurPerOz: number
  source?: string
  error?: string
}

interface LbmaEntry {
  d: string
  v: [number | null, number | null, number | null]
  is_cms_locked?: number
}

async function fetchFromLbma(): Promise<LondonFixingResult> {
  const fetchOptions: RequestInit = {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(6000),
  }

  const [pmRes, amRes, silverRes] = await Promise.all([
    fetch('https://prices.lbma.org.uk/json/gold_pm.json', fetchOptions),
    fetch('https://prices.lbma.org.uk/json/gold_am.json', fetchOptions),
    fetch('https://prices.lbma.org.uk/json/silver.json', fetchOptions),
  ])

  if (!pmRes.ok || !amRes.ok || !silverRes.ok) {
    throw new Error(`LBMA retornou erro HTTP: PM(${pmRes.status}), AM(${amRes.status}), Prata(${silverRes.status})`)
  }

  const [pmData, amData, silverData]: [LbmaEntry[], LbmaEntry[], LbmaEntry[]] = await Promise.all([
    pmRes.json(),
    amRes.json(),
    silverRes.json(),
  ])

  const validPm = [...pmData].reverse().find((e) => e && e.v && typeof e.v[2] === 'number' && e.v[2] > 0)
  const validAm = [...amData].reverse().find((e) => e && e.v && typeof e.v[2] === 'number' && e.v[2] > 0)

  if (!validPm && !validAm) {
    throw new Error('Nao foram encontrados registos validos de ouro na LBMA.')
  }

  let selectedGold = validPm || validAm!
  let goldFixingType: 'AM' | 'PM' = 'PM'

  if (validAm && (!validPm || validAm.d > validPm.d)) {
    selectedGold = validAm
    goldFixingType = 'AM'
  } else {
    selectedGold = validPm!
    goldFixingType = 'PM'
  }

  const validSilver = [...silverData].reverse().find((e) => e && e.v && typeof e.v[2] === 'number' && e.v[2] > 0)
  if (!validSilver) {
    throw new Error('Nao foram encontrados registos validos de prata na LBMA.')
  }

  const goldEurPerOz = selectedGold.v[2]!
  const silverEurPerOz = validSilver.v[2]!

  const goldPricePerGram24k = Math.round((goldEurPerOz / TROY_OUNCE_IN_GRAMS) * 100) / 100
  const silverPricePerGram999 = Math.round((silverEurPerOz / TROY_OUNCE_IN_GRAMS) * 100) / 100

  return {
    success: true,
    goldPricePerGram24k,
    silverPricePerGram999,
    date: selectedGold.d,
    goldFixingType,
    goldEurPerOz,
    silverEurPerOz,
    source: 'LBMA Official Feed',
  }
}

async function fetchFromFallback(): Promise<LondonFixingResult> {
  const hosts = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']
  let goldUsdOz: number | null = null
  let silverUsdOz: number | null = null
  let eurUsdRate = 1.12

  for (const host of hosts) {
    try {
      const [goldRes, silverRes, eurRes] = await Promise.all([
        fetch(`${host}/v8/finance/chart/GC=F`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(6000),
        }),
        fetch(`${host}/v8/finance/chart/SI=F`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(6000),
        }),
        fetch(`${host}/v8/finance/chart/EURUSD=X`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(6000),
        }).catch(() => null),
      ])

      if (goldRes.ok && silverRes.ok) {
        const goldData = await goldRes.json()
        const silverData = await silverRes.json()
        goldUsdOz = goldData.chart?.result?.[0]?.meta?.regularMarketPrice ?? null
        silverUsdOz = silverData.chart?.result?.[0]?.meta?.regularMarketPrice ?? null

        if (eurRes && eurRes.ok) {
          const eurData = await eurRes.json()
          const rate = eurData.chart?.result?.[0]?.meta?.regularMarketPrice
          if (rate && rate > 0) eurUsdRate = rate
        }
        if (goldUsdOz && silverUsdOz) break
      }
    } catch {}
  }

  if (!goldUsdOz || !silverUsdOz) {
    const openEr = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    }).then((r) => r.json()).catch(() => null)
    if (openEr?.rates?.EUR) eurUsdRate = 1 / openEr.rates.EUR
  }

  if (!goldUsdOz || !silverUsdOz) {
    throw new Error('Nao foi possivel obter cotacoes de ouro e prata dos servicos de contingencia.')
  }

  const goldEurOz = goldUsdOz / eurUsdRate
  const silverEurOz = silverUsdOz / eurUsdRate

  const goldPricePerGram24k = Math.round((goldEurOz / TROY_OUNCE_IN_GRAMS) * 100) / 100
  const silverPricePerGram999 = Math.round((silverEurOz / TROY_OUNCE_IN_GRAMS) * 100) / 100

  const now = new Date()
  const hours = now.getUTCHours()

  return {
    success: true,
    goldPricePerGram24k,
    silverPricePerGram999,
    date: now.toISOString().split('T')[0],
    goldFixingType: hours < 13 ? 'AM' : 'PM',
    goldEurPerOz: Math.round(goldEurOz * 100) / 100,
    silverEurPerOz: Math.round(silverEurOz * 100) / 100,
    source: 'Mercado de Metais Preciosos (Tempo Real)',
  }
}

export async function fetchLatestLondonFixing(): Promise<LondonFixingResult> {
  // 1. Tentar obter do LBMA direto
  try {
    const lbmaResult = await fetchFromLbma()
    if (lbmaResult.success && lbmaResult.goldPricePerGram24k > 0) {
      return lbmaResult
    }
  } catch (lbmaErr) {
    console.warn('[LBMA] Feed primario indisponivel ou bloqueado, a acionar contingencia:', lbmaErr instanceof Error ? lbmaErr.message : String(lbmaErr))
  }

  // 2. Fallback automatico de alta disponibilidade
  try {
    const fallbackResult = await fetchFromFallback()
    if (fallbackResult.success && fallbackResult.goldPricePerGram24k > 0) {
      return fallbackResult
    }
  } catch (fallbackErr) {
    console.error('[FALLBACK] Erro ao obter cotacoes do servico de contingencia:', fallbackErr)
  }

  return {
    success: false,
    goldPricePerGram24k: 0,
    silverPricePerGram999: 0,
    date: new Date().toISOString().split('T')[0],
    goldFixingType: 'PM',
    goldEurPerOz: 0,
    silverEurPerOz: 0,
    error: 'Nao foi possivel obter cotacoes nem do LBMA nem do servico de contingencia.',
  }
}