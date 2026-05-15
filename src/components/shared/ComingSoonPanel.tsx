import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/shell/PageHeader';

interface ComingSoonPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  checkpoints?: string[];
}

export function ComingSoonPanel({
  eyebrow,
  title,
  description,
  checkpoints = [],
}: ComingSoonPanelProps) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Card variant="white" className="space-y-4">
        <Badge tone="paper">Em preparação</Badge>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-asphalt-950">Área reservada</h2>
          <p className="max-w-2xl text-sm leading-6 text-asphalt-950/70">
            Esta página já está roteada para evitar tela vazia, mas a operação real entra em
            um ciclo próprio com contrato, segurança e validação.
          </p>
        </div>

        {checkpoints.length > 0 ? (
          <ul className="grid gap-2 text-sm text-asphalt-950/75">
            {checkpoints.map((checkpoint) => (
              <li
                key={checkpoint}
                className="rounded-md border border-paper-line bg-paper px-3 py-2 font-semibold"
              >
                {checkpoint}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
