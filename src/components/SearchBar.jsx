import { TextField } from '@mui/material';

export default function SearchBar({ search, setSearch, placeholder = "Search..." }) {
  return (
    <TextField
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth
      sx={{ mb: 2 }}
    />
  );
}
