-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 15, 2026 at 01:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE katrip_db;
USE katrip_db;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `katrip_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `passenger_id` int(11) NOT NULL,
  `seat_reserved` int(11) NOT NULL DEFAULT 1,
  `booking_status` enum('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `ride_id`, `passenger_id`, `seat_reserved`, `booking_status`, `created_at`) VALUES
(1, 1, 1, 1, 'accepted', '2026-07-13 21:11:58'),
(2, 1, 3, 1, 'accepted', '2026-07-13 21:11:58'),
(3, 2, 6, 2, 'accepted', '2026-07-13 21:11:58'),
(4, 3, 8, 1, 'pending', '2026-07-13 21:11:58'),
(5, 4, 11, 2, 'accepted', '2026-07-13 21:11:58'),
(6, 5, 13, 1, 'cancelled', '2026-07-13 21:11:58'),
(7, 6, 15, 1, 'accepted', '2026-07-13 21:11:58'),
(8, 8, 17, 2, 'pending', '2026-07-13 21:11:58'),
(9, 9, 19, 1, 'accepted', '2026-07-13 21:11:58'),
(10, 10, 20, 1, 'accepted', '2026-07-13 21:11:58'),
(14, 14, 1, 1, 'accepted', '2026-07-14 23:43:54'),
(15, 15, 3, 1, 'accepted', '2026-07-14 23:43:54'),
(16, 15, 6, 1, 'accepted', '2026-07-14 23:43:54'),
(17, 15, 8, 1, 'accepted', '2026-07-14 23:43:54'),
(18, 15, 11, 1, 'pending', '2026-07-14 23:43:54'),
(19, 17, 13, 2, 'accepted', '2026-07-14 23:43:54'),
(20, 17, 15, 2, 'accepted', '2026-07-14 23:43:54'),
(21, 18, 17, 3, 'accepted', '2026-07-14 23:43:54'),
(22, 19, 19, 4, 'accepted', '2026-07-14 23:43:54');

-- --------------------------------------------------------

--
-- Table structure for table `driver_documents`
--

CREATE TABLE `driver_documents` (
  `document_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `document_type` enum('license','vehicle','registration','insurance') NOT NULL,
  `file` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `driver_documents`
--

