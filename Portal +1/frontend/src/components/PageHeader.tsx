import { Stack, Typography } from '@mui/material';
import { BackButton } from './BackButton';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  fallback?: string;
};

export function PageHeader({ title, subtitle, showBack = true, fallback }: Props) {
  return (
    <Stack spacing={0.75}>
      {showBack && <BackButton fallback={fallback} />}
      <Typography variant="h4">{title}</Typography>
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Stack>
  );
}
