import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useUseCase } from '../../utils/use-case';

interface InputImportStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export const InputImportStepper: React.FC<InputImportStepperProps> = ({ currentStep, onStepChange }) => {
  const useCase = useUseCase();
  const orderTypeLabel = useCase === 'jobs' ? 'Jobs' : 'Shipments';

  const steps = [
    {
      label: 'Preferences',
      icon: <TuneIcon fontSize="small" />,
    },
    {
      label: orderTypeLabel,
      icon: <AssignmentIcon fontSize="small" />,
    },
    {
      label: 'Vehicles',
      icon: <LocalShippingIcon fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2,
        width: '265px',
        position: 'sticky',
        top: '32px',
        background: '#fff',
        border: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          pb: 1,
          mb: 2,
          borderBottom: '1px solid #e0e0e0',
          fontSize: '16px',
          padding: '10px 20px',
        }}
      >
        Inputs for PlanPath-AI
      </Typography>
      <List disablePadding>
        {steps.map((step, idx) => (
          <ListItem
            key={step.label}
            button
            selected={currentStep === idx}
            onClick={() => onStepChange(idx)}
            sx={{
              mb: 1,
              bgcolor: currentStep === idx ? 'rgba(51, 103, 241, 0.10)' : 'transparent',
              border: currentStep === idx ? '1px solid rgba(30, 85, 222, 1)' : 'none',
              borderWidth: currentStep === idx ? '1px 1px 1px 4px' : 'none',
              borderRadius: '0px 8px 8px 0px',
              width: currentStep === idx ? '97%' : '100%',
              paddingTop: '7px',
              paddingBottom: '7px',
              cursor: 'pointer',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{step.icon}</ListItemIcon>
            <ListItemText
              primary={step.label}
              primaryTypographyProps={{ fontWeight: 500 }}
              sx={{ fontSize: '14px' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 