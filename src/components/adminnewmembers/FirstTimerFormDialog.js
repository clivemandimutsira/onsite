import React from 'react';
import {
  Dialog,
  TextField,
  Button,
  Stack,
  Autocomplete,
  MenuItem,
  Typography,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Divider,
  Box,
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
    setForm((prev) => ({
      ...prev,
      [name]: name === 'baptism_scheduled' ? value === 'yes' : value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: theme.shadows[3],
        }}
      >
        <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {isEditMode ? 'Edit New Convert' : 'Add New Convert'}
            </Typography>
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Member Search Filter */}
          <Autocomplete
            freeSolo
            options={members.map((m) => `${m.first_name} ${m.surname}`)}
            value={form.member_name}
            onChange={(e, newValue) => {
              const matched = members.find(
                (m) => `${m.first_name} ${m.surname}` === newValue
              );
              setForm((prev) => ({
                ...prev,
                member_name: newValue || '',
                member_id: matched ? matched.id : '',
              }));
            }}
            onInputChange={(e, newInputValue) =>
              setForm((prev) => ({ ...prev, member_name: newInputValue }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Member Name" fullWidth />
            )}
            sx={{ mb: 3 }}
          />

          {/* Form Fields */}
          <Stack spacing={3}>
            <TextField
              label="Conversion Date"
              name="conversion_date"
              type="date"
              value={form.conversion_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Autocomplete
              freeSolo
              options={[
                'Salvation',
                'Rededication',
                'Water Baptism',
                'Holy Spirit Baptism',
              ]}
              value={form.conversion_type}
              onChange={(e, newValue) =>
                setForm((prev) => ({
                  ...prev,
                  conversion_type: newValue || '',
                }))
              }
              onInputChange={(e, newInputValue) =>
                setForm((prev) => ({ ...prev, conversion_type: newInputValue }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Conversion Type" fullWidth />
              )}
            />

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

            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={onSubmit}
              fullWidth
            >
              {isEditMode ? 'Update' : 'Add'} New Convert
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Dialog>
  );
}
