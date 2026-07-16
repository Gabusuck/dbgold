'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, LogIn, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateSettings, verifyPassword } from '@/app/actions'
import { type GoldSettings } from '@/lib/gold'

export function AdminDialog({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  settings: GoldSettings
}) {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [price, setPrice] = useState(String(settings.price_per_gram_24k))
  const [discount, setDiscount] = useState(String(settings.discount_per_gram))
  const [priceSilver, setPriceSilver] = useState(String(settings.price_per_gram_silver_999 ?? 1.00))
  const [discountSilver, setDiscountSilver] = useState(String(settings.discount_per_gram_silver ?? 0.15))
  const [goldDiscountType, setGoldDiscountType] = useState<'fixed' | 'percent'>('fixed')
  const [silverDiscountType, setSilverDiscountType] = useState<'fixed' | 'percent'>('fixed')
  const [pending, startTransition] = useTransition()

  // Sync state with settings when dialog is opened or settings change
  useEffect(() => {
    if (open) {
      setPrice(String(settings.price_per_gram_24k))
      
      const goldDisc = settings.discount_per_gram
      if (goldDisc < 0) {
        setGoldDiscountType('percent')
        setDiscount(String(Math.abs(goldDisc)))
      } else {
        setGoldDiscountType('fixed')
        setDiscount(String(goldDisc))
      }

      setPriceSilver(String(settings.price_per_gram_silver_999 ?? 1.00))

      const silverDisc = settings.discount_per_gram_silver ?? 0.15
      if (silverDisc < 0) {
        setSilverDiscountType('percent')
        setDiscountSilver(String(Math.abs(silverDisc)))
      } else {
        setSilverDiscountType('fixed')
        setDiscountSilver(String(silverDisc))
      }
    }
  }, [open, settings])

  function handleClose(v: boolean) {
    onOpenChange(v)
    if (!v) {
      // repõe o estado ao fechar
      setTimeout(() => {
        setAuthed(false)
        setPassword('')
      }, 200)
    }
  }

  function handleLogin() {
    startTransition(async () => {
      const ok = await verifyPassword(password)
      if (ok) {
        setAuthed(true)
        toast.success('Acesso autorizado')
      } else {
        toast.error('Password incorreta')
      }
    })
  }

  function handleSave() {
    startTransition(async () => {
      const goldDiscNum = Number(discount.replace(',', '.'))
      const goldDiscFinal = goldDiscountType === 'percent' ? -Math.abs(goldDiscNum) : Math.abs(goldDiscNum)

      const silverDiscNum = Number(discountSilver.replace(',', '.'))
      const silverDiscFinal = silverDiscountType === 'percent' ? -Math.abs(silverDiscNum) : Math.abs(silverDiscNum)

      const res = await updateSettings({
        password,
        price_per_gram_24k: Number(price.replace(',', '.')),
        discount_per_gram: goldDiscFinal,
        price_per_gram_silver_999: Number(priceSilver.replace(',', '.')),
        discount_per_gram_silver: silverDiscFinal,
      })
      if (res.ok) {
        toast.success(res.message)
        handleClose(false)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Área reservada
          </DialogTitle>
          <DialogDescription>
            {authed
              ? 'Atualize as cotações diárias e descontos dos metais preciosos.'
              : 'Introduza a password para gerir os valores.'}
          </DialogDescription>
        </DialogHeader>

        {!authed ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-pass">Password</Label>
              <Input
                id="admin-pass"
                type="password"
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    handleLogin()
                  }
                }}
                placeholder="••••••••"
              />
            </div>
            <Button onClick={handleLogin} disabled={pending || !password}>
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Ouro Settings */}
            <div className="border-b border-border/60 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">Definições de Ouro</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="price" className="text-xs">Preço Ouro 24k (€/g)</Label>
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount" className="text-xs">Desconto Ouro</Label>
                    <div className="flex rounded-md bg-zinc-800 p-0.5 text-[9px] font-black">
                      <button
                        type="button"
                        onClick={() => setGoldDiscountType('fixed')}
                        className={`rounded px-1.5 py-0.5 transition-colors ${
                          goldDiscountType === 'fixed'
                            ? 'bg-amber-500 text-amber-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        €/g
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoldDiscountType('percent')}
                        className={`rounded px-1.5 py-0.5 transition-colors ${
                          goldDiscountType === 'percent'
                            ? 'bg-amber-500 text-amber-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none select-none">
                      {goldDiscountType === 'fixed' ? '€/g' : '%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prata Settings */}
            <div className="border-b border-border/60 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Definições de Prata</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="price-silver" className="text-xs">Preço Prata 999 (€/g)</Label>
                  <Input
                    id="price-silver"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={priceSilver}
                    onChange={(e) => setPriceSilver(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount-silver" className="text-xs">Desconto Prata</Label>
                    <div className="flex rounded-md bg-zinc-800 p-0.5 text-[9px] font-black">
                      <button
                        type="button"
                        onClick={() => setSilverDiscountType('fixed')}
                        className={`rounded px-1.5 py-0.5 transition-colors ${
                          silverDiscountType === 'fixed'
                            ? 'bg-amber-500 text-amber-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        €/g
                      </button>
                      <button
                        type="button"
                        onClick={() => setSilverDiscountType('percent')}
                        className={`rounded px-1.5 py-0.5 transition-colors ${
                          silverDiscountType === 'percent'
                            ? 'bg-amber-500 text-amber-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="discount-silver"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={discountSilver}
                      onChange={(e) => setDiscountSilver(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none select-none">
                      {silverDiscountType === 'fixed' ? '€/g' : '%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={pending} className="h-11 rounded-lg">
              <Save className="h-4 w-4" />
              Guardar alterações
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

