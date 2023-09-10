require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

const result = async () => {
  return await pool.query("SELECT * FROM users");
};

app.use(bodyParser.json());

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

function generate10DigitUID() {
  const min = 1000000000; // Smallest 10-digit number (10^9)
  const max = 9999999999; // Largest 10-digit number (10^10 - 1)

  // Generate a random number between min and max
  const uid = Math.floor(Math.random() * (max - min + 1)) + min;

  return uid.toString();
}

function generateAccessToken(length = 32) {
  // Generate a random hexadecimal string of the specified length
  return crypto.randomBytes(length).toString("hex");
}

function generateUID() {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36 string
  const randomBytes = crypto.randomBytes(8).toString("hex"); // Generate random bytes and convert to hexadecimal

  // Combine timestamp and random bytes
  const uid = timestamp + randomBytes;

  // Hash the combined string to ensure uniqueness
  const hashedUID = crypto.createHash("sha1").update(uid).digest("hex");

  return hashedUID;
}

async function findOrCreateUser(username, email, password, uid) {
  try {
    // Check if the user with the provided username or email exists
    const query =
      "SELECT * FROM users WHERE username = '" +
      username +
      "' OR email = '" +
      email +
      "';";
    const result = await pool.query(query);
    console.log(result);
    // If the user doesn't exist, create a new user
    if (result[0].length === 0) {
      const createUserQuery =
        "INSERT INTO users (username,email,passwordU,user_id) VALUES ('" +
        username +
        "','" +
        email +
        "','" +
        password +
        "','" +
        uid +
        "');";
      await pool.query(createUserQuery);
      console.log("User created successfully");
      return true;
    } else {
      console.log("User already exists");
      return false;
    }
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
}

app.post("/api/signup", async (req, res) => {
  // Get user registration data from the request body
  const { username, password, email } = req.body;

  // Basic validation: Check if required fields are provided
  if (!username || !password || !email) {
    return res.status(400).json({ status: "Bad Request", status_code: 400 });
  }
  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const uid = generateUID();
  if (findOrCreateUser(username, email, hashPassword, uid)) {
    res.status(200).json({
      status: "Account successfully created",
      status_code: 200,
      user_id: uid,
    });
  } else {
    res.status(500).json({ status: "User Already exists", status_code: 500 });
  }
});

app.post("/api/login", async (req, res) => {
  // Get user registration data from the request body
  const { username, password } = req.body;

  // Basic validation: Check if required fields are provided
  if (!username || !password) {
    return res.status(400).json({ status: "Bad Request", status_code: 400 });
  }

  const user = await pool.query(
    "SELECT * FROM users WHERE username = '" + username + "';"
  );
  const validPassword = await bcrypt.compare(
    req.body.password,
    user[0][0].passwordU
  );
  if (!validPassword)
    return res
      .status(401)
      .send({ message: "Incorrect username/password provided. Please retry" });

  const token = generateAccessToken(64);
  return res.status(200).send({
    message: "Login successful",
    access_token: token,
    user_id: user[0][0].user_id,
  });
});

app.post("/api/trains/create", async (req, res) => {
  const {
    train_name,
    source,
    destination,
    seat_capacity,
    arrival_time_at_source,
    arrival_time_at_destination,
  } = req.body;
  const trainID = generate10DigitUID();
  try {
    const createTrainQuery =
      "INSERT INTO trains (train_name,source,destination,seat_capacity,arrival_time_at_source,arrival_time_at_destination,trainIDs) VALUES ('" +
      train_name +
      "','" +
      source +
      "','" +
      destination +
      "','" +
      seat_capacity +
      "','" +
      arrival_time_at_source +
      "','" +
      arrival_time_at_destination +
      "','" +
      trainID +
      "');";
    await pool.query(createTrainQuery);
    console.log("Train added successfully");
    res
      .status(200)
      .send({ message: "Train added successfully", train_id: trainID });
  } catch (error) {
    console.log(error);
  }
});

//GET TRAIN REQUEST
app.get("/api/trains/availability", async (req, res) => {
  try {
    const { source, destination } = req.query;
    // SQL query to retrieve train availability information
    const sql =
      "SELECT * FROM trains WHERE source = '" +
      source +
      "' AND destination = '" +
      destination +
      "';";

    // Execute the SQL query
    const [rows] = await pool.query(sql);

    // Send the retrieved data as a JSON response
    res.json({ data: rows });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//BOOK A SEAT

app.post("/api/trains/:train_id/book", async (req, res) => {
  try {
    const { train_id } = req.params;
    const { user_id, no_of_seats } = req.body;

    // Check if the train exists and has available seats
    const [trainRows] = await pool.query(
      "SELECT * FROM trains WHERE trainIDs ='" +
        train_id +
        "'AND seat_capacity >=" +
        no_of_seats +
        ";"
    );

    if (trainRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Train not found or not enough seats available." });
    }

    // Assuming you have a bookings table, insert the booking record
    const q =
      "INSERT INTO bookings (train_id,train_name,user_id, no_of_seats,seat_number,arrival_time_at_source,arrival_time_at_destination) VALUES ('" +
      train_id +
      "','" +
      trainRows[0].train_name +
      "','" +
      user_id +
      "','" +
      no_of_seats +
      "','" +
      "1,2,3" +
      "','" +
      trainRows[0].arrival_time_at_source +
      "','" +
      trainRows[0].arrival_time_at_destination +
      "')";
    console.log(q);
    await pool.query(q); // Update the seat capacity of the train
    await pool.query(
      "UPDATE trains SET seat_capacity = seat_capacity - ? WHERE trainIDs = ?",
      [no_of_seats, train_id]
    );
    res.json({ message: "Seat booked successfully!" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/bookings/:booking_id", async (req, res) => {
    try {
        const bid = req.params.booking_id;
        const result = await pool.query("SELECT * FROM bookings WHERE bookingid= ?",[bid])
        res.status(200).send({message:result[0]});
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"});
    }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
