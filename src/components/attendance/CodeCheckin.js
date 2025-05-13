import { TextField, Button } from "@mui/material";
import { useState } from "react";
import { checkInCode } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function CodeCheckin({ memberId, eventId }) {
  const [code, setCode] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSubmit = async () => {
    try {
      await checkInCode({ code, event_id: eventId, member_id: memberId });
      setSnackbarMessage("Code check-in successful!");
      setSnackbarSeverity("success");
      setCode("");
    } catch (error) {
      setSnackbarMessage("Code check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <TextField
        label="Enter Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button onClick={() => setConfirmDialogOpen(true)}>Submit Code</Button>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleSubmit}
        title="Confirm Code Check-In"
        message={`Are you sure you want to check in with the code "${code}"?`}
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
