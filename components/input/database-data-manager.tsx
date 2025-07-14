import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import dayjs from 'dayjs';

interface Job {
  id: string;
  description: string;
  time_window_start: number;
  time_window_end: number;
  [key: string]: any;
}

interface DatabaseDataManagerProps {
  onJobsImported: (jobs: Job[]) => void;
}

export const DatabaseDataManager: React.FC<DatabaseDataManagerProps> = ({ onJobsImported }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState<number | null>(null);

  // Fetch record count when start/end times change
  useEffect(() => {
    const fetchRecordCount = async () => {
      try {
        const startTimestamp = start ? Math.floor(new Date(start).getTime() / 1000) : undefined;
        const endTimestamp = end ? Math.floor(new Date(end).getTime() / 1000) : undefined;
        
        let url = '/api/jobs';
        const params = new URLSearchParams();
        if (startTimestamp) params.append('start', startTimestamp.toString());
        if (endTimestamp) params.append('end', endTimestamp.toString());
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
  }, [start, end]);

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
        Import Jobs from Database
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end' }}>
        <TextField
          label="Start Time (optional)"
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          helperText="Leave empty to import all records"
        />
        <TextField
          label="End Time (optional)"
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          helperText="Leave empty to import all records"
        />
        <Button variant="contained" onClick={handleImport} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Import'}
        </Button>
      </Box>
      
      {recordCount !== null && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {recordCount} record{recordCount !== 1 ? 's' : ''} will be imported
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