import { redirect } from 'next/navigation';

// Root path fallback: redirect to default locale.
// The next-intl middleware handles this for most requests,
// but this page prevents Turbopack from panicking on the /page endpoint.
export default function RootPage() {
  redirect('/en');
}
