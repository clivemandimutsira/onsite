import { Button } from "@mui/material";
import { useState } from "react";
import { checkInManual } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function ManualCheckin({ memberId, eventId }) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCheckIn = async () => {
    try {
      await checkInManual({ member_id: memberId, event_id: eventId });
      setSnackbarMessage("Manual check-in successful!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Manual check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <Button onClick={() => setConfirmDialogOpen(true)}>Manual Check-In</Button>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleCheckIn}
        title="Confirm Manual Check-In"
        message="Are you sure you want to manually check in this member?"
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
