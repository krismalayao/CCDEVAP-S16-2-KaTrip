# Welcome to KaTrip
KaTrip is a community-centric web application designed to centralize and automate trip coordination for groups like students and office workers. Unlike standard real-time ride-hailing services such as Grab or InDrive, which focus on on-demand bookings and variable pricing, KaTrip operates as a planned carpool scheduling and reservation system. It empowers users to schedule their commutes in advance, creating a culture of shared mobility and mutual benefit within a trusted community.

## 📌 Table of Contents
* [Tech Stack used in the Development](#-tech-stack-used-in-the-development)
* [How to locally Set-up the Project](#-how-to-locally-set-up-the-project)
  * [Pre-requisites](#️-pre-requisites-️)
  * [Installation Process](#-installation-process)
  * [Database Configurations / Troubleshooting](#️-database-configurations--troubleshooting)
* [KaTrip Application Developers](#%EF%B8%8F-katrip-application-developers-)

## 🛠 Tech Stack used in the Development
**Frontend:** HTML, CSS, JavaScript  
**Backend:** PHP  
**Database:** MySQL

## 💻 How to locally Set-up the Project

### ‼️ Pre-requisites ‼️
Make sure you have the following tools and languages installed:
1. [PHP](https://www.php.net/)
2. [MySQL](https://www.mysql.com/)
3. [XAMPP](https://www.apachefriends.org/)

_We do recommend for you to set-up XAMPP first before working with the project. The XAMPP works as a local server to host the computer so it could integrate the database connection and sessions. You may watch a [tutorial](https://youtu.be/G2VEf-8nepc?si=DmioT7v85HLwz2gf) on how to set-up your computer to be able to use XAMPP._

### 💾 Installation Process
1. Clone the repository and make sure it is located at "htdocs/" folder.
2. Open XAMPP, then start Apache and MySQL. _(However, we will be using the phpMyAdmin to set-up the database later on)._
3. Open http://localhost/phpmyadmin/ on your prefered browser then navigate through the "Import" tab at the naviagation bar.
4. Choose file to import and select "CCDEVAP-S16-2-KaTrip.sql" found in the /database folder of the project. Kindly enable foreign key checks before importing.
5. To verify, you may check the Databases tab and look for katrip_db. This means that the database is finally in the system.

You have finally installed the project!

### ⚙️ Database Configurations / Troubleshooting
Currently the database configuration is located at /config/db.php, and by default, the configuration iset with the following credentials:  
* **Host:** "localhost:3306";  
* **Database:** "katrip_db";  
* **Username:** "root";  
* **Password:** "Dlsu1234!";  

This is because the MySQL had a set password already. If you have not yet set a password for the MySQL, kindly delete the password in the file. If you have set-up a password, kindly change for the database integration to work on your end.

## 🙋‍♂️ KaTrip Application Developers 🙋
Juan Lorenzo Atacador - [@JLNATACADOR](https://github.com/JLNATACADOR)  
Luis Gabriel Lwin - [@LuisLwin](https://github.com/LuisLwin)  
Kristopher Malayao - [@krismalayao](https://github.com/krismalayao)  
Francis Hans Reyes - [@hansisco](https://github.com/hansisco)  
Princess Marianne Riego - [@rianeriego](https://github.com/rianeriego)