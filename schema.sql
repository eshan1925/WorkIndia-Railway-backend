CREATE DATABASE railway_app;
USE railway_app;

CREATE TABLE users (
  userid integer PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email TEXT NOT NULL,
  passwordU TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username,email,passwordU)
VALUES 
('admin','admin@gmail.com','admin123');

INSERT INTO users (username,email,passwordU) VALUES ('eshan1925','ehii@gmail.com','12345');

CREATE TABLE trains (
  trainid integer PRIMARY KEY AUTO_INCREMENT,
  train_name VARCHAR(255) NOT NULL,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  seat_capacity integer,
  arrival_time_at_source TEXT NOT NULL,
  arrival_time_at_destination TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  bookingid integer PRIMARY KEY AUTO_INCREMENT,
  train_id VARCHAR(255) NOT NULL,
  train_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  no_of_seats integer,
  seat_number TEXT NOT NULL,
  arrival_time_at_source TEXT NOT NULL,
  arrival_time_at_destination TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);




-- CREATE DATABASE notes_app;
-- USE notes_app;

-- CREATE TABLE notes (
--   id integer PRIMARY KEY AUTO_INCREMENT,
--   title VARCHAR(255) NOT NULL,
--   contents TEXT NOT NULL,
--   created TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- INSERT INTO notes (title, contents)
-- VALUES 
-- ('My First Note', 'A note about something'),
-- ('My Second Note', 'A note about something else');