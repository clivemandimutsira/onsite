import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { fetchByMember } from '../../../api/attendanceService';

export default function MemberAttendanceList({ memberId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchByMember(memberId).then(setRows);
  }, [memberId]);

  const columns = [
    { field: 'attendance_date', headerName: 'Date', flex: 1 },
    { field: 'method',          headerName: 'Method', flex: 1 },
    { field: 'status',          headerName: 'Status', flex: 1 },
  ];

  return <div style={{ height: 400 }}><DataGrid rows={rows} columns={columns} getRowId={r => r.id} /></div>;
}
