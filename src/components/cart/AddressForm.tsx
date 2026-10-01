'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { addressSchema, PROVINCES, type AddressInput } from '@/lib/address'
import { useCartStore, type SavedAddress } from '@/lib/cart-store'
import { Field, Input, Select, Textarea, fieldA11y } from '@/components/ui/Field'

type FormValues = {
  city: string
  line1: string
  line2: string
  notes: string
  postalCode: string
  province: string
}

function toFormValues(address: SavedAddress | null): FormValues {
  return {
    city: address?.city ?? '',
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    notes: address?.notes ?? '',
    postalCode: address?.postalCode ?? '',
    province: address?.province ?? '',
  }
}

/**
 * Pakistan delivery address form, used at basket checkout.
 *
 * The province list is the seven verified top-level units. The postal code is
 * validated as five digits with the expected format shown on rejection, rather
 * than a bare "invalid".
 */
export function AddressForm({
  onSubmit,
  onUseSaved,
}: {
  onSubmit: (address: AddressInput) => void
  onUseSaved: (() => void) | null
}) {
  const savedAddress = useCartStore((state) => state.savedAddress)
  const saveAddress = useCartStore((state) => state.saveAddress)

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<FormValues>({
    // react-hook-form holds strings; Zod validates and produces the final shape.
    defaultValues: toFormValues(savedAddress),
    resolver: zodResolver(addressSchema) as never,
  })

  const submit = (values: FormValues) => {
    const parsed = addressSchema.safeParse(values)

    if (!parsed.success) return

    onSubmit(parsed.data)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
      {/*
        Disclosure required by spec FR-021. The address is stored on this device
        only and is never written to the business's records unless the enquiry
        that includes it is actually sent.
      */}
      <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-fore">
        We use your address to prepare your enquiry. If you tick &lsquo;remember this
        address&rsquo;, it is saved on this device only and is not sent to our servers.
      </p>

      {onUseSaved ? (
        <button
          className="min-h-11 cursor-pointer rounded-lg border border-accent px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/5"
          onClick={() => {
            if (!savedAddress) return
            const values = toFormValues(savedAddress)
            setValue('city', values.city)
            setValue('line1', values.line1)
            setValue('line2', values.line2 ?? '')
            setValue('notes', values.notes ?? '')
            setValue('postalCode', values.postalCode)
            setValue('province', values.province)
            onUseSaved()
          }}
          type="button"
        >
          Use my saved address
        </button>
      ) : null}

      <Field error={errors.line1?.message} id="line1" label="Street address">
        <Input
          {...register('line1')}
          {...fieldA11y('line1', undefined, errors.line1?.message)}
          autoComplete="address-line1"
          id="line1"
          invalid={Boolean(errors.line1)}
          placeholder="House 12, Street 4"
        />
      </Field>

      <Field error={errors.line2?.message} id="line2" label="Area or landmark (optional)">
        <Input
          {...register('line2')}
          {...fieldA11y('line2', undefined, errors.line2?.message)}
          autoComplete="address-line2"
          id="line2"
          invalid={Boolean(errors.line2)}
          placeholder="Gulberg III"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.city?.message} id="city" label="City">
          <Input
            {...register('city')}
            {...fieldA11y('city', undefined, errors.city?.message)}
            autoComplete="address-level2"
            id="city"
            invalid={Boolean(errors.city)}
            placeholder="Lahore"
          />
        </Field>

        <Field error={errors.postalCode?.message} id="postalCode" label="Postal code">
          <Input
            {...register('postalCode')}
            {...fieldA11y('postalCode', 'Five digits, for example 54660', errors.postalCode?.message)}
            autoComplete="postal-code"
            id="postalCode"
            inputMode="numeric"
            invalid={Boolean(errors.postalCode)}
            maxLength={5}
            placeholder="54660"
          />
        </Field>
      </div>

      <Field error={errors.province?.message} id="province" label="Province or territory">
        <Select
          {...register('province')}
          {...fieldA11y('province', undefined, errors.province?.message)}
          id="province"
          invalid={Boolean(errors.province)}
        >
          <option value="">Select a province</option>
          {PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        error={errors.notes?.message}
        hint="Anything that helps the delivery, for example the best time to call."
        id="notes"
        label="Delivery notes (optional)"
      >
        <Textarea
          {...register('notes')}
          {...fieldA11y('notes', undefined, errors.notes?.message)}
          id="notes"
          invalid={Boolean(errors.notes)}
          placeholder="Please call before delivery"
          rows={3}
        />
      </Field>

      <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm">
        <input
          className="mt-1 size-4 cursor-pointer accent-[var(--color-accent)]"
          onChange={(event) => {
            if (!event.target.checked) {
              saveAddress(null)
              return
            }
            void handleSubmit((values) => {
              const parsed = addressSchema.safeParse(values)
              if (parsed.success) saveAddress(parsed.data)
            })()
          }}
          type="checkbox"
        />
        <span>Remember this address on this device</span>
      </label>
    </form>
  )
}
