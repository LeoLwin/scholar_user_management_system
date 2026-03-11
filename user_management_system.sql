/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 8.4.7 : Database - user_management
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`user_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `user_management`;

/*Table structure for table `admin_users` */

DROP TABLE IF EXISTS `admin_users`;

CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `role_id` int NOT NULL,
  `phone` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  `password` varchar(700) NOT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `is_active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `admin_users` */

insert  into `admin_users`(`id`,`name`,`username`,`role_id`,`phone`,`email`,`address`,`password`,`gender`,`is_active`) values 
(3,'Kaung Htet Lwin Update','Kaung Htet Lwin',1,'0912345678','kaunghtet982@gmail.com','Pyay','$2b$10$SqKqzHx8kI.vktA1l.w5heCG6jXeSom3Z8rlam.D2aSIoO99GLG.q','male',1),
(4,'Kaung Htet Lwin','Kaung Htet Lwin',1,'0912345678','kaunghtet206@gmail.com','Pyay','$2b$10$G0I8a4A35lvuNEMM5/ogyOVCWWbXouFmTqfnKH1uz6a1dFcNLm8tm','male',1),
(5,'Admin','admin',1,'091234567','admin@system.com','System Office','$2b$10$ZQtJpktYIxFoM78wNQJI..rne/1mosu41q4PkXwr/URawT12fb9xC','male',1);

/*Table structure for table `features` */

DROP TABLE IF EXISTS `features`;

CREATE TABLE `features` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `features` */

insert  into `features`(`id`,`name`) values 
(1,'user'),
(2,'roles'),
(3,'product');

/*Table structure for table `permissions` */

DROP TABLE IF EXISTS `permissions`;

CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `feature_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name&featureIdIndex` (`name`,`feature_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `permissions` */

insert  into `permissions`(`id`,`name`,`feature_id`) values 
(5,'create',2),
(4,'delete',1),
(8,'delete',2),
(2,'read',1),
(6,'read',2),
(3,'update',1),
(7,'update',2);

/*Table structure for table `roles` */

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `roles` */

insert  into `roles`(`id`,`name`) values 
(1,'admin'),
(2,'operator'),
(3,'Cashier'),
(7,'user');

/*Table structure for table `roles_permissions` */

DROP TABLE IF EXISTS `roles_permissions`;

CREATE TABLE `roles_permissions` (
  `role_id` int NOT NULL,
  `permissions_id` varchar(45) NOT NULL,
  UNIQUE KEY `role_idAndpermissions_id` (`role_id`,`permissions_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `roles_permissions` */

insert  into `roles_permissions`(`role_id`,`permissions_id`) values 
(1,'1'),
(1,'2'),
(1,'3'),
(1,'4'),
(1,'5'),
(1,'6'),
(1,'7'),
(1,'8'),
(7,'1');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
