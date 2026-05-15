'use client';

import { Bike, Loader2, Save, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import type { AuthContext } from '@/types/auth';

interface MotoboyPerfilProps {
  authContext: AuthContext;
}

export function MotoboyPerfil({ authContext }: MotoboyPerfilProps) {
  const [fullName, setFullName] = useState('');
  const [snapshot, setSnapshot] = useState('');
  const [, setBikePhoto] = useState<File | null>(null);
  const [, setLicensePhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = fullName !== snapshot;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSnapshot(fullName);
      setSaving(false);
      setSaved(true);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sua identidade na rua"
        title="Meu perfil"
        description="Suas fotos passam pela central antes de operar — mantenha sempre atualizadas."
      />

      <Card variant="white">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-asphalt-950 text-white">
            <Bike className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              Conta
            </p>
            <p className="truncate text-lg font-black text-asphalt-950">{authContext.user.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone="success" pulsing>
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                {authContext.user.status}
              </Badge>
              <Badge tone="paper">motoboy</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="white">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Field label="Nome completo" required hint="Como aparece na CNH.">
            <Input
              required
              placeholder="Ex: João Marques"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <UploadDropzone
              label="Foto da moto"
              hint="A central confere antes de aprovar."
              shape="wide"
              onChange={setBikePhoto}
            />
            <UploadDropzone
              label="Foto da CNH"
              hint="Documento legível, com nome visível."
              shape="wide"
              onChange={setLicensePhoto}
            />
          </div>

          {saved ? <Alert tone="success">Perfil atualizado.</Alert> : null}

          <div className="flex flex-col gap-3 border-t border-paper-line pt-5 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!dirty || saving}
              className="sm:w-auto"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Salvando...' : 'Salvar mudanças'}
            </Button>
          </div>
        </form>
      </Card>

      <Card variant="paper" className="border-dashed">
        <p className="text-sm font-bold text-asphalt-950">Construindo este perfil</p>
        <p className="mt-1 text-xs text-asphalt-950/65">
          O endpoint <code className="font-mono text-asphalt-950">PATCH /api/couriers/me</code> e o
          upload das fotos entram numa próxima etapa — o formulário acima é o destino visual final.
        </p>
      </Card>
    </div>
  );
}
