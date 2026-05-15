'use client';

import { ArrowRight, Info, MapPin, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Field';

import type { DeliveryDraft } from './delivery-types';

interface NovaEntregaFormProps {
  onSubmit: (draft: DeliveryDraft) => void;
  initialDraft?: DeliveryDraft;
}

const MAX_NOTES = 200;

export function NovaEntregaForm({ onSubmit, initialDraft }: NovaEntregaFormProps) {
  const [destination, setDestination] = useState(initialDraft?.destinationAddress ?? '');
  const [details, setDetails] = useState(initialDraft?.destinationDetails ?? '');
  const [notes, setNotes] = useState(initialDraft?.notes ?? '');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination.trim()) return;
    onSubmit({
      destinationAddress: destination.trim(),
      destinationDetails: details.trim() || undefined,
      notes: notes.trim() || undefined,
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
            Prévia de solicitação
          </p>
          <h2 className="text-2xl font-black text-asphalt-950 sm:text-3xl">
            Para onde a entrega vai?
          </h2>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Endereço de destino"
          required
          hint="Rua, número, bairro. O motoboy precisa achar na hora."
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
              placeholder="Av. Brasil, 884"
              className="pl-10"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>
        </Field>

        <Field label="Complemento" hint="Apartamento, sala, ponto de referência (opcional).">
          <Input
            type="text"
            placeholder="Apto 51 — Bloco B"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        </Field>

        <Field
          label="Observação"
          hint={`${notes.length}/${MAX_NOTES} caracteres — instruções pro motoboy.`}
        >
          <Textarea
            maxLength={MAX_NOTES}
            rows={3}
            placeholder="Ex: deixar com o porteiro. Sacola transparente. Pedido frio."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <div className="rounded-md border border-dashed border-paper-line bg-paper p-4">
          <div className="flex items-start gap-3 text-sm text-asphalt-950/75">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-route-600" aria-hidden="true" />
            <p>
              Nesta prévia, o envio simula uma busca de <strong>60 segundos</strong>.
              O disparo real para motoboys ainda depende do backend de entregas.
            </p>
          </div>
        </div>

        <Alert tone="info" title="Sobre o endereço de coleta">
          Na versão real, o endereço da loja acompanha a solicitação depois que o endpoint existir.
        </Alert>

        <div className="flex flex-col gap-3 border-t border-paper-line pt-5 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            variant="primary"
            size="xl"
            width="full"
            className="sm:w-auto"
            disabled={!destination.trim()}
          >
            Simular envio
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
