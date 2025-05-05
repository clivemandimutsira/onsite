import { Grid, TextField } from '@mui/material';
import React from 'react';

const StepProfessionalInfo = React.memo(({ formValues, handleChange }) => {
  const handleInput = (e) => handleChange({ [e.target.name]: e.target.value.trimStart() });

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField fullWidth name="profession" label="Profession" value={formValues.profession || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth name="occupation" label="Occupation" value={formValues.occupation || ''} onChange={handleInput} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth name="work_address" label="Work Address" value={formValues.work_address || ''} onChange={handleInput} />
      </Grid>
    </Grid>
  );
});

export default StepProfessionalInfo;
