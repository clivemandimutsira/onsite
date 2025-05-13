import React, { useEffect, useState, useRef } from 'react';
import { Grid, TextField, CircularProgress } from '@mui/material';
import { checkDuplicateField } from '../../api/memberService';

const StepContactInfo = React.memo(({ formValues, handleChange }) => {
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loadingField, setLoadingField] = useState('');

  const debounceTimer = useRef(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    handleChange({ [name]: value.trimStart() });

    if (name === 'email' || name === 'contact_primary') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => validateUnique(name, value), 500);
    }
  };

  const validateUnique = async (field, value) => {
    if (!value) return;

    setLoadingField(field);
    try {
      const res = await checkDuplicateField(field, value);
      if (field === 'email') {
        setEmailError(res.exists ? 'This email is already in use' : '');
      } else {
        setPhoneError(res.exists ? 'This phone number is already registered' : '');
      }
    } catch (err) {
      if (field === 'email') {
        setEmailError('Error checking email');
      } else {
        setPhoneError('Error checking phone');
      }
    } finally {
      setLoadingField('');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          name="email"
          label="Email"
          type="email"
          value={formValues.email || ''}
          onChange={handleInput}
          error={Boolean(emailError)}
          helperText={emailError || (!formValues.email ? 'Required' : '')}
          InputProps={{
            endAdornment: loadingField === 'email' && <CircularProgress size={16} />
          }}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          required
          name="contact_primary"
          label="Primary Contact"
          value={formValues.contact_primary || ''}
          onChange={handleInput}
          error={Boolean(phoneError)}
          helperText={phoneError || (!formValues.contact_primary ? 'Required' : '')}
          InputProps={{
            endAdornment: loadingField === 'contact_primary' && <CircularProgress size={16} />
          }}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          name="contact_secondary"
          label="Secondary Contact"
          value={formValues.contact_secondary || ''}
          onChange={handleInput}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          name="physical_address"
          label="Physical Address"
          value={formValues.physical_address || ''}
          onChange={handleInput}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          name="nationality"
          label="Nationality"
          value={formValues.nationality || ''}
          onChange={handleInput}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          name="num_children"
          label="Number of Children"
          type="number"
          value={formValues.num_children || ''}
          onChange={handleInput}
        />
      </Grid>
    </Grid>
  );
});

export default StepContactInfo;
