// components/common/MemberAutoComplete.js
import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { getMembers } from '../../api/memberService';

const MemberAutoComplete = ({ value, onChange, label = "Member", ...props }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMembers();
        setMembers(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getSelectedMember = () => members.find((m) => m.id === value) || null;

  return (
    <Autocomplete
      options={members}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : `${option.first_name} ${option.surname}`
      }
      value={getSelectedMember()}
      onChange={(_, newVal) => onChange(newVal?.id || '')}
      loading={loading}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      {...props}
    />
  );
};

export default MemberAutoComplete;
