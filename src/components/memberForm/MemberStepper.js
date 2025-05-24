import React, { useState, useEffect, useMemo } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import SnackbarAlert from '../common/SnackbarAlert'; // Use SnackbarAlert
import StepPersonalInfo from './StepPersonalInfo';
import StepContactInfo from './StepContactInfo';
import StepSpiritualInfo from './StepSpiritualInfo';
import StepProfessionalInfo from './StepProfessionalInfo';
import StepSummary from './StepSummary';
import { createMember, getMembers } from '../../api/memberService';

const steps = [
  'Personal Info',
  'Contact Info',
  'Spiritual Info',
  'Professional Info',
  'Summary',
];

const MemberStepper = ({
  initialValues = {},
  onSubmit,
  isEditMode = false,
  onSuccess,
}) => {
  const theme = useTheme(); // Access the current theme
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [existingPhones, setExistingPhones] = useState(new Set());
  const [existingEmails, setExistingEmails] = useState(new Set());

  // Load phone numbers and emails for duplication check
  useEffect(() => {
    const loadDuplicates = async () => {
      try {
        const members = await getMembers();
        const phones = new Set(
          members
            .filter((m) => m.contact_primary)
            .map((m) => m.contact_primary.trim().toLowerCase())
        );
        const emails = new Set(
          members
            .filter((m) => m.email)
            .map((m) => m.email.trim().toLowerCase())
        );
        setExistingPhones(phones);
        setExistingEmails(emails);
      } catch (err) {
        console.warn('Failed to load members for duplicate checking');
      }
    };
    loadDuplicates();
  }, []);

  const stableInitialValues = useMemo(() => initialValues, [initialValues]);

  useEffect(() => {
    if (isEditMode && Object.keys(stableInitialValues).length > 0) {
      setFormValues(stableInitialValues);
    }
  }, [stableInitialValues, isEditMode]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (newValues) => {
    setFormValues((prev) => ({ ...prev, ...newValues }));
  };

  const handleFile = (file) => {
    setProfilePhoto(file);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      'first_name',
      'surname',
      'email',
      'contact_primary',
      'gender',
    ];
    const missingFields = requiredFields.filter(
      (field) => !formValues[field] || formValues[field].trim() === ''
    );

    if (missingFields.length > 0) {
      showSnackbar(
        `Please fill: ${missingFields.map((f) => f.replace(/_/g, ' ')).join(', ')}`,
        'error'
      );
      return;
    }

    // Normalize for duplicate checks
    const normalizedPhone = formValues.contact_primary.trim().toLowerCase();
    const normalizedEmail = formValues.email.trim().toLowerCase();

    if (!isEditMode) {
      if (existingPhones.has(normalizedPhone)) {
        showSnackbar('This phone number already exists.', 'error');
        return;
      }
      if (existingEmails.has(normalizedEmail)) {
        showSnackbar('This email address already exists.', 'error');
        return;
      }
    }

    const data = new FormData();
    for (let key in formValues) {
      data.append(key, formValues[key]);
    }
    if (profilePhoto) {
      data.append('profile_photo', profilePhoto);
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && onSubmit) {
        await onSubmit(data, showSnackbar, setActiveStep, setFormValues, setProfilePhoto);
      } else {
        await createMember(data);
        showSnackbar('Member registered successfully!', 'success');
        setActiveStep(0);
        setFormValues({});
        setProfilePhoto(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      showSnackbar('Error submitting form: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    const props = { formValues, handleChange, handleFile };
    switch (step) {
      case 0:
        return <StepPersonalInfo {...props} />;
      case 1:
        return <StepContactInfo {...props} />;
      case 2:
        return <StepSpiritualInfo {...props} />;
      case 3:
        return <StepProfessionalInfo {...props} />;
      case 4:
        return (
          <StepSummary
            values={formValues}
            profilePhoto={profilePhoto}
            handleFile={handleFile}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        {getStepContent(activeStep)}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              },
            }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default MemberStepper;
