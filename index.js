const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const rooms = [];
const bookings = [];

app.post('/rooms', (req, res) => {
  try {
    const { numberOfSeats, amenities, pricePerHour } = req.body;

    if (!numberOfSeats || !pricePerHour) {
      return res.status(400).json({ message: 'Invalid data. Both numberOfSeats and pricePerHour are required.' });
    }

    const roomId = rooms.length + 1;

    const newRoom = {
      id: roomId,
      numberOfSeats,
      amenities,
      pricePerHour,
    };

    rooms.push(newRoom);

    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/bookings', (req, res) => {
  try {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    if (!customerName || !date || !startTime || !endTime || !roomId) {
      return res.status(400).json({ message: 'Invalid data. All fields (customerName, date, startTime, endTime, roomId) are required.' });
    }

    const room = rooms.find((room) => room.id === roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check for booking conflicts
    const conflicts = bookings.filter((booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      (startTime < booking.endTime && endTime > booking.startTime)
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Booking conflict. Room already booked for the selected date and time.' });
    }

    const newBooking = {
      customerName,
      date,
      startTime,
      endTime,
      roomId,
    };

    bookings.push(newBooking);

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/rooms', (req, res) => {
  res.status(200).json(rooms);
});

app.get('/bookings', (req, res) => {
  res.status(200).json(bookings);
});

// List all rooms booked data
app.get('/booked-rooms', (req, res) => {
  const bookedRooms = bookings.map((booking) => {
    const room = rooms.find((room) => room.id === booking.roomId);
    return {
      roomName: room ? `Room ${room.id}` : 'Unknown Room',
      bookedStatus: 'Booked',
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });

  res.status(200).json(bookedRooms);
});

// List all customers booked data
app.get('/customer-bookings', (req, res) => {
  const customerBookings = bookings.map((booking) => {
    const room = rooms.find((room) => room.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room ? `Room ${room.id}` : 'Unknown Room',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });

  res.status(200).json(customerBookings);
});

// List how many times a customer has booked a room
app.get('/customer-booking-count', (req, res) => {
  const customerBookingCounts = {};

  bookings.forEach((booking) => {
    if (!customerBookingCounts[booking.customerName]) {
      customerBookingCounts[booking.customerName] = [];
    }

    customerBookingCounts[booking.customerName].push({
      roomName: `Room ${booking.roomId}`,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking.id,
      bookingDate: new Date(booking.timestamp).toLocaleString(),
      bookingStatus: 'Booked',
    });
  });

  res.status(200).json(customerBookingCounts);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
