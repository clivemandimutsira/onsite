import { Pencil, Trash2, X, Download } from 'lucide-react';
import { IconButton, Tooltip, useTheme } from '@mui/material';

export const EditIcon = ({ onClick, bare = false }) => {
  const theme = useTheme();
  const icon = <Pencil size={20} />;
  
  const iconColor = theme.palette.mode === 'dark' ? 'lightgray' : 'primary';

  if (bare) return icon;

  return (
    <Tooltip title="Edit">
      <IconButton onClick={onClick} color={iconColor}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export const DeleteIcon = ({ onClick, bare = false }) => {
  const theme = useTheme();
  const icon = <Trash2 size={20} />;
  
  const iconColor = theme.palette.mode === 'dark' ? 'lightgray' : 'error';

  if (bare) return icon;

  return (
    <Tooltip title="Delete">
      <IconButton onClick={onClick} color={iconColor}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export const CloseIcon = ({ onClick, bare = false }) => {
  const theme = useTheme();
  const icon = <X size={20} />;
  
  const iconColor = theme.palette.mode === 'dark' ? 'lightgray' : 'default';

  if (bare) return icon;

  return (
    <Tooltip title="Close">
      <IconButton onClick={onClick} color={iconColor}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export const DownloadIcon = ({ onClick, bare = false }) => {
  const theme = useTheme();
  const icon = <Download size={20} />;
  
  const iconColor = theme.palette.mode === 'dark' ? 'lightgray' : 'secondary';

  if (bare) return icon;

  return (
    <Tooltip title="Download">
      <IconButton onClick={onClick} color={iconColor}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};
