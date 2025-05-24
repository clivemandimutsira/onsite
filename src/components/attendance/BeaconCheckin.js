import { Button } from "@mui/material";
import { useState } from "react";
import { checkInBeacon } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function BeaconCheckin({ memberId, eventId }) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleScan = async () => {
    try {
      // Simulated beacon ID for this demo
      const beaconId = "beacon-abc123";
      await checkInBeacon({ member_id: memberId, event_id: eventId, beacon_id: beaconId });
      setSnackbarMessage("Beacon check-in successful!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Beacon check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <Button onClick={() => setConfirmDialogOpen(true)}>Scan Beacon</Button>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleScan}
        title="Confirm Beacon Check-In"
        message="Are you sure you want to check in using this beacon?"
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
