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
INSERT INTO users (first_name, last_name, gender, birthdate, phone_number, email, role, status, password) VALUES
('Camille','Fernandez','female','1998-07-25','09170000018','camille@email.com','driver','active','password'),
('John','Doe','male','1998-01-15','09170000001','john@email.com','passenger','active',SHA2('password', 256)),
('Ryan','Aquino','male','1990-12-19','09170000015','ryan@email.com','driver','denied',SHA2('password', 256)),
('Nicole','Flores','female','1998-10-06','09170000010','nicole@email.com','passenger','active',SHA2('password', 256)),
('Mark','Santos','male','1993-06-11','09170000011','mark@email.com','driver','active',SHA2('password', 256)),
('Angela','Reyes','female','1998-05-02','09170000004','angela@email.com','passenger','active',SHA2('password', 256)),
('David','Lim','male','1992-08-23','09170000013','david@email.com','driver','pending',SHA2('password', 256)),
('Joshua','Lopez','male','1999-09-12','09170000007','joshua@email.com','passenger','active',SHA2('password', 256)),
('Ella','Villanueva','female','1996-01-21','09170000020','ella@email.com','driver','active',SHA2('password', 256)),
('Maria','Dela Cruz','female','1994-02-05','09170000012','maria@email.com','driver','active',SHA2('password', 256)),
('Patricia','Ramos','female','1997-04-28','09170000008','patricia@email.com','passenger','pending',SHA2('password', 256)),
('Brian','Castro','male','1995-03-07','09170000017','brian@email.com','driver','pending',SHA2('password', 256)),
('Michael','Garcia','male','1997-07-18','09170000003','michael@email.com','passenger','active',SHA2('password', 256)),
('Ashley','Navarro','female','1997-11-30','09170000016','ashley@email.com','driver','active',SHA2('password', 256)),
('Kevin','Torres','male','1996-11-09','09170000005','kevin@email.com','passenger','active',SHA2('password', 256)),
('Christine','Tan','female','1996-09-15','09170000014','christine@email.com','driver','active',SHA2('password', 256)),
('Samantha','Cruz','female','2000-08-17','09170000006','samantha@email.com','passenger','active',SHA2('password', 256)),
('Joshua','Rivera','male','1991-05-13','09170000019','jrivera@email.com','driver','active',SHA2('password', 256)),
('Jane','Smith','female','1999-03-22','09170000002','jane@email.com','passenger','active',SHA2('password', 256)),
('Daniel','Mendoza','male','1995-12-14','09170000009','daniel@email.com','passenger','active',SHA2('password', 256)),
('Super','Admin','rather_not_say','1985-04-01','09179999999','admin@katrip.com','admin','active',SHA2('admin123', 256));

INSERT INTO driver_profiles (driver_id, license_number, vehicle_model, plate_number, vehicle_color, verification_status) VALUES
(1,'N01-123456','Toyota Innova','ABC1234','black','verified'),
(3,'N03-654321','Honda City','XYZ5678','white','denied'),
(5,'N05-456789','Toyota Vios','JKL9012','gray','verified'),
(7,'N07-223344','Hyundai Accent','MNO3456','red','pending'),
(9,'N09-998877','Ford Ranger','PQR7890','blue','verified'),
(10,'N10-112233','Suzuki Swift','STU1234','white','verified'),
(12,'N12-445566','Mitsubishi Mirage','VWX5678','green','pending'),
(14,'N14-778899','Toyota Wigo','YZA9012','brown','verified'),
(16,'N16-991122','Kia Soluto','BCD3456','black','verified'),
(18,'N18-334455','Nissan Almera','EFG7890','gray','verified');

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