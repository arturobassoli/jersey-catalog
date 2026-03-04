'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

const supabase = createClient();

interface DeleteButtonProps {
  jerseyId: string;
}

export default function DeleteButton({ jerseyId }: DeleteButtonProps) {
  const t = useTranslations('deleteButton');
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(t('confirm'))) return;

    setDeleting(true);
    const { error } = await supabase
      .from('jerseys')
      .delete()
      .eq('id', jerseyId);

    if (error) {
      console.error('Delete error:', error);
      setDeleting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={deleting}
      className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400"
    >
      {deleting ? t('deleting') : t('delete')}
    </Button>
  );
}
