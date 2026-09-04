import { redirect } from 'next/navigation';
import { verifyAdminAccess } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const auth = await verifyAdminAccess();
  if (auth.isAdmin) {
    redirect('/dashboard');
  } else {
    redirect('/admin/login');
  }
}
