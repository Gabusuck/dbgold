/**
 * Utilitário para obtenção das cotações oficiais do Fixing de Londres (LBMA).
 * 
 * Ouro:
 *  - AM Fixing: ~10h30 (hora de Londres/Lisboa)
 *  - PM Fixing: ~15h00 (hora de Londres/Lisboa)
 * Prata:
 *  - Fixing diário único: ~12h00
 * 
 * Estrutura de valores da LBMA em cada registo:
 *   v[0] = Preço em USD por onça troy
 *   v[1] = Preço em GBP por onça troy
 *   v[2] = Preço em EUR por onça troy
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
  error?: string
}

interface LbmaEntry {
  d: string
  v: [number | null, number | null, number | null]
  is_cms_locked?: number
}

export async function fetchLatestLondonFixing(): Promise<LondonFixingResult> {
  try {
    const fetchOptions: RequestInit = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DBGoldBot/1.0)',
      },
      next: { revalidate: 0 },
    }

    const [pmRes, amRes, silverRes] = await Promise.all([
      fetch('https://prices.lbma.org.uk/json/gold_pm.json', fetchOptions),
      fetch('https://prices.lbma.org.uk/json/gold_am.json', fetchOptions),
      fetch('https://prices.lbma.org.uk/json/silver.json', fetchOptions),
    ])

    if (!pmRes.ok || !amRes.ok || !silverRes.ok) {
      throw new Error(`Falha ao contactar LBMA: PM(${pmRes.status}), AM(${amRes.status}), Prata(${silverRes.status})`)
    }

    const [pmData, amData, silverData]: [LbmaEntry[], LbmaEntry[], LbmaEntry[]] = await Promise.all([
      pmRes.json(),
      amRes.json(),
      silverRes.json(),
    ])

    // Obter o registo de ouro PM válido mais recente
    const validPm = [...pmData].reverse().find((e) => e && e.v && typeof e.v[2] === 'number' && e.v[2] > 0)
    // Obter o registo de ouro AM válido mais recente
    const validAm = [...amData].reverse().find((e) => e && e.v && typeof e.v[2] === 'number' && e.v[2] > 0)

    if (!validPm && !validAm) {
      throw new Error('Não foram encontrados registos válidos de cotação de ouro na LBMA.')
    }

    // Determinar qual é a cotação de ouro mais recente (PM tem prioridade se for na mesma data ou posterior)
    let selectedGold = validPm || validAm!
    let goldFixingType: 'AM' | 'PM' = 'PM'

    if (validAm && (!validPm || validAm.d > validPm.d)) {
      selectedGold = validAm
      goldFixingType = 'AM'
    } else {
      selectedGold = validPm!
      goldFixingType = 'PM'
    }

    // Obter a cotação de prata válida mais recente
    const validSilver = [...silverData].reverse().find((e) => e && e.v && typeof e.v[2] === 'number' && e.v[2] > 0)

    if (!validSilver) {
      throw new Error('Não foram encontrados registos válidos de cotação de prata na LBMA.')
    }

    const goldEurPerOz = selectedGold.v[2]!
    const silverEurPerOz = validSilver.v[2]!

    // Conversão de EUR/onça troy para EUR/grama (arredondado a 2 casas decimais)
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
    }
  } catch (error) {
    console.error('[LBMA] Erro ao obter cotações oficiais:', error)
    return {
      success: false,
      goldPricePerGram24k: 0,
      silverPricePerGram999: 0,
      date: new Date().toISOString().split('T')[0],
      goldFixingType: 'PM',
      goldEurPerOz: 0,
      silverEurPerOz: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
