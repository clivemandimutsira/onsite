import { Button } from "@mui/material";
import { useState } from "react";
import { checkInGeofence } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function GeofenceCheckin({ memberId, eventId }) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCheckIn = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await checkInGeofence({
          member_id: memberId,
          event_id: eventId,
          metadata: { lat: latitude, lng: longitude },
        });
        setSnackbarMessage("Geofence check-in successful!");
        setSnackbarSeverity("success");
      });
    } catch (error) {
      setSnackbarMessage("Geofence check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <Button onClick={() => setConfirmDialogOpen(true)}>Geofence Check-In</Button>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleCheckIn}
        title="Confirm Geofence Check-In"
        message="Are you sure you want to check in using your current location?"
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
