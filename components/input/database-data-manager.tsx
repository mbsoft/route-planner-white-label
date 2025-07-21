import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import dayjs from 'dayjs';
import { useLanguage } from '../../contexts/language-context';


interface Job {
  id: string;
  description: string;
  time_window_start: number;
  time_window_end: number;
  [key: string]: any;
}

interface Vehicle {
  id: string;
  description: string;
  start_location: string;
  end_location: string;
  [key: string]: any;
}

interface DatabaseDataManagerProps {
  onJobsImported: (jobs: Job[]) => void;
}

interface VehicleDatabaseManagerProps {
  onVehiclesImported: (vehicles: Vehicle[]) => void;
}

export const DatabaseDataManager: React.FC<DatabaseDataManagerProps> = ({ onJobsImported }) => {
  const { t } = useLanguage();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState<number | null>(null);

  // Fetch record count when start/end times or search change
  useEffect(() => {
    const fetchRecordCount = async () => {
      try {
        const startTimestamp = start ? Math.floor(new Date(start).getTime() / 1000) : undefined;
        const endTimestamp = end ? Math.floor(new Date(end).getTime() / 1000) : undefined;
        
        let url = '/api/jobs';
        const params = new URLSearchParams();
        if (startTimestamp) params.append('start', startTimestamp.toString());
        if (endTimestamp) params.append('end', endTimestamp.toString());
        if (search.trim()) params.append('search', search.trim());
        if (params.toString()) url += '?' + params.toString();
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch jobs count');
        const data = await res.json();
        setRecordCount(data.jobs?.length || 0);
      } catch (e: any) {
        console.error('Error fetching record count:', e);
        setRecordCount(null);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchRecordCount, 500);
    return () => clearTimeout(timeoutId);
  }, [start, end, search]);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const startTimestamp = start ? Math.floor(new Date(start).getTime() / 1000) : undefined;
      const endTimestamp = end ? Math.floor(new Date(end).getTime() / 1000) : undefined;
      
      let url = '/api/jobs';
      const params = new URLSearchParams();
      if (startTimestamp) params.append('start', startTimestamp.toString());
      if (endTimestamp) params.append('end', endTimestamp.toString());
      if (search.trim()) params.append('search', search.trim());
      if (params.toString()) url += '?' + params.toString();
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
      onJobsImported(data.jobs || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorageIcon color="primary" />
        {t('dataImport.importJobsFromDatabase')}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('dataImport.startTimeOptional')}
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
          InputLabelProps={{ 
            shrink: true,
            sx: { fontSize: '14px' }
          }}
          size="small"
          helperText={t('dataImport.leaveEmptyToImportAll')}
          FormHelperTextProps={{ sx: { fontSize: '13px' } }}
          inputProps={{
            style: { fontSize: '14px' }
          }}
        />
        <TextField
          label={t('dataImport.endTimeOptional')}
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
          InputLabelProps={{ 
            shrink: true,
            sx: { fontSize: '14px' }
          }}
          size="small"
          helperText={t('dataImport.leaveEmptyToImportAll')}
          FormHelperTextProps={{ sx: { fontSize: '13px' } }}
          inputProps={{
            style: { fontSize: '14px' }
          }}
        />
        <TextField
          label={t('dataImport.searchDescriptionOptional')}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          placeholder={t('dataImport.enterSearchTerm')}
          helperText={t('dataImport.caseInsensitiveSearch')}
          InputLabelProps={{ sx: { fontSize: '14px' } }}
          FormHelperTextProps={{ sx: { fontSize: '13px' } }}
          inputProps={{
            style: { fontSize: '14px' }
          }}
          sx={{ minWidth: 200 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
          <Button 
            variant="contained" 
            onClick={handleImport} 
            disabled={loading}
            sx={{ mt: '-15px' }}
          >
            {loading ? <CircularProgress size={20} /> : t('buttons.import')}
          </Button>
        </Box>
      </Box>
      
      {recordCount !== null && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '14px' }}>
          {recordCount} {recordCount !== 1 ? t('dataImport.recordsWillBeImported') : t('dataImport.recordWillBeImported')}
        </Typography>
      )}
      
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      
      {jobs.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell>{job.id}</TableCell>
                  <TableCell>{job.description}</TableCell>
                  <TableCell>{job.time_window_start ? dayjs.unix(job.time_window_start).format('YYYY-MM-DD HH:mm') : ''}</TableCell>
                  <TableCell>{job.time_window_end ? dayjs.unix(job.time_window_end).format('YYYY-MM-DD HH:mm') : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export const VehicleDatabaseManager: React.FC<VehicleDatabaseManagerProps> = ({ onVehiclesImported }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState<number | null>(null);

  // Fetch record count when search changes
  useEffect(() => {
    const fetchRecordCount = async () => {
      try {
        let url = '/api/vehicles';
        if (search.trim()) {
          url += `?search=${encodeURIComponent(search.trim())}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch vehicles count');
        const data = await res.json();
        setRecordCount(data.vehicles?.length || 0);
      } catch (e: any) {
        console.error('Error fetching record count:', e);
        setRecordCount(null);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchRecordCount, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleImport = async () => {
    console.log('VehicleDatabaseManager: Import button clicked')
    setLoading(true);
    setError(null);
    try {
      let url = '/api/vehicles';
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search.trim())}`;
      }
      
      console.log('VehicleDatabaseManager: Fetching from URL:', url)
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      const data = await res.json();
      console.log('VehicleDatabaseManager: Received data:', data)
      setVehicles(data.vehicles || []);
      console.log('VehicleDatabaseManager: Calling onVehiclesImported with:', data.vehicles || [])
      onVehiclesImported(data.vehicles || []);
    } catch (e: any) {
      console.error('VehicleDatabaseManager: Error:', e)
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorageIcon color="primary" />
        {t('dataImport.importVehiclesFromDatabase')}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('dataImport.searchDescriptionOptional')}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          placeholder={t('dataImport.enterSearchTerm')}
          helperText={t('dataImport.caseInsensitiveSearchVehicles')}
          InputLabelProps={{ sx: { fontSize: '14px' } }}
          FormHelperTextProps={{ sx: { fontSize: '13px' } }}
          inputProps={{
            style: { fontSize: '14px' }
          }}
          sx={{ minWidth: 200 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
          <Button 
            variant="contained" 
            onClick={handleImport} 
            disabled={loading}
            sx={{ mt: '-15px' }}
          >
            {loading ? <CircularProgress size={20} /> : t('buttons.import')}
          </Button>
        </Box>
      </Box>
      
      {recordCount !== null && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '14px' }}>
          {recordCount} {recordCount !== 1 ? t('dataImport.recordsWillBeImported') : t('dataImport.recordWillBeImported')}
        </Typography>
      )}
      
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      
      {vehicles.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Location</TableCell>
                <TableCell>End Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.id}</TableCell>
                  <TableCell>{vehicle.description}</TableCell>
                  <TableCell>{vehicle.start_location || ''}</TableCell>
                  <TableCell>{vehicle.end_location || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}; 