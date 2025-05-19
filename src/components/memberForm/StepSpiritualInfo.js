import { Grid, TextField, FormControlLabel, Checkbox } from '@mui/material';
import React from 'react';

const StepSpiritualInfo = React.memo(({ formValues, handleChange }) => {
  const handleInput = (e) => handleChange({ [e.target.name]: e.target.value });
  const handleCheckbox = (e) => handleChange({ [e.target.name]: e.target.checked });

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField fullWidth name="date_joined_church" label="Date Joined Church" type="date" InputLabelProps={{ shrink: true }} value={formValues.date_joined_church || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth name="date_born_again" label="Date Born Again" type="date" InputLabelProps={{ shrink: true }} value={formValues.date_born_again || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth name="date_baptized_immersion" label="Water Baptism Date" type="date" InputLabelProps={{ shrink: true }} value={formValues.date_baptized_immersion || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth name="date_received_holy_ghost" label="Holy Ghost Reception Date" type="date" InputLabelProps={{ shrink: true }} value={formValues.date_received_holy_ghost || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth name="foundation_school_grad_date" label="Foundation School Graduation" type="date" InputLabelProps={{ shrink: true }} value={formValues.foundation_school_grad_date || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Checkbox
              name="baptized_in_christ_embassy"
              checked={formValues.baptized_in_christ_embassy || false}
              onChange={handleCheckbox}
            />
          }
          label="Baptized in Christ Embassy?"
        />
      </Grid>
    </Grid>
  );
});

export default StepSpiritualInfo;