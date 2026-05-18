'use client';

import { Loader2, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import type { AuthContext } from '@/types/auth';

interface LojaPerfilProps {
  authContext: AuthContext;
}

interface ProfileDraft {
  storeName: string;
  ownerName: string;
  address: string;
  description: string;
}

const initialDraft: ProfileDraft = {
  storeName: '',
  ownerName: '',
  address: '',
  description: '',
};

export function LojaPerfil({ authContext }: LojaPerfilProps) {
  const [draft, setDraft] = useState<ProfileDraft>(initialDraft);
  const [snapshot, setSnapshot] = useState<ProfileDraft>(initialDraft);
  const [, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty =
    draft.storeName !== snapshot.storeName ||
    draft.ownerName !== snapshot.ownerName ||
    draft.address !== snapshot.address ||
    draft.description !== snapshot.description;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSnapshot(draft);
      setSaving(false);
      setSaved(true);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Identidade"
        title="Perfil da loja"
        description="Como sua loja aparece pros motoboys. Mantenha o nome, endereço e logo atualizados."
      />

      <Card variant="white">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <UploadDropzone
              label="Logo da loja"
              hint="Aparece junto da solicitação. Imagem quadrada fica melhor."
              shape="square"
              onChange={setLogo}
            />

            <div className="space-y-5">
              <Field label="Nome da loja" required>
                <Input
                  required
                  placeholder="Ex: Açaí da Esquina"
                  value={draft.storeName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, storeName: event.target.value }))
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Responsável" required>
                  <Input
                    required
                    placeholder="Nome do dono"
                    value={draft.ownerName}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, ownerName: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Endereço" required>
                  <Input
                    required
                    placeholder="Rua, número, bairro"
                    value={draft.address}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Descrição" hint="Aparece pros motoboys junto da logo.">
                <Textarea
                  rows={3}
                  maxLength={500}
                  placeholder="O que sua loja faz?"
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </Field>

              <div className="rounded-md border border-paper-line bg-paper p-4 text-xs text-asphalt-950/70">
                <p>
                  <span className="font-bold text-asphalt-950">Email cadastrado:</span>{' '}
                  {authContext.user.email}
                </p>
                <p className="mt-1">
                  Mudanças aqui não alteram o email da conta — só o que aparece pros motoboys.
                </p>
              </div>
            </div>
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
        <p className="text-sm font-bold text-asphalt-950">Perfil da loja</p>
        <p className="mt-1 text-xs text-asphalt-950/65">
          Mantenha nome, endereço e contato atualizados para facilitar suas próximas entregas.
        </p>
      </Card>
    </div>
  );
}
