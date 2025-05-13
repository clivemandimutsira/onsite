import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import ConfirmDialog from "../common/ConfirmDialog"; // Adjust the path as needed
import SnackbarAlert from "../common/SnackbarAlert"; // Adjust the path as needed
import { getAllMembers } from "../../api/memberService";
import { fetchByEvent } from "../../api/attendanceService";
import { checkInManual, checkInRFID } from "../../api/attendanceService";

// CSV download utility
const downloadCSV = (rows, filename) => {
  const headers = Object.keys(rows[0]).join(",");
  const csv = [
    headers,
    ...rows.map((row) => Object.values(row).map((v) => `"${v ?? ""}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export default function AdminCheckinTools({ eventId }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [rfid, setRfid] = useState("");
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    getAllMembers().then(setMembers);
    loadAttendance();
  }, [eventId]);

  const loadAttendance = async () => {
    const records = await fetchByEvent(eventId);
    setAttendanceLog(records);
  };

  const handleManualCheckin = async () => {
    const member = members.find(
      (m) => `${m.first_name} ${m.surname}` === selectedMember
    );
    if (!member) {
      setSnackbarMessage("Select a valid member first.");
      setSnackbarSeverity("error");
      return;
    }

    // Check if the member is already checked in
    const alreadyCheckedIn = attendanceLog.some(
      (log) => log.member_id === member.id
    );
    if (alreadyCheckedIn) {
      setSnackbarMessage("This member has already been checked in.");
      setSnackbarSeverity("error");
      return;
    }

    await checkInManual({ member_id: member.id, event_id: eventId });
    setSnackbarMessage("Manual check-in complete.");
    setSnackbarSeverity("success");
    setConfirmDialogOpen(false); // Close the ConfirmDialog after successful check-in
    loadAttendance();
  };

  const handleRFIDCheckin = async () => {
    if (!rfid) {
      setSnackbarMessage("Enter RFID tag.");
      setSnackbarSeverity("error");
      return;
    }

    // Check if the RFID tag is already checked in
    const alreadyCheckedIn = attendanceLog.some(
      (log) => log.rfid_tag === rfid
    );
    if (alreadyCheckedIn) {
      setSnackbarMessage("This RFID tag has already been checked in.");
      setSnackbarSeverity("error");
      return;
    }

    await checkInRFID({ rfid_tag: rfid, event_id: eventId });
    setSnackbarMessage("RFID check-in complete.");
    setSnackbarSeverity("success");
    setRfid("");
    loadAttendance();
  };

  const handleExport = () => {
    if (attendanceLog.length === 0) {
      setSnackbarMessage("No attendance to export.");
      setSnackbarSeverity("error");
      return;
    }
    downloadCSV(attendanceLog, `attendance_event_${eventId}.csv`);
    setSnackbarMessage("Attendance exported successfully.");
    setSnackbarSeverity("success");
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Admin Attendance Tools
      </Typography>

      <Box mb={2}>
        <Autocomplete
          freeSolo
          options={members.map((m) => `${m.first_name} ${m.surname}`)}
          value={selectedMember}
          onChange={(event, newValue) => setSelectedMember(newValue)}
          onInputChange={(event, newInputValue) => setSelectedMember(newInputValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select or Add Member" variant="outlined" fullWidth />
          )}
        />
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <Button variant="contained" onClick={() => setConfirmDialogOpen(true)}>
          Manual Check-In
        </Button>
        <TextField
          label="RFID Tag"
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
        />
        <Button variant="outlined" onClick={handleRFIDCheckin}>
          Submit RFID
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1">Live Attendance Log</Typography>
          <Button size="small" onClick={handleExport}>
            Export CSV
          </Button>
        </Box>

        {attendanceLog.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No attendance recorded yet.
          </Typography>
        ) : (
          <Box component="ul" sx={{ pl: 2 }}>
            {attendanceLog.map((a) => (
              <li key={a.id}>
                {a.first_name} {a.last_name} – {a.method} @{" "}
                {new Date(a.created_at).toLocaleString()}
              </li>
            ))}
          </Box>
        )}
      </Box>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleManualCheckin}
        title="Confirm Manual Check-In"
        message={`Are you sure you want to check in ${selectedMember}?`}
      />

      <SnackbarAlert
        open={!!snackbarMessage}
        onClose={() => setSnackbarMessage("")}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
    </Paper>
  );
}
