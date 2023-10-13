import express from "express"
import { MongoClient } from "mongodb"
import * as dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(express.json())

const PORT = 5000;

const MONGO_URL = process.env.MONGO_URL
//const MONGO_URL = "mongodb://127.0.0.1:27017"
//"mongodb://127.0.0.1:27017"
//mongodb://localhost:27017
async function createConnection() {
    const client = new MongoClient(MONGO_URL)
    await client.connect()
    console.log("Mongodb is connected")
    return client
}
console.log(process.env.MONGO_URL)
const client = await createConnection()

app.get('/rooms', async (req, res) => {
  const rooms = await client.db("Hall-Booking").collection("rooms").find({}).toArray();
  res.json(rooms);
});

app.post('/rooms', async (req,res)=>{
  const newRooms = req.body
  console.log(newRooms)
  const result = await client.db("Hall-Booking").collection("rooms").insertMany(newRooms)
  res.send(result)
})


app.post('/bookings', async (req, res) => {
  const newBooking = req.body;

  // if (!newBooking.customerName || !newBooking.date || !newBooking.startTime || !newBooking.endTime || !newBooking.roomId) {
  //     return res.status(400).json({ error: "Please provide all required booking details" });
  // }

  const result = await client.db("Hall-Booking").collection("bookings").insertOne(newBooking);
  res.send(result);
});

app.get('/bookings', async (req, res) => {
  const rooms = await client.db("Hall-Booking").collection("rooms").find({}).toArray();
  const bookings = await client.db("Hall-Booking").collection("bookings").find({}).toArray();

  const customerBookings = bookings.map((booking) => {
      const room = rooms.find((room) => room.RoomId === booking.roomId);
      return {
          RoomId : room.RoomId,
          customerName: booking.customerName,
          bookedstatus: "Booked",
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
      };
  });

  res.json(customerBookings);
});

app.get('/customerBookings', async (req, res) => {
  const rooms = await client.db("Hall-Booking").collection("rooms").find({}).toArray();
  const bookings = await client.db("Hall-Booking").collection("bookings").find({}).toArray();

  const customerBookings = {};

  bookings.forEach((booking) => {
      const room = rooms.find((room) => room.RoomId === booking.roomId);
      if (room) {
          const customerName = booking.customerName;
          if (!customerBookings[customerName]) {
              customerBookings[customerName] = [];
          }

          customerBookings[customerName].push({
              RoomName: room.RoomId, 
              Date: booking.date,
              StartTime: booking.startTime,
              EndTime: booking.endTime,
              BookingId: booking._id, 
              BookingDate: booking.date, 
              BookingStatus: "Booked", 
          });
      }
  });

  res.json(customerBookings);
});


app.listen(PORT, () => console.log("The server started on the port", PORT))