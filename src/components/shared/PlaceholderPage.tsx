type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-[#fffaf4] px-6 py-10">
      <section className="mx-auto max-w-4xl space-y-3">
        <p className="text-sm font-bold text-brand-600">EntregGO</p>
        <h1 className="text-3xl font-black text-asphalt-950">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600">{description}</p>
      </section>
    </main>
  );
}
