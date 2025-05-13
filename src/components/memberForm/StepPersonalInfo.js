import { Grid, TextField, MenuItem } from '@mui/material';
import React from 'react';

const StepPersonalInfo = React.memo(({ formValues, handleChange }) => {
  const handleInput = (e) => handleChange({ [e.target.name]: e.target.value.trimStart() });

  const titles = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  const nationalities = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Antiguans', 'Argentinean', 'Armenian', 'Australian',
    'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Barbudans', 'Batswana', 'Belarusian', 'Belgian',
    'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe',
    'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese',
    'Colombian', 'Comorian', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djiboutian',
    'Dominican', 'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian',
    'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian',
    'Guatemalan', 'Guinea-Bissauan', 'Guinean', 'Guyanese', 'Haitian', 'Honduran', 'Hungarian', 'I-Kiribati', 'Icelander', 'Indian',
    'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakhstani',
    'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyzstani', 'Laotian', 'Latvian', 'Lebanese', 'Lesotho', 'Liberian', 'Libyan',
    'Liechtensteiner', 'Lithuanian', 'Luxembourger', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivian', 'Malian',
    'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan', 'Mongolian', 'Moroccan',
    'Mozambican', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander', 'Nicaraguan', 'Nigerian', 'Nigerien', 'North Korean',
    'Northern Irish', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Panamanian', 'Papua New Guinean', 'Paraguayan', 'Peruvian',
    'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran', 'Samoan', 'San Marinese',
    'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian', 'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovakian',
    'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean', 'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamese',
    'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajikistani', 'Tanzanian', 'Thai', 'Togolese', 'Tongan', 'Trinidadian or Tobagonian',
    'Tunisian', 'Turkish', 'Tuvaluan', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Vanuatuan', 'Venezuelan', 'Vietnamese',
    'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          required
          select
          name="title"
          label="Title"
          value={formValues.title || ''}
          onChange={handleInput}
        >
          {titles.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          required
          name="first_name"
          label="First Name"
          value={formValues.first_name || ''}
          onChange={handleInput}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          required
          name="surname"
          label="Surname"
          value={formValues.surname || ''}
          onChange={handleInput}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          name="date_of_birth"
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formValues.date_of_birth || ''}
          onChange={handleInput}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          select
          required
          name="gender"
          label="Gender"
          value={formValues.gender || ''}
          onChange={handleInput}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          select
          required
          name="marital_status"
          label="Marital Status"
          value={formValues.marital_status || ''}
          onChange={handleInput}
        >
          {maritalStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          select
          name="nationality"
          label="Nationality"
          value={formValues.nationality || ''}
          onChange={handleInput}
        >
          {nationalities.map((nation) => (
            <MenuItem key={nation} value={nation}>
              {nation}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
});

export default StepPersonalInfo;
