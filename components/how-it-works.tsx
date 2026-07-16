import { ClipboardList, Scale, Banknote } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    title: '1. Simule online',
    text: 'Use o nosso simulador para ter uma estimativa imediata do valor do seu ouro por quilate.',
  },
  {
    icon: Scale,
    title: '2. Avaliação presencial',
    text: 'Traga o seu ouro à nossa loja. Pesamos e verificamos o quilate à sua frente, com total transparência.',
  },
  {
    icon: Banknote,
    title: '3. Pagamento imediato',
    text: 'Aceita a proposta e recebe o pagamento na hora, em dinheiro ou por transferência.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-20 border-y border-border/60 bg-secondary/20 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance font-serif text-3xl font-bold md:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Um processo simples, rápido e seguro em três passos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl font-semibold">{step.title}</h3>
              <p className="leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
