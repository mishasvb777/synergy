import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { locale } from '../locale';

type Props = {
  fallback?: string;
};

export function BackButton({ fallback = '/' }: Props) {
  const navigate = useNavigate();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      variant="text"
      onClick={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate(fallback);
      }}
      sx={{ alignSelf: 'flex-start', px: 0, mb: 0.5, color: 'text.secondary' }}
    >
      {locale.common.back}
    </Button>
  );
}
