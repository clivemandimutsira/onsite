import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Button,
  Stack,
  Autocomplete,
  MenuItem,
  useTheme,
  Divider,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Plus } from 'lucide-react';

export default function NewConvertFormDialog({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  members,
  isEditMode = false,
}) {
  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'baptism_scheduled' ? value === 'yes' : value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditMode ? 'Edit New Convert' : 'Add New Convert'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Member Name */}
          <Autocomplete
            freeSolo
            options={members.map((m) => `${m.first_name} ${m.surname}`)}
            value={form.member_name}
            onChange={(e, newValue) => {
              const matched = members.find(
                (m) => `${m.first_name} ${m.surname}` === newValue
              );
              setForm(prev => ({
                ...prev,
                member_name: newValue || '',
                member_id: matched ? matched.id : '',
              }));
            }}
            onInputChange={(e, newInputValue) =>
              setForm(prev => ({ ...prev, member_name: newInputValue }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Member Name" fullWidth />
            )}
          />

          {/* Conversion Date */}
          <TextField
            label="Conversion Date"
            name="conversion_date"
            type="date"
            value={form.conversion_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Conversion Type */}
          <Autocomplete
            freeSolo
            options={['Salvation', 'Rededication', 'Water Baptism', 'Holy Spirit Baptism']}
            value={form.conversion_type}
            onChange={(e, newValue) =>
              setForm(prev => ({ ...prev, conversion_type: newValue || '' }))
            }
            onInputChange={(e, newInputValue) =>
              setForm(prev => ({ ...prev, conversion_type: newInputValue }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Conversion Type" fullWidth />
            )}
          />

          {/* Baptism Scheduled */}
          <TextField
            select
            label="Baptism Scheduled?"
            name="baptism_scheduled"
            value={form.baptism_scheduled ? 'yes' : 'no'}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>

          {/* Baptism Date (Conditional) */}
          {form.baptism_scheduled && (
            <TextField
              label="Baptism Date"
              name="baptism_date"
              type="date"
              value={form.baptism_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={onSubmit}
            startIcon={<Plus />}
            fullWidth
          >
            {isEditMode ? 'Update' : 'Add'} New Convert
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
