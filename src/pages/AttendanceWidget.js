import React, { useState, useContext } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  QrCode,
  MapPin,
  Bell,
  RadioTower,
  Bluetooth,
  Mail,
} from "lucide-react";

import { AuthContext } from "../contexts/AuthContext";

// Check-in components
import ManualCheckin from "../components/attendance/ManualCheckin";
import QRCodeCheckin from "../components/attendance/QRCodeCheckin";
import GeofenceCheckin from "../components/attendance/GeofenceCheckin";
import PushTapCheckin from "../components/attendance/PushTapCheckin";
import RFIDCheckin from "../components/attendance/RFIDCheckin";
import BeaconCheckin from "../components/attendance/BeaconCheckin";
import CodeCheckin from "../components/attendance/CodeCheckin";
import AdminCheckinTools from "../components/attendance/AdminCheckinTools"; // optional full version

export default function AttendanceWidget({ memberId: propMemberId, eventId, qrToken }) {
  const { memberId: contextMemberId, userRole } = useContext(AuthContext);
  const memberId = propMemberId || contextMemberId;
  const isAdmin = userRole === "admin";

  const [openModal, setOpenModal] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});

  const widgets = [
    {
      title: "Manual Check-In",
      icon: <CheckCircle size={24} />,
      component: <ManualCheckin memberId={memberId} eventId={eventId} />,
    },
    {
      title: "QR Code Check-In",
      icon: <QrCode size={24} />,
      component: <QRCodeCheckin memberId={memberId} eventId={eventId} qrToken={qrToken} />,
    },
    {
      title: "Geofence Check-In",
      icon: <MapPin size={24} />,
      component: <GeofenceCheckin memberId={memberId} eventId={eventId} />,
    },
    {
      title: "Push Tap Check-In",
      icon: <Bell size={24} />,
      component: <PushTapCheckin memberId={memberId} eventId={eventId} />,
    },
    {
      title: "RFID Check-In",
      icon: <RadioTower size={24} />,
      component: <RFIDCheckin eventId={eventId} />,
    },
    {
      title: "Beacon Check-In",
      icon: <Bluetooth size={24} />,
      component: <BeaconCheckin memberId={memberId} eventId={eventId} />,
    },
    {
      title: "Code Check-In",
      icon: <Mail size={24} />,
      component: <CodeCheckin memberId={memberId} eventId={eventId} />,
    },
  ];

  const handleOpenModal = (widget) => {
    setSelectedWidget(widget);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedWidget(null);
  };

  const handleConfirmAction = (action) => {
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = (confirmed) => {
    setConfirmDialogOpen(false);
    if (confirmed && confirmAction) {
      confirmAction();
    }
  };

  if (!isAdmin && !memberId) {
    return <Typography color="error">Member not identified for attendance.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, px: { xs: 1, sm: 2, md: 4 } }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: "center",
          mb: 4,
          fontWeight: "bold",
          color: "primary.main",
        }}
      >
        {isAdmin ? "Admin Attendance Tools" : "Attendance Methods"}
      </Typography>

      {isAdmin ? (
        <AdminCheckinTools eventId={eventId} />
      ) : (
        <Grid container spacing={4}>
          {widgets.map((widget, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={6}
                role="button"
                tabIndex={0}
                onClick={() => handleConfirmAction(() => handleOpenModal(widget))}
                onKeyPress={(e) => e.key === "Enter" && handleConfirmAction(() => handleOpenModal(widget))}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: "center",
                  backgroundColor: "background.default",
                  boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <IconButton aria-label={widget.title} sx={{ color: "primary.main", mb: 2 }}>
                  {widget.icon}
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                  {widget.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal for member-side check-in methods */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{selectedWidget?.title}</DialogTitle>
        <DialogContent dividers>{selectedWidget?.component}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => handleConfirmDialogClose(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to proceed with this action?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={() => handleConfirmDialogClose(true)} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
