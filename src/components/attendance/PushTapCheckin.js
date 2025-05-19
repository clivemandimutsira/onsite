import { Button } from "@mui/material";
import { useState } from "react";
import { checkInPush } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function PushTapCheckin({ memberId, eventId }) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCheckIn = async () => {
    try {
      await checkInPush({ member_id: memberId, event_id: eventId });
      setSnackbarMessage("Push tap check-in successful!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Push tap check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <Button onClick={() => setConfirmDialogOpen(true)}>Push Check-In</Button>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleCheckIn}
        title="Confirm Push Tap Check-In"
        message="Are you sure you want to perform a push tap check-in?"
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