INSERT INTO `driver_documents` (`document_id`, `driver_id`, `document_type`, `file`, `mime_type`, `file_size`, `uploaded_at`) VALUES
(1, 2, 'license', 'driver-documents/2/2-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(2, 2, 'vehicle', 'driver-documents/2/2-vehicle.jpg', 'image/jpeg', 36644, '2026-07-14 21:11:58'),
(3, 2, 'registration', 'driver-documents/2/2-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(4, 2, 'insurance', 'driver-documents/2/2-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58'),
(5, 5, 'license', 'driver-documents/5/5-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(6, 5, 'vehicle', 'driver-documents/5/5-vehicle.jpg', 'image/jpeg', 35829, '2026-07-14 21:11:58'),
(7, 5, 'registration', 'driver-documents/5/5-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(8, 5, 'insurance', 'driver-documents/5/5-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58'),
(9, 9, 'license', 'driver-documents/9/9-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(10, 9, 'vehicle', 'driver-documents/9/9-vehicle.jpg', 'image/jpeg', 18942, '2026-07-14 21:11:58'),
(11, 9, 'registration', 'driver-documents/9/9-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(12, 9, 'insurance', 'driver-documents/9/9-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58'),
(13, 4, 'license', 'driver-documents/4/4-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(14, 4, 'vehicle', 'driver-documents/4/4-vehicle.jpg', 'image/jpeg', 62876, '2026-07-14 21:11:58'),
(15, 4, 'registration', 'driver-documents/4/4-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(16, 4, 'insurance', 'driver-documents/4/4-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58'),
(17, 7, 'license', 'driver-documents/7/7-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(18, 7, 'vehicle', 'driver-documents/7/7-vehicle.jpg', 'image/jpeg', 10994, '2026-07-14 21:11:58'),
(19, 7, 'registration', 'driver-documents/7/7-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(20, 7, 'insurance', 'driver-documents/7/7-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58'),
(21, 10, 'license', 'driver-documents/10/10-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(22, 10, 'vehicle', 'driver-documents/10/10-vehicle.jpg', 'image/jpeg', 18942, '2026-07-14 21:11:58'),
(23, 10, 'registration', 'driver-documents/10/10-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(24, 10, 'insurance', 'driver-documents/10/10-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58'),
(17, 12, 'license', 'driver-documents/12/12-license.jpg', 'image/jpeg', 118397, '2026-07-14 21:11:58'),
(18, 12, 'vehicle', 'driver-documents/12/12-vehicle.jpg', 'image/jpeg', 48766, '2026-07-14 21:11:58'),
(19, 12, 'registration', 'driver-documents/12/12-registration.jpg', 'image/jpeg', 485622, '2026-07-14 21:11:58'),
(20, 12, 'insurance', 'driver-documents/12/12-insurance.png', 'image/jpeg', 31213, '2026-07-14 21:11:58');

-- --------------------------------------------------------

--
-- Table structure for table `driver_profiles`
--

CREATE TABLE `driver_profiles` (
  `driver_id` int(11) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `vehicle_model` varchar(50) NOT NULL,
  `plate_number` varchar(20) NOT NULL,
  `vehicle_color` enum('black','white','red','blue','gray','brown','green') NOT NULL,
  `verification_status` enum('verified','pending','denied') NOT NULL DEFAULT 'pending',
  `show_full_name` boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `driver_profiles`
--

INSERT INTO `driver_profiles` (`driver_id`, `license_number`, `vehicle_model`, `plate_number`, `vehicle_color`, `verification_status`) VALUES
(2, 'N01-123456', 'Toyota Innova', 'ABC1234', 'black', 'verified'),
(4, 'N02-654321', 'Honda City', 'XYZ5678', 'white', 'denied'),
(5, 'N03-456789', 'Toyota Vios', 'JKL9012', 'gray', 'verified'),
(7, 'N04-223344', 'Hyundai Accent', 'MNO3456', 'red', 'pending'),
(9, 'N05-998877', 'Ford Ranger', 'PQR7890', 'blue', 'verified'),
(10, 'N06-112233', 'Suzuki Swift', 'STU1234', 'white', 'verified'),
(12, 'N07-445566', 'Mitsubishi Mirage', 'VWX5678', 'green', 'pending'),
(14, 'N08-778899', 'Toyota Wigo', 'YZA9012', 'brown', 'verified'),
(16, 'N09-991122', 'Kia Soluto', 'BCD3456', 'black', 'verified'),
(18, 'N10-334455', 'Nissan Almera', 'EFG7890', 'gray', 'verified');

-- --------------------------------------------------------

--
-- Table structure for table `rides`
--

CREATE TABLE `rides` (
  `ride_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `destination` varchar(100) NOT NULL,
  `departure` varchar(100) NOT NULL,
  `origin` varchar(500) NOT NULL,
  `total_seats` int(11) NOT NULL,
  `available_seats` int(11) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `ride_status` enum('scheduled','ongoing','cancelled','completed') NOT NULL DEFAULT 'scheduled',
  `origin_lat` decimal(10,7) DEFAULT NULL,
  `origin_lng` decimal(10,7) DEFAULT NULL,
  `dest_lat` decimal(10,7) DEFAULT NULL,
  `dest_lng` decimal(10,7) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `origin_name` varchar(255) DEFAULT NULL,
  `destination_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rides`
--

INSERT INTO `rides` (`ride_id`, `driver_id`, `schedule_id`, `destination`, `departure`, `origin`, `total_seats`, `available_seats`, `cost`, `ride_status`, `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`, `departure_date`, `origin_name`, `destination_name`) VALUES
(1, 2, 1, 'Makati CBD', '07:00:00', 'Quezon City', 4, 2, 150.00, 'scheduled', NULL, NULL, NULL, NULL, '2026-07-17', NULL, NULL),
(2, 4, 2, 'BGC', '08:30:00', 'Manila', 3, 1, 180.00, 'ongoing', NULL, NULL, NULL, NULL, '2026-07-14', NULL, NULL),
(3, 5, 3, 'Ortigas', '17:30:00', 'Makati', 4, 4, 120.00, 'scheduled', NULL, NULL, NULL, NULL, '2026-07-10', NULL, NULL),
(4, 7, 4, 'Alabang', '06:00:00', 'Caloocan', 4, 0, 250.00, 'completed', NULL, NULL, NULL, NULL, '2026-07-13', NULL, NULL),
(5, 9, 5, 'Tagaytay', '09:00:00', 'Pasay', 4, 4, 350.00, 'cancelled', NULL, NULL, NULL, NULL, '2026-07-12', NULL, NULL),
(6, 10, 6, 'MOA', '13:00:00', 'Quezon City', 4, 3, 160.00, 'scheduled', NULL, NULL, NULL, NULL, '2026-07-12', NULL, NULL),
(7, 12, 7, 'Antipolo', '19:00:00', 'BGC', 3, 3, 200.00, 'scheduled', NULL, NULL, NULL, NULL, '2026-07-15', NULL, NULL),
(8, 14, 8, 'Clark', '16:00:00', 'Trinoma', 6, 4, 400.00, 'scheduled', NULL, NULL, NULL, NULL, '2026-07-17', NULL, NULL),
(9, 16, 9, 'Manila Airport', '05:30:00', 'Fairview', 4, 2, 300.00, 'completed', NULL, NULL, NULL, NULL, '2026-07-13', NULL, NULL),
(10, 18, 10, 'Batangas Port', '20:00:00', 'Alabang', 4, 4, 450.00, 'scheduled', NULL, NULL, NULL, NULL, '2026-07-19', NULL, NULL),
(11, 5, NULL, 'Quezon City, Metro Manila, Philippines', '07:00:00', 'Pandi, Bulacan, Philippines', 4, 3, 180.00, 'scheduled', 14.9333000, 120.8833000, 14.6760000, 121.0437000, '2026-07-16', 'Pandi', 'Quezon City'),
(13, 5, NULL, 'Quezon City, Metro Manila, Philippines', '07:00:00', 'Pandi, Bulacan, Philippines', 4, 3, 180.00, 'scheduled', 14.9333000, 120.8833000, 14.6760000, 121.0437000, '2026-07-16', 'Pandi', 'Quezon City'),
(14, 5, NULL, 'Quezon City, Metro Manila, Philippines', '07:00:00', 'Pandi, Bulacan, Philippines', 4, 3, 180.00, 'scheduled', 14.9333000, 120.8833000, 14.6760000, 121.0437000, '2026-07-16', 'Pandi', 'Quezon City'),
(15, 5, NULL, 'Manila, Metro Manila, Philippines', '08:30:00', 'Malolos, Bulacan, Philippines', 4, 1, 220.00, 'scheduled', 14.8433000, 120.8114000, 14.5995000, 120.9842000, '2026-07-18', 'Malolos', 'Manila'),
(16, 5, NULL, 'Baliuag, Bulacan, Philippines', '07:58:54', 'Pandi, Bulacan, Philippines', 4, 2, 90.00, 'scheduled', 14.9333000, 120.8833000, 14.9563000, 120.8985000, '2026-07-15', 'Pandi', 'Baliuag'),
(17, 5, NULL, 'Cubao, Quezon City, Philippines', '07:43:54', 'San Jose del Monte, Bulacan, Philippines', 4, 0, 150.00, 'ongoing', 14.8139000, 121.0453000, 14.6197000, 121.0529000, '2026-07-15', 'San Jose del Monte', 'Cubao'),
(18, 5, NULL, 'Trinoma, Quezon City, Philippines', '06:45:00', 'Pandi, Bulacan, Philippines', 4, 1, 175.50, 'completed', 14.9333000, 120.8833000, 14.6547000, 121.0322000, '2026-07-14', 'Pandi', 'Trinoma'),
(19, 5, NULL, 'Makati, Metro Manila, Philippines', '05:30:00', 'Bocaue, Bulacan, Philippines', 4, 0, 250.00, 'completed', 14.7947000, 120.9358000, 14.5547000, 121.0244000, '2026-07-08', 'Bocaue', 'Makati'),
(20, 5, NULL, 'Fairview, Quezon City, Philippines', '09:00:00', 'Pandi, Bulacan, Philippines', 4, 4, 160.00, 'cancelled', 14.9333000, 120.8833000, 14.7333000, 121.0500000, '2026-07-17', 'Pandi', 'Fairview');

-- --------------------------------------------------------

--
-- Table structure for table `ride_landmarks`
--

CREATE TABLE `ride_landmarks` (
  `landmark_id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `landmark_name` varchar(100) NOT NULL,
  `landmark_number` int(11) NOT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `stop_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ride_landmarks`
--

INSERT INTO `ride_landmarks` (`landmark_id`, `ride_id`, `landmark_name`, `landmark_number`, `lat`, `lng`, `stop_order`) VALUES
(1, 1, 'Cubao MRT Station', 1, NULL, NULL, NULL),
(2, 1, 'Ortigas Flyover', 2, NULL, NULL, NULL),
(3, 2, 'Quiapo Church', 1, NULL, NULL, NULL),
(4, 2, 'Taft Avenue', 2, NULL, NULL, NULL),
(5, 3, 'Ayala MRT Station', 1, NULL, NULL, NULL),
(6, 4, 'Balintawak Cloverleaf', 1, NULL, NULL, NULL),
(7, 4, 'Magallanes Interchange', 2, NULL, NULL, NULL),
(8, 5, 'Nuvali', 1, NULL, NULL, NULL),
(9, 6, 'MOA Globe', 1, NULL, NULL, NULL),
(10, 6, 'Pasay Rotonda', 2, NULL, NULL, NULL),
(11, 7, 'Antipolo Church', 1, NULL, NULL, NULL),
(12, 8, 'NLEX Marilao Exit', 1, NULL, NULL, NULL),
(13, 8, 'San Fernando Exit', 2, NULL, NULL, NULL),
(14, 9, 'Commonwealth Avenue', 1, NULL, NULL, NULL),
(15, 9, 'España Boulevard', 2, NULL, NULL, NULL),
(16, 10, 'South Luzon Expressway', 1, NULL, NULL, NULL),
(17, 11, 'SM City Marilao', 1, 14.7575000, 120.9502000, NULL),
(19, 13, 'SM City Marilao', 1, 14.7575000, 120.9502000, NULL),
(20, 14, 'SM City Marilao', 1, 14.7575000, 120.9502000, NULL),
(21, 15, 'Robinsons Malolos', 1, 14.8430000, 120.8100000, NULL),
(22, 15, 'Marilao Terminal', 2, 14.7573000, 120.9490000, NULL),
(23, 17, 'SM City San Jose Del Monte', 1, 14.8143000, 121.0445000, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ride_schedules`
--

CREATE TABLE `ride_schedules` (
  `schedule_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `days_of_week` set('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `departure_time` time NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ride_schedules`
--

INSERT INTO `ride_schedules` (`schedule_id`, `driver_id`, `is_recurring`, `days_of_week`, `departure_time`, `start_date`, `end_date`, `created_at`) VALUES
(1, 2, 1, 'Monday,Wednesday,Friday', '07:00:00', '2026-07-01', '2026-12-31', '2026-07-13 21:11:58'),
(2, 4, 1, 'Tuesday,Thursday', '08:30:00', '2026-07-01', '2026-12-31', '2026-07-13 21:11:58'),
(3, 5, 0, NULL, '17:30:00', '2026-07-10', '2026-07-10', '2026-07-13 21:11:58'),
(4, 7, 1, 'Monday,Tuesday,Wednesday,Thursday,Friday', '06:00:00', '2026-07-01', '2026-09-30', '2026-07-13 21:11:58'),
(5, 9, 1, 'Saturday,Sunday', '09:00:00', '2026-07-05', '2026-08-30', '2026-07-13 21:11:58'),
(6, 10, 0, NULL, '13:00:00', '2026-07-12', '2026-07-12', '2026-07-13 21:11:58'),
(7, 12, 1, 'Monday,Wednesday', '19:00:00', '2026-07-15', '2026-10-31', '2026-07-13 21:11:58'),
(8, 14, 1, 'Friday', '16:00:00', '2026-07-01', '2026-12-31', '2026-07-13 21:11:58'),
(9, 16, 1, 'Monday,Thursday', '05:30:00', '2026-07-01', '2026-10-31', '2026-07-13 21:11:58'),
(10, 18, 1, 'Sunday', '20:00:00', '2026-07-01', '2026-11-30', '2026-07-13 21:11:58');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','gcash') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','completed') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `booking_id`, `amount`, `payment_method`, `reference_number`, `payment_status`) VALUES
(1, 1, 150.00, 'gcash', 'REF100200300', 'completed'),
(2, 2, 150.00, 'cash', NULL, 'pending'),
(3, 3, 360.00, 'gcash', 'REF400500600', 'completed'),
(4, 4, 120.00, 'cash', NULL, 'pending'),
(5, 5, 500.00, 'gcash', 'REF700800900', 'completed'),
(6, 6, 0.00, 'cash', NULL, 'pending'),
(7, 7, 160.00, 'gcash', 'REF111222333', 'completed'),
(8, 8, 800.00, 'gcash', 'REF444555666', 'pending'),
(9, 9, 300.00, 'gcash', 'REF777888999', 'completed'),
(10, 10, 450.00, 'cash', NULL, 'completed');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `gender` enum('male','female','other','rather_not_say') NOT NULL,
  `birthdate` date NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('passenger','driver','admin') NOT NULL,
  `status` enum('active','pending','suspended','denied') NOT NULL DEFAULT 'pending',
  `password` varchar(250) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `theme_preference` enum('light','dark') NOT NULL DEFAULT 'light',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `gender`, `birthdate`, `phone_number`, `email`, `role`, `status`, `password`, `profile_picture`, `created_at`) VALUES
(1, 'John', 'Doe', 'male', '1998-01-15', '09170000001', 'john@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(2, 'Camille', 'Fernandez', 'female', '1998-07-25', '09170000018', 'camille@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(3, 'Nicole', 'Flores', 'female', '1998-10-06', '09170000010', 'nicole@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', 'profile-pictures/3/3-pfp.jpg', '2026-07-13 21:11:58'),
(4, 'Ryan', 'Aquino', 'male', '1990-12-19', '09170000015', 'ryan@email.com', 'driver', 'denied', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(5, 'Mark', 'Santos', 'male', '1993-06-11', '09170000011', 'mark@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(6, 'Angela', 'Reyes', 'female', '1998-05-02', '09170000004', 'angela@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(7, 'David', 'Lim', 'male', '1992-08-23', '09170000013', 'david@email.com', 'driver', 'pending', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(8, 'Joshua', 'Lopez', 'male', '1999-09-12', '09170000007', 'joshua@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(9, 'Ella', 'Villanueva', 'female', '1996-01-21', '09170000020', 'ella@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(10, 'Maria', 'Dela Cruz', 'female', '1994-02-05', '09170000012', 'maria@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(11, 'Patricia', 'Ramos', 'female', '1997-04-28', '09170000008', 'patricia@email.com', 'passenger', 'pending', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(12, 'Brian', 'Castro', 'male', '1995-03-07', '09170000017', 'brian@email.com', 'driver', 'pending', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(13, 'Michael', 'Garcia', 'male', '1997-07-18', '09170000003', 'michael@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(14, 'Ashley', 'Navarro', 'female', '1997-11-30', '09170000016', 'ashley@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(15, 'Kevin', 'Torres', 'male', '1996-11-09', '09170000005', 'kevin@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(16, 'Christine', 'Tan', 'female', '1996-09-15', '09170000014', 'christine@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(17, 'Samantha', 'Cruz', 'female', '2000-08-17', '09170000006', 'samantha@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(18, 'Joshua', 'Rivera', 'male', '1991-05-13', '09170000019', 'jrivera@email.com', 'driver', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(19, 'Jane', 'Smith', 'female', '1999-03-22', '09170000002', 'jane@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(20, 'Daniel', 'Mendoza', 'male', '1995-12-14', '09170000009', 'daniel@email.com', 'passenger', 'active', '$2a$12$B2yU9.J9EiTIOk8Fx44o8eNyqOejr8FQgV21oukxZwfPb4fHoUyIG', NULL, '2026-07-13 21:11:58'),
(21, 'Super', 'Admin', 'rather_not_say', '1985-04-01', '09179999999', 'admin@katrip.com', 'admin', 'active', '$2a$12$MYcMrT3u6VnoA69TxT2Jk.ka8xawexJvj9EebbDTOAtaK7rTP6kU2', NULL, '2026-07-13 21:11:58'),
(22, 'Francis', 'Reyes', 'male', '2006-05-17', '947-767-0996', 'hans_reyes@dlsu.edu.ph', 'driver', 'pending', '$2y$10$M4ZTO7euDwh/y9uiUcLCK.NWJ3o2qF4HlMCaIlBIzPKGYmbT8BU5O', NULL, '2026-07-13 21:13:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `ride_id` (`ride_id`),
  ADD KEY `passenger_id` (`passenger_id`);

--
-- Indexes for table `driver_documents`
--
ALTER TABLE `driver_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD UNIQUE KEY `unique_driver_document` (`driver_id`,`document_type`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `driver_profiles`
--
ALTER TABLE `driver_profiles`
  ADD PRIMARY KEY (`driver_id`);

--
-- Indexes for table `rides`
--
ALTER TABLE `rides`
  ADD PRIMARY KEY (`ride_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- Indexes for table `ride_landmarks`
--
ALTER TABLE `ride_landmarks`
  ADD PRIMARY KEY (`landmark_id`),
  ADD KEY `ride_id` (`ride_id`);

--
-- Indexes for table `ride_schedules`
--
ALTER TABLE `ride_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `driver_documents`
--
ALTER TABLE `driver_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `rides`
--
ALTER TABLE `rides`
  MODIFY `ride_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `ride_landmarks`
--
ALTER TABLE `ride_landmarks`
  MODIFY `landmark_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `ride_schedules`
--
ALTER TABLE `ride_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`ride_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`passenger_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_documents`
--
ALTER TABLE `driver_documents`
  ADD CONSTRAINT `driver_documents_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `driver_profiles` (`driver_id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_profiles`
--
ALTER TABLE `driver_profiles`
  ADD CONSTRAINT `driver_profiles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `rides`
--
ALTER TABLE `rides`
  ADD CONSTRAINT `rides_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `driver_profiles` (`driver_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rides_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `ride_schedules` (`schedule_id`) ON DELETE SET NULL;

--
-- Constraints for table `ride_landmarks`
--
ALTER TABLE `ride_landmarks`
  ADD CONSTRAINT `ride_landmarks_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`ride_id`) ON DELETE CASCADE;

--
-- Constraints for table `ride_schedules`
--
ALTER TABLE `ride_schedules`
  ADD CONSTRAINT `ride_schedules_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `driver_profiles` (`driver_id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
