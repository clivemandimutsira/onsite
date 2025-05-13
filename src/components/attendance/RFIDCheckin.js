import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { checkInRFID } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function RFIDCheckin({ eventId }) {
  const [rfidTag, setRfidTag] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSubmit = async () => {
    try {
      await checkInRFID({ rfid_tag: rfidTag, event_id: eventId });
      setSnackbarMessage("RFID check-in successful!");
      setSnackbarSeverity("success");
      setRfidTag("");
    } catch (error) {
      setSnackbarMessage("RFID check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <TextField
        label="RFID Tag"
        value={rfidTag}
        onChange={(e) => setRfidTag(e.target.value)}
      />
      <Button onClick={() => setConfirmDialogOpen(true)}>Submit RFID</Button>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleSubmit}
        title="Confirm RFID Check-In"
        message={`Are you sure you want to check in with the RFID tag "${rfidTag}"?`}
      />

      <SnackbarAlert
        open={!!snackbarMessage}
        onClose={() => setSnackbarMessage("")}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
    </>
  );
}
