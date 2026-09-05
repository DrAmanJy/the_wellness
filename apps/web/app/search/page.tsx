import { redirect } from 'next/navigation';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || params.search || '';
  if (query.trim()) {
    redirect(`/products?search=${encodeURIComponent(query.trim())}`);
  } else {
    redirect('/products');
  }
}
