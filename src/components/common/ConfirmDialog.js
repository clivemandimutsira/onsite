import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ConfirmDialog = ({ open, title, content, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title || 'Confirm Action'}</DialogTitle>
    <DialogContent>{content || 'Are you sure you want to proceed?'}</DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color="error">Yes</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
