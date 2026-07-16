export type GoldSettings = {
  price_per_gram_24k: number
  discount_per_gram: number
  price_per_gram_silver_999: number
  discount_per_gram_silver: number
  updated_at: string
}

export type Karat = {
  label: string
  karat: number
  /** Pureza (fração de ouro fino). Ex.: 18k = 750/1000 */
  purity: number
}

export type SilverPurity = {
  label: string
  value: string
  /** Pureza (fração de prata fina). Ex.: 925 = 925/1000 */
  purity: number
}

// Quilates suportados na simulação, com a pureza legal em Portugal/UE.
export const KARATS: Karat[] = [
  { label: '24 quilates', karat: 24, purity: 0.999 },
  { label: '22 quilates', karat: 22, purity: 0.916 },
  { label: '18 quilates', karat: 18, purity: 0.75 },
  { label: '14 quilates', karat: 14, purity: 0.585 },
  { label: '9 quilates', karat: 9, purity: 0.375 },
]

// Purezas de prata suportadas em Portugal.
export const SILVER_PURITIES: SilverPurity[] = [
  { label: '999‰ (Prata Fina)', value: '999', purity: 0.999 },
  { label: '925‰ (Prata de Lei)', value: '925', purity: 0.925 },
  { label: '835‰ (Prata de Lei)', value: '835', purity: 0.835 },
  { label: '800‰ (Prata Comum)', value: '800', purity: 0.800 },
]

/** Preço oficial por grama para um dado metal (com base no preço fino de referência). */
export function officialPricePerGram(refPrice: number, purity: number): number {
  return refPrice * purity
}

/** Preço que a DB Gold paga por grama: preço de referência com base na pureza menos o desconto.
 * Se o desconto for negativo, é tratado como percentagem (ex: -10 significa 10% de desconto sobre o valor oficial).
 */
export function payPricePerGram(
  refPrice: number,
  discount: number,
  purity: number,
): number {
  const official = officialPricePerGram(refPrice, purity)
  if (discount < 0) {
    const percent = Math.abs(discount) / 100
    const value = official * (1 - percent)
    return value > 0 ? value : 0
  }
  const value = official - discount
  return value > 0 ? value : 0
}

const eur = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
})

export function formatEUR(value: number): string {
  return eur.format(value)
}

