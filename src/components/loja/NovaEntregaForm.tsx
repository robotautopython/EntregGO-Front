'use client';

import { ArrowRight, Info, Loader2, MapPin, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Field';

import type { DeliveryDraft } from './delivery-types';

export interface DeliverySubmitError {
  title: string;
  message: string;
  details?: string[];
}

interface NovaEntregaFormProps {
  onSubmit: (draft: DeliveryDraft) => void;
  initialDraft?: DeliveryDraft;
  isSubmitting?: boolean;
  submitError?: DeliverySubmitError | null;
}

const MAX_ADDRESS = 240;
const MAX_NOTES = 500;

export function NovaEntregaForm({
  onSubmit,
  initialDraft,
  isSubmitting = false,
  submitError,
}: NovaEntregaFormProps) {
  const [destination, setDestination] = useState(initialDraft?.destinationAddress ?? '');
  const [notes, setNotes] = useState(initialDraft?.notes ?? '');
  const [destinationError, setDestinationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedDestination = destination.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedDestination) {
      setDestinationError('Informe o endereço de destino.');
      return;
    }

    if (trimmedDestination.length > MAX_ADDRESS) {
      setDestinationError(`Use no máximo ${MAX_ADDRESS} caracteres.`);
      return;
    }

    setDestinationError(null);
    onSubmit({
      destinationAddress: trimmedDestination,
      notes: trimmedNotes || undefined,
    });
  }

  return (
    <Card variant="white" className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <Send className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
            Solicitação real
          </p>
          <h2 className="text-2xl font-black text-asphalt-950 sm:text-3xl">
            Para onde a entrega vai?
          </h2>
        </div>
      </div>

      {submitError ? (
        <Alert tone="danger" title={submitError.title}>
          <p>{submitError.message}</p>
          {submitError.details?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {submitError.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Endereço de destino"
          required
          hint={`${destination.length}/${MAX_ADDRESS} caracteres — rua, número, bairro e complemento.`}
          error={destinationError ?? undefined}
        >
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-asphalt-950/45"
              aria-hidden="true"
            />
            <Input
              type="text"
              required
              autoFocus
              autoComplete="street-address"
              placeholder="Av. Brasil, 884, Centro, Apto 51"
              className="pl-10"
              maxLength={MAX_ADDRESS}
              value={destination}
              disabled={isSubmitting}
              invalid={Boolean(destinationError)}
              onChange={(event) => {
                setDestination(event.target.value);
                if (event.target.value.trim()) setDestinationError(null);
              }}
            />
          </div>
        </Field>

        <Field
          label="Observação"
          hint={`${notes.length}/${MAX_NOTES} caracteres — instruções para a entrega.`}
        >
          <Textarea
            maxLength={MAX_NOTES}
            rows={3}
            placeholder="Ex: deixar com o porteiro. Sacola transparente. Pedido frio."
            value={notes}
            disabled={isSubmitting}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <div className="rounded-md border border-dashed border-paper-line bg-paper p-4">
          <div className="flex items-start gap-3 text-sm text-asphalt-950/75">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-route-600" aria-hidden="true" />
            <p>
              A criação usa o contrato real <strong>POST /api/deliveries</strong>. Aceite,
              push, realtime, cancelamento e histórico ainda não fazem parte desta etapa.
            </p>
          </div>
        </div>

        <Alert tone="info" title="Sobre o endereço de coleta">
          O backend identifica sua loja pela sessão autenticada. O formulário envia apenas
          destino e observação.
        </Alert>

        <div className="flex flex-col gap-3 border-t border-paper-line pt-5 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            variant="primary"
            size="xl"
            width="full"
            className="sm:w-auto"
            disabled={!destination.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Criando...
              </>
            ) : (
              <>
                Criar solicitação
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
