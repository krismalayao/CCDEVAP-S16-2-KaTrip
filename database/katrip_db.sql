CREATE DATABASE IF NOT EXISTS katrip_db;
USE katrip_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female', 'other', 'rather_not_say') NOT NULL,
    birthdate DATE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('passenger', 'driver', 'admin') NOT NULL,
    status ENUM('active', 'pending', 'suspended', 'denied') NOT NULL DEFAULT 'pending',
    password VARCHAR(250) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE driver_profiles (
    driver_id INT PRIMARY KEY,
    license_number VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    vehicle_color ENUM('black', 'white', 'red', 'blue', 'gray', 'brown', 'green') NOT NULL,
    verification_status ENUM('verified', 'pending', 'denied') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE driver_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    document_type ENUM('license', 'registration', 'insurance') NOT NULL,
    file VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(driver_id) ON DELETE CASCADE
);

CREATE TABLE ride_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    days_of_week SET('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NULL,
    departure_time TIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(driver_id) ON DELETE CASCADE
);

CREATE TABLE rides (
    ride_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    schedule_id INT NULL,
    destination VARCHAR(100) NOT NULL,
    departure VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    ride_status ENUM('scheduled', 'ongoing', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled',
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(driver_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES ride_schedules(schedule_id) ON DELETE SET NULL
);

CREATE TABLE ride_landmarks (
    landmark_id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    landmark_name VARCHAR(100) NOT NULL,
    landmark_number INT NOT NULL,
    FOREIGN KEY (ride_id) REFERENCES rides(ride_id) ON DELETE CASCADE
);

CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    passenger_id INT NOT NULL,
    seat_reserved INT NOT NULL DEFAULT 1,
    booking_status ENUM('pending', 'accepted', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(ride_id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'gcash') NOT NULL,
    reference_number VARCHAR(100) NULL,
    payment_status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- SAMPLE DATE --
INSERT INTO users (user_id, first_name, last_name, gender, birthdate, phone_number, email, role, status, password) VALUES
(1, 'John', 'Doe', 'male', '1990-05-15', '09171234567', 'john.doe@email.com', 'driver', 'active', 'password'),
(2, 'Jane', 'Smith', 'female', '1993-08-22', '09182345678', 'jane.smith@email.com', 'driver', 'active', 'password'),
(3, 'Mark', 'Santos', 'male', '1988-11-02', '09193456789', 'mark.santos@email.com', 'driver', 'active', 'password'),
(4, 'Alice', 'Guanzon', 'female', '1995-03-14', '09204567890', 'alice.g@email.com', 'passenger', 'active', 'password'),
(5, 'Bob', 'Reyes', 'male', '1998-07-19', '09215678901', 'bob.reyes@email.com', 'passenger', 'active', 'password'),
(6, 'Charlie', 'Cruz', 'other', '2000-01-25', '09226789012', 'charlie.c@email.com', 'passenger', 'active', 'password'),
(7, 'Diana', 'Lopez', 'female', '1992-12-05', '09237890123', 'diana.l@email.com', 'passenger', 'active', 'password'),
(8, 'Evan', 'Torres', 'male', '1994-06-30', '09248901234', 'evan.t@email.com', 'passenger', 'active', 'password'),
(9, 'Grace', 'Alvarez', 'female', '1997-09-09', '09259012345', 'grace.a@email.com', 'passenger', 'pending', 'password'),
(10, 'Superadmin', 'KaTrip', 'rather_not_say', '1985-04-01', '09151112222', 'admin@katrip.com', 'admin', 'active', 'admin');

INSERT INTO driver_profiles (driver_id, license_number, vehicle_model, plate_number, vehicle_color, verification_status) VALUES
(1, 'N01-12-345678', 'Toyota Vios', 'ABC-1234', 'black', 'verified'),
(2, 'N02-98-765432', 'Mitsubishi Mirage', 'XYZ-5678', 'white', 'verified'),
(3, 'N03-45-678901', 'Honda City', 'DEF-9012', 'silver', 'verified'),
(4, 'N04-11-223344', 'Hyundai Accent', 'GHI-3456', 'red', 'pending'),
(5, 'N05-55-667788', 'Ford EcoSport', 'JKL-7890', 'blue', 'verified'),
(6, 'N06-99-001122', 'Suzuki Swift', 'MNO-1234', 'gray', 'verified'),
(7, 'N07-33-445566', 'Nissan Almera', 'PQR-5678', 'brown', 'denied'),
(8, 'N08-77-889900', 'Toyota Innova', 'STU-9012', 'green', 'verified'),
(9, 'N09-22-446688', 'Kia Soluto', 'VWX-3456', 'white', 'pending'),
(10, 'N10-11-335577', 'Mazda 3', 'YZA-7890', 'black', 'verified');

INSERT INTO driver_documents (document_id, driver_id, document_type, file, uploaded_at) VALUES
(1, 1, 'license', 'files/docs/d1_license.pdf', CURRENT_TIMESTAMP),
(2, 1, 'registration', 'files/docs/d1_reg.pdf', CURRENT_TIMESTAMP),
(3, 2, 'license', 'files/docs/d2_license.pdf', CURRENT_TIMESTAMP),
(4, 2, 'insurance', 'files/docs/d2_ins.pdf', CURRENT_TIMESTAMP),
(5, 3, 'license', 'files/docs/d3_license.pdf', CURRENT_TIMESTAMP),
(6, 5, 'license', 'files/docs/d5_license.pdf', CURRENT_TIMESTAMP),
(7, 6, 'registration', 'files/docs/d6_reg.pdf', CURRENT_TIMESTAMP),
(8, 8, 'license', 'files/docs/d8_license.pdf', CURRENT_TIMESTAMP),
(9, 10, 'license', 'files/docs/d10_license.pdf', CURRENT_TIMESTAMP),
(10, 10, 'insurance', 'files/docs/d10_ins.pdf', CURRENT_TIMESTAMP);

INSERT INTO ride_schedules (schedule_id, driver_id, is_recurring, days_of_week, departure_time, start_date, end_date) VALUES
(1, 1, TRUE, 'Monday,Wednesday,Friday', '07:00:00', '2026-07-01', '2026-12-31'),
(2, 2, TRUE, 'Tuesday,Thursday', '08:30:00', '2026-07-01', '2026-12-31'),
(3, 3, FALSE, NULL, '17:30:00', '2026-07-10', '2026-07-10'),
(4, 5, TRUE, 'Monday,Tuesday,Wednesday,Thursday,Friday', '06:00:00', '2026-07-01', '2026-09-30'),
(5, 6, TRUE, 'Saturday,Sunday', '09:00:00', '2026-07-05', '2026-08-30'),
(6, 1, FALSE, NULL, '13:00:00', '2026-07-12', '2026-07-12'),
(7, 2, FALSE, NULL, '19:00:00', '2026-07-15', '2026-07-15'),
(8, 8, TRUE, 'Friday', '16:00:00', '2026-07-01', '2026-12-31'),
(9, 10, TRUE, 'Monday,Wednesday', '05:30:00', '2026-07-01', '2026-10-31'),
(10, 3, TRUE, 'Sunday', '20:00:00', '2026-07-01', '2026-11-30');

INSERT INTO rides (ride_id, driver_id, schedule_id, destination, departure, origin, total_seats, available_seats, cost, ride_status) VALUES
(1, 1, 1, 'Makati CBD', '07:00:00', 'Quezon City', 4, 2, 150.00, 'scheduled'),
(2, 2, 2, 'BGC', '08:30:00', 'Manila', 3, 1, 180.00, 'ongoing'),
(3, 3, 3, 'Ortigas', '17:30:00', 'Makati', 4, 4, 120.00, 'scheduled'),
(4, 5, 4, 'Alabang', '06:00:00', 'Caloocan', 4, 0, 250.00, 'completed'),
(5, 6, 5, 'Tagaytay', '09:00:00', 'Pasay', 4, 4, 350.00, 'cancelled'),
(6, 1, 6, 'MOA', '13:00:00', 'Quezon City', 4, 3, 160.00, 'scheduled'),
(7, 2, 7, 'Antipolo', '19:00:00', 'BGC', 3, 3, 200.00, 'scheduled'),
(8, 8, 8, 'Clark', '16:00:00', 'Trinoma', 6, 4, 400.00, 'scheduled'),
(9, 10, 9, 'Manila Airport', '05:30:00', 'Fairview', 4, 2, 300.00, 'completed'),
(10, 3, 10, 'Batangas Port', '20:00:00', 'Alabang', 4, 4, 450.00, 'scheduled');

INSERT INTO ride_landmarks (landmark_id, ride_id, landmark_name, landmark_number) VALUES
(1, 1, 'Cubao MRT Station', 1),
(2, 1, 'Ortigas Flyover', 2),
(3, 2, 'Quiapo Church', 1),
(4, 4, 'Balintawak Cloverleaf', 1),
(5, 4, 'Magallanes Interchange', 2),
(6, 5, 'Nuvali', 1),
(7, 8, 'NLEX Marilao Exit', 1),
(8, 8, 'San Fernando Exit', 2),
(9, 9, 'Commonwealth Avenue', 1),
(10, 9, 'España Boulevard', 2);

INSERT INTO bookings (booking_id, ride_id, passenger_id, seat_reserved, booking_status) VALUES
(1, 1, 4, 1, 'accepted'),
(2, 1, 5, 1, 'accepted'),
(3, 2, 6, 2, 'accepted'),
(4, 4, 7, 2, 'accepted'),
(5, 4, 8, 2, 'accepted'),
(6, 5, 4, 1, 'cancelled'),
(7, 6, 5, 1, 'accepted'),
(8, 8, 6, 2, 'pending'),
(9, 9, 7, 1, 'accepted'),
(10, 9, 8, 1, 'accepted');

INSERT INTO transactions (transaction_id, booking_id, amount, payment_method, reference_number, payment_status) VALUES
(1, 1, 150.00, 'gcash', 'REF100200300', 'completed'),
(2, 2, 150.00, 'cash', NULL, 'pending'),
(3, 3, 360.00, 'gcash', 'REF400500600', 'completed'),
(4, 4, 500.00, 'gcash', 'REF700800900', 'completed'),
(5, 5, 500.00, 'cash', NULL, 'completed'),
(6, 6, 0.00, 'cash', NULL, 'pending'),
(7, 7, 160.00, 'gcash', 'REF111222333', 'completed'),
(8, 8, 800.00, 'gcash', 'REF444555666', 'pending'),
(9, 9, 300.00, 'gcash', 'REF777888999', 'completed'),
(10, 10, 300.00, 'cash', NULL, 'completed');