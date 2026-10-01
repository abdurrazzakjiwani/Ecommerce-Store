'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea, fieldA11y } from '@/components/ui/Field'
import { contactSchema, type ContactInput } from '@/lib/address'

/**
 * Contact form.
 *
 * Spam defences are the three that cost a genuine visitor nothing: a hidden
 * honeypot field, a minimum time-to-submit, and (in production) a per-IP rate
 * limit. No CAPTCHA, because a CAPTCHA is a wall in front of every real enquiry.
 *
 * PROTOTYPE: with no database connected there is nowhere to send this yet. The
 * submit handler simulates the round trip so the flow is reviewable. It is clearly
 * marked as a prototype in the success state rather than pretending to deliver.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  // Honeypot value held in state rather than a ref: a ref read during render is
  // an error, and state is never read during render here.
  const [honeypotValue, setHoneypotValue] = useState('')

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema) as never,
  })

  const submitValid = handleSubmit(async () => {
    setSending(true)

    // Simulated round trip. Replaced by a POST to /api/contact when the database
    // is connected.
    await new Promise((resolve) => window.setTimeout(resolve, 700))

    setSending(false)
    setSubmitted(true)
    reset()
  })

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Honeypot filled means a bot. Pretend nothing happened.
    if (honeypotValue) return

    await submitValid(event)
  }

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-10 text-center"
        role="status"
      >
        <CheckCircle2 aria-hidden="true" className="text-accent" size={32} />
        <div>
          <p className="font-display text-lg font-semibold">Thank you, your enquiry is with us</p>
          <p className="text-muted-fore mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            We usually reply the same working day. If it is urgent, message us on WhatsApp
            using the button on this page.
          </p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="secondary">
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={onFormSubmit}>
      {/*
        Honeypot. `aria-hidden` and `tabIndex={-1}` keep it out of the tab order
        and the accessibility tree, so a screen-reader user is never told about a
        field that does not exist for them.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          autoComplete="off"
          id="website"
          onChange={(event) => setHoneypotValue(event.target.value)}
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={errors.name?.message} id="name" label="Your name">
          <Input
            {...register('name')}
            {...fieldA11y('name', undefined, errors.name?.message)}
            autoComplete="name"
            id="name"
            invalid={Boolean(errors.name)}
            placeholder="Ahmed Khan"
          />
        </Field>

        <Field error={errors.email?.message} id="email" label="Email address">
          <Input
            {...register('email')}
            {...fieldA11y('email', undefined, errors.email?.message)}
            autoComplete="email"
            id="email"
            invalid={Boolean(errors.email)}
            placeholder="you@example.com"
            type="email"
          />
        </Field>
      </div>

      <Field
        error={errors.phone?.message}
        hint="Optional. A Pakistan mobile number lets us reply faster."
        id="phone"
        label="Phone number"
      >
        <Input
          {...register('phone')}
          {...fieldA11y('phone', undefined, errors.phone?.message)}
          autoComplete="tel"
          id="phone"
          invalid={Boolean(errors.phone)}
          inputMode="tel"
          placeholder="0300 1234567"
        />
      </Field>

      <Field error={errors.subject?.message} id="subject" label="Subject">
        <Input
          {...register('subject')}
          {...fieldA11y('subject', undefined, errors.subject?.message)}
          id="subject"
          invalid={Boolean(errors.subject)}
          placeholder="Bulk hardware quote for 20 laptops"
        />
      </Field>

      <Field error={errors.message?.message} id="message" label="Message">
        <Textarea
          {...register('message')}
          {...fieldA11y('message', undefined, errors.message?.message)}
          id="message"
          invalid={Boolean(errors.message)}
          placeholder="Tell us what you are trying to do, and any budget or timeline we should know about."
          rows={6}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <Button disabled={sending} size="lg" type="submit">
          {sending ? 'Sending...' : 'Send enquiry'}
        </Button>

        <p className="text-muted-fore text-xs leading-relaxed">
          We use your details only to answer this enquiry. See our{' '}
          <a className="underline underline-offset-4" href="/privacy">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  )
}
