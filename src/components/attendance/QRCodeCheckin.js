import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { checkInQR } from "../../api/attendanceService";
import ConfirmDialog from "../common/ConfirmDialog";
import SnackbarAlert from "../common/SnackbarAlert";

export default function QRCodeCheckin({ memberId, eventId, qrToken }) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [decodedText, setDecodedText] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });

    scanner.render((decodedText) => {
      setDecodedText(decodedText);
      setConfirmDialogOpen(true); // Open the confirmation dialog
    });

    return () => scanner.clear();
  }, []);

  const handleCheckIn = async () => {
    try {
      await checkInQR({ member_id: memberId, event_id: eventId, qr_token: decodedText });
      setSnackbarMessage("QR Code check-in successful!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("QR Code check-in failed: " + error.message);
      setSnackbarSeverity("error");
    } finally {
      setConfirmDialogOpen(false); // Close the ConfirmDialog
    }
  };

  return (
    <>
      <div id="qr-reader" style={{ width: "300px" }} />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleCheckIn}
        title="Confirm QR Code Check-In"
        message={`Are you sure you want to check in with the QR code "${decodedText}"?`}
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
