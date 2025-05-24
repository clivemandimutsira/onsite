// filepath: c:\mem - Copy - Copy\frontend\src\pages\MemberDashboard.js

import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Link,
  Box,
  Divider,
} from '@mui/material';

export default function MemberDashboard() {
  const userName = 'John Doe';

  const events = [
    { id: 1, title: 'Sunday Worship', date: 'May 12, 10:00 AM' },
    { id: 2, title: 'Bible Study Group', date: 'May 14, 7:00 PM' },
  ];

  const groups = ['Worship Team', 'Youth Ministry'];

  const sermons = [
    { id: 1, title: 'Hope in Crisis', link: '/sermons/hope-in-crisis' },
    { id: 2, title: 'Faith & Action', link: '/sermons/faith-and-action' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {userName}!
      </Typography>

      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        “Let your light shine before others...” – Matthew 5:16
      </Typography>

      <Grid container spacing={3}>
        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Upcoming Events</Typography>
              <Divider sx={{ my: 1 }} />
              {events.map((event) => (
                <Box key={event.id} mb={1}>
                  <Typography>{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.date}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* My Groups */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Groups</Typography>
              <Divider sx={{ my: 1 }} />
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {groups.map((group, index) => (
                  <li key={index}>
                    <Typography>{group}</Typography>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sermons */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Sermons</Typography>
              <Divider sx={{ my: 1 }} />
              {sermons.map((sermon) => (
                <Typography key={sermon.id}>
                  <Link href={sermon.link} underline="hover">
                    {sermon.title}
                  </Link>
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Giving Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Giving Summary</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>You’ve given $250 this year.</Typography>
              <Link href="/giving" underline="hover">
                View Details
              </Link>
              <Box mt={2}>
                <Button variant="contained" href="/giving">
                  Give Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Prayer Requests */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Prayer Requests</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>You have 1 active prayer request.</Typography>
              <Link href="/prayer" underline="hover">
                View All
              </Link>
              <Box mt={2}>
                <Button variant="outlined" href="/prayer">
                  Submit a Request
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
