import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Chip } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useUseCase } from '../../utils/use-case';

interface InputImportStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  hasJobsData?: boolean;
  hasVehiclesData?: boolean;
  hasJobsMapping?: boolean;
  hasVehiclesMapping?: boolean;
}

export const InputImportStepper: React.FC<InputImportStepperProps> = ({ 
  currentStep, 
  onStepChange, 
  hasJobsData = false, 
  hasVehiclesData = false,
  hasJobsMapping = false,
  hasVehiclesMapping = false
}) => {
  const useCase = useUseCase();
  const orderTypeLabel = useCase === 'jobs' ? 'Jobs' : 'Shipments';

  const steps = [
    {
      label: 'Preferences',
      icon: <TuneIcon fontSize="small" />,
      description: 'Configure optimization settings',
      isCompleted: true, // Preferences step is always considered complete
    },
    {
      label: orderTypeLabel,
      icon: <AssignmentIcon fontSize="small" />,
      description: 'Import and map job data',
      isCompleted: hasJobsData && hasJobsMapping,
    },
    {
      label: 'Vehicles',
      icon: <LocalShippingIcon fontSize="small" />,
      description: 'Import and map vehicle data',
      isCompleted: hasVehiclesData && hasVehiclesMapping,
    },
    {
      label: 'Review & Run',
      icon: <PlayArrowIcon fontSize="small" />,
      description: 'Review data and start optimization',
      isCompleted: false, // This step is never "completed" as it's the final step
    },
  ];

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2,
        width: '300px',
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
        Route Planning Workflow
      </Typography>
      
      {/* Progress indicator */}
      <Box sx={{ mb: 3, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#666', mr: 1 }}>
            Step {currentStep + 1} of {steps.length}:
          </Typography>
          <Chip 
            label={steps[currentStep].label}
            size="small"
            color="primary"
            variant="filled"
          />
        </Box>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          {steps[currentStep].description}
        </Typography>
      </Box>

      {/* Breadcrumb navigation */}
      <Box sx={{ mb: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
          Workflow Progress:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {steps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <Chip
                label={`${idx + 1}. ${step.label}`}
                size="small"
                variant={idx <= currentStep ? "filled" : "outlined"}
                color={idx === currentStep ? "primary" : idx < currentStep ? "success" : "default"}
                onClick={() => onStepChange(idx)}
                sx={{ 
                  cursor: 'pointer',
                  fontSize: '11px',
                  height: '24px'
                }}
              />
              {idx < steps.length - 1 && (
                <Typography variant="caption" sx={{ color: '#ccc', alignSelf: 'center' }}>
                  →
                </Typography>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      <List disablePadding>
        {steps.map((step, idx) => (
          <ListItem
            key={step.label}
            button
            selected={currentStep === idx}
            onClick={() => onStepChange(idx)}
            sx={{
              mb: 1,
              bgcolor: currentStep === idx ? 'rgba(211, 103, 132, 0.10)' : 'transparent',
              border: currentStep === idx ? '1px solid rgba(211, 103, 132, 1)' : 'none',
              borderWidth: currentStep === idx ? '1px 1px 1px 4px' : 'none',
              borderRadius: '0px 8px 8px 0px',
              width: currentStep === idx ? '97%' : '100%',
              paddingTop: '7px',
              paddingBottom: '7px',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: idx <= currentStep ? 'rgba(211, 103, 132, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Box sx={{ 
                color: idx <= currentStep ? 'primary.main' : '#ccc',
                opacity: idx <= currentStep ? 1 : 0.5
              }}>
                {step.icon}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={step.label}
              secondary={step.description}
              primaryTypographyProps={{ 
                fontWeight: currentStep === idx ? 600 : 500,
                fontSize: '14px'
              }}
              secondaryTypographyProps={{ 
                fontSize: '12px',
                color: idx <= currentStep ? '#666' : '#999'
              }}
            />
            {step.isCompleted && (
              <Chip 
                label="✓" 
                size="small" 
                color="success" 
                sx={{ 
                  width: '20px', 
                  height: '20px', 
                  fontSize: '12px',
                  '& .MuiChip-label': { px: 0 }
                }} 
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 