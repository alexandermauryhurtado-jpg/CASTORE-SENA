-- MySQL dump 10.13  Distrib 8.0.45, for macos15 (arm64)
--
-- Host: localhost    Database: sgia_dev
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_entity` (`entity`),
  KEY `idx_audit_logs_entity_id` (`entity_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sku_prefix` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_sku_prefix` (`sku_prefix`),
  KEY `idx_categories_parent_id` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','Motor','Partes y componentes del motor','MOTO',NULL,NULL,1,NULL,'2026-03-14 13:22:19','2026-03-14 13:22:19'),('bcebc0e8-1fd2-11f1-b0e4-a2011c8b675f','Suspensión','Sistema de suspensión y dirección','SUSP',NULL,NULL,1,NULL,'2026-03-14 13:22:19','2026-03-14 13:22:19'),('bcebc64c-1fd2-11f1-b0e4-a2011c8b675f','Frenos','Sistema de frenos','FREN',NULL,NULL,1,NULL,'2026-03-14 13:22:19','2026-03-14 13:22:19'),('bcebc796-1fd2-11f1-b0e4-a2011c8b675f','Eléctrico','Sistema eléctrico y electrónico','ELEC',NULL,NULL,1,NULL,'2026-03-14 13:22:19','2026-03-14 13:22:19'),('bcebde16-1fd2-11f1-b0e4-a2011c8b675f','Carrocería','Partes de carrocería y accesorios','CARR',NULL,NULL,1,NULL,'2026-03-14 13:22:19','2026-03-14 13:22:19'),('d229976e-1fd2-11f1-b0e4-a2011c8b675f','Filtros','Filtros de motor y aceite','MFIL',NULL,NULL,1,'bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d229a86c-1fd2-11f1-b0e4-a2011c8b675f','Correas','Correas de distribución y accesorios','MCOR',NULL,NULL,1,'bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d229aa74-1fd2-11f1-b0e4-a2011c8b675f','Bujías','Bujías y sistema de encendido','MBUJ',NULL,NULL,1,'bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d229eb6a-1fd2-11f1-b0e4-a2011c8b675f','Amortiguadores','Amortiguadores y accesorios','SAMO',NULL,NULL,1,'bcebc0e8-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d229effc-1fd2-11f1-b0e4-a2011c8b675f','Resortes','Resortes y muelles','SRES',NULL,NULL,1,'bcebc0e8-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d229f13c-1fd2-11f1-b0e4-a2011c8b675f','Rótulas','Rótulas y terminales de dirección','SROT',NULL,NULL,1,'bcebc0e8-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a1b4e-1fd2-11f1-b0e4-a2011c8b675f','Pastillas','Pastillas de freno','FPAS',NULL,NULL,1,'bcebc64c-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a2530-1fd2-11f1-b0e4-a2011c8b675f','Discos','Discos de freno','FDIS',NULL,NULL,1,'bcebc64c-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a2904-1fd2-11f1-b0e4-a2011c8b675f','Líquido','Líquido de frenos','FLIQ',NULL,NULL,1,'bcebc64c-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a5b7c-1fd2-11f1-b0e4-a2011c8b675f','Baterías','Baterías automotrices','EBAT',NULL,NULL,1,'bcebc796-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a6022-1fd2-11f1-b0e4-a2011c8b675f','Alternadores','Alternadores y arranques','EALT',NULL,NULL,1,'bcebc796-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a61bc-1fd2-11f1-b0e4-a2011c8b675f','Sensores','Sensores y actuadores','ESEN',NULL,NULL,1,'bcebc796-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a8dd6-1fd2-11f1-b0e4-a2011c8b675f','Espejos','Espejos retrovisores','CESP',NULL,NULL,1,'bcebde16-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a920e-1fd2-11f1-b0e4-a2011c8b675f','Parabrisas','Parabrisas y vidrios','CPAR',NULL,NULL,1,'bcebde16-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55'),('d22a9434-1fd2-11f1-b0e4-a2011c8b675f','Paragolpes','Paragolpes y defensas','CPAG',NULL,NULL,1,'bcebde16-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:22:55','2026-03-14 13:22:55');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('WAREHOUSE','ZONE','AISLE','SHELF','CELL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_locations_code` (`code`),
  KEY `idx_locations_parent_id` (`parent_id`),
  KEY `idx_locations_type` (`type`),
  CONSTRAINT `fk_locations_parent` FOREIGN KEY (`parent_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES ('fb735aaa-f236-49aa-872b-8ddb8f0bab35','ZE-01','Zona E - Lubricantes','ZONE',1000,1,'LOC-ALM-001','2026-03-14 17:29:13','2026-03-14 17:29:13'),('LOC-ALM-001','ALM-01','Almacén Principal','WAREHOUSE',10000,1,NULL,'2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-001','ZA-P1-E1','Estante 1','SHELF',100,1,'LOC-PAS-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-002','ZA-P1-E2','Estante 2','SHELF',100,1,'LOC-PAS-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-003','ZA-P2-E1','Estante 1','SHELF',100,1,'LOC-PAS-002','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-004','ZB-P1-E1','Estante 1','SHELF',100,1,'LOC-PAS-003','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-005','ZB-P1-E2','Estante 2','SHELF',100,1,'LOC-PAS-003','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-006','ZC-P1-E1','Estante 1','SHELF',100,1,'LOC-PAS-005','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-EST-007','ZD-P1-E1','Estante 1','SHELF',100,1,'LOC-PAS-006','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-PAS-001','ZA-P1','Pasillo 1','AISLE',500,1,'LOC-ZON-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-PAS-002','ZA-P2','Pasillo 2','AISLE',500,1,'LOC-ZON-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-PAS-003','ZB-P1','Pasillo 1','AISLE',500,1,'LOC-ZON-002','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-PAS-004','ZB-P2','Pasillo 2','AISLE',500,1,'LOC-ZON-002','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-PAS-005','ZC-P1','Pasillo 1','AISLE',400,1,'LOC-ZON-003','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-PAS-006','ZD-P1','Pasillo 1','AISLE',500,1,'LOC-ZON-004','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-ZON-001','ZA-01','Zona A - Motor y Filtros','ZONE',2000,1,'LOC-ALM-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-ZON-002','ZB-01','Zona B - Suspensión y Frenos','ZONE',2000,1,'LOC-ALM-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-ZON-003','ZC-01','Zona C - Eléctrico','ZONE',1500,1,'LOC-ALM-001','2026-03-14 13:23:33','2026-03-14 13:23:33'),('LOC-ZON-004','ZD-01','Zona D - Carrocería','ZONE',2000,1,'LOC-ALM-001','2026-03-14 13:23:33','2026-03-14 13:23:33');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movements`
--

DROP TABLE IF EXISTS `movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movements` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('PURCHASE_ENTRY','SALE_EXIT','TRANSFER','POSITIVE_ADJUSTMENT','NEGATIVE_ADJUSTMENT','RETURN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `stock_before` int NOT NULL,
  `stock_after` int NOT NULL,
  `lot_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `total_cost` decimal(12,2) DEFAULT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_location_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_location_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movements_product_id` (`product_id`),
  KEY `idx_movements_user_id` (`user_id`),
  KEY `idx_movements_supplier_id` (`supplier_id`),
  KEY `idx_movements_type` (`type`),
  KEY `idx_movements_created_at` (`created_at`),
  KEY `idx_movements_from_location` (`from_location_id`),
  KEY `idx_movements_to_location` (`to_location_id`),
  CONSTRAINT `fk_movements_from_location` FOREIGN KEY (`from_location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_movements_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movements_to_location` FOREIGN KEY (`to_location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movements`
--

LOCK TABLES `movements` WRITE;
/*!40000 ALTER TABLE `movements` DISABLE KEYS */;
INSERT INTO `movements` VALUES ('0643141a-7d76-44ac-bac8-1e54f6cb2c7f','TRANSFER',5,24,24,NULL,NULL,'Reorganización de almacén',NULL,NULL,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-001','LOC-EST-002','2026-03-14 18:55:54'),('15f16b75-f0df-46fd-b8d3-35a914d6ec84','SALE_EXIT',3,30,27,NULL,'VTA-2026-100','Venta taller norte',NULL,NULL,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-001',NULL,'2026-03-14 18:52:29'),('1b26ab32-e54b-421a-ad98-9c15d7d64a06','SALE_EXIT',3,27,24,NULL,'VTA-2026-100','Venta taller norte',NULL,NULL,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-001',NULL,'2026-03-14 18:55:46'),('3817bc9a-1fd3-11f1-b0e4-a2011c8b675f','PURCHASE_ENTRY',30,0,30,'LOTE-001','FAC-2026-001','Compra inicial filtros aceite',35000.00,1050000.00,'18b81610-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','fd078978-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-001','2026-03-14 13:25:46'),('3817d68a-1fd3-11f1-b0e4-a2011c8b675f','PURCHASE_ENTRY',20,0,20,'LOTE-002','FAC-2026-002','Compra inicial filtros aire',28000.00,560000.00,'18b83ba4-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','fd079382-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-001','2026-03-14 13:25:46'),('3817dc20-1fd3-11f1-b0e4-a2011c8b675f','PURCHASE_ENTRY',10,0,10,'LOTE-003','FAC-2026-003','Compra inicial baterías',385000.00,3850000.00,'18b86142-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','fd078978-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-006','2026-03-14 13:25:46'),('3817e166-1fd3-11f1-b0e4-a2011c8b675f','PURCHASE_ENTRY',20,0,20,'LOTE-004','FAC-2026-004','Compra inicial pastillas Brembo',125000.00,2500000.00,'18b85396-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','fd07a3cc-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-005','2026-03-14 13:25:46'),('3817e634-1fd3-11f1-b0e4-a2011c8b675f','PURCHASE_ENTRY',10,0,10,'LOTE-005','FAC-2026-005','Compra inicial amortiguadores delanteros',185000.00,1850000.00,'18b84dce-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','fd07917a-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-004','2026-03-14 13:25:46'),('3817ebca-1fd3-11f1-b0e4-a2011c8b675f','SALE_EXIT',6,30,24,NULL,'VTA-2026-001','Venta cliente taller norte',NULL,NULL,'18b81610-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-001','2026-03-14 13:25:46'),('3817efe4-1fd3-11f1-b0e4-a2011c8b675f','SALE_EXIT',17,20,3,NULL,'VTA-2026-002','Venta cliente mayorista',NULL,NULL,'18b83ba4-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-001','2026-03-14 13:25:46'),('3817f39a-1fd3-11f1-b0e4-a2011c8b675f','SALE_EXIT',5,10,5,NULL,'VTA-2026-003','Venta cliente taller centro',NULL,NULL,'18b86142-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-006','2026-03-14 13:25:46'),('3817f818-1fd3-11f1-b0e4-a2011c8b675f','SALE_EXIT',5,20,15,NULL,'VTA-2026-004','Venta pastillas freno',NULL,NULL,'18b85396-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-005','2026-03-14 13:25:46'),('3817fc96-1fd3-11f1-b0e4-a2011c8b675f','SALE_EXIT',4,10,6,NULL,'VTA-2026-005','Venta amortiguadores taller sur',NULL,NULL,'18b84dce-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-004','2026-03-14 13:25:46'),('3818007e-1fd3-11f1-b0e4-a2011c8b675f','NEGATIVE_ADJUSTMENT',10,20,10,NULL,'AJU-2026-001','Ajuste por conteo físico — diferencia encontrada',NULL,NULL,'18b83ba4-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,NULL,'2026-03-14 13:25:46'),('3818038a-1fd3-11f1-b0e4-a2011c8b675f','TRANSFER',3,15,15,NULL,'TRF-2026-001','Transferencia pastillas a zona de despacho',NULL,NULL,'18b85396-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-005','2026-03-14 13:25:46'),('381809d4-1fd3-11f1-b0e4-a2011c8b675f','RETURN',2,3,5,NULL,'DEV-2026-001','Devolución cliente — producto en buen estado',NULL,NULL,'18b86142-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,'LOC-EST-006','2026-03-14 13:25:46'),('6f88fedc-65df-4c8f-91fe-c1b2b322ac0f','RETURN',2,23,25,NULL,'DEV-2026-100','Devolución cliente — producto en buen estado',NULL,NULL,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,NULL,'2026-03-14 18:57:21'),('80829210-8227-4973-8fab-d0129b918779','PURCHASE_ENTRY',10,20,30,'LOTE-100','FAC-2026-100','Reposición de stock',35000.00,350000.00,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','fd078978-1fd2-11f1-b0e4-a2011c8b675f',NULL,'LOC-EST-001','2026-03-14 18:51:04'),('dc8533c9-d9bb-4907-b844-01c378e54fe6','POSITIVE_ADJUSTMENT',20,0,20,NULL,'STOCK_INICIAL',NULL,NULL,NULL,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,NULL,'2026-03-14 18:10:04'),('e3d53087-075d-44cc-9ae9-c611c1a81f2e','NEGATIVE_ADJUSTMENT',1,24,23,NULL,'AJU-2026-101','Producto dañado en almacén',NULL,NULL,'baa2d81b-cd34-45f5-9e21-00b980b18b14','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f',NULL,NULL,NULL,'2026-03-14 18:56:48');
/*!40000 ALTER TABLE `movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_password_resets_token` (`token_hash`),
  KEY `idx_password_resets_user_id` (`user_id`),
  KEY `idx_password_resets_expires_at` (`expires_at`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
INSERT INTO `password_resets` VALUES ('3c4e1fe9-8590-40df-8f60-1b4dd030973f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','a8536d567b3334897832feb3634a0ea48b744e9f66623018b098dd98de711d32','2026-03-14 19:55:57',NULL,'2026-03-14 14:25:56');
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `current_stock` int NOT NULL DEFAULT '0',
  `min_stock` int NOT NULL DEFAULT '0',
  `has_expiry` tinyint(1) NOT NULL DEFAULT '0',
  `expiry_date` date DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','DISCONTINUED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_sku` (`sku`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_location_id` (`location_id`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_current_stock` (`current_stock`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_products_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('18b81610-1fd3-11f1-b0e4-a2011c8b675f','MFIL-00001','Filtro de Aceite Bosch W712','Filtro de aceite de alta calidad para motores nafteros y diésel',35000.00,24,10,0,NULL,'ACTIVE',NULL,'d229976e-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-001','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b83ba4-1fd3-11f1-b0e4-a2011c8b675f','MFIL-00002','Filtro de Aire Mann C1374','Filtro de aire para vehículos de pasajeros',28000.00,3,8,0,NULL,'ACTIVE',NULL,'d229976e-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-001','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b83fdc-1fd3-11f1-b0e4-a2011c8b675f','MFIL-00003','Filtro de Combustible Fram G3727','Filtro de combustible universal para inyección',22000.00,0,5,0,NULL,'ACTIVE',NULL,'d229976e-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-002','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b842e8-1fd3-11f1-b0e4-a2011c8b675f','MCOR-00001','Correa de Distribución Gates T246','Correa de distribución para motores de 4 cilindros',95000.00,12,5,0,NULL,'ACTIVE',NULL,'d229a86c-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-002','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b845ae-1fd3-11f1-b0e4-a2011c8b675f','MCOR-00002','Correa Poly-V Dayco 6PK1550','Correa poly-v para accesorios del motor',45000.00,8,4,0,NULL,'ACTIVE',NULL,'d229a86c-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-003','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b84874-1fd3-11f1-b0e4-a2011c8b675f','MBUJ-00001','Bujía NGK BKR6E','Bujía estándar de cobre para motores nafteros',12000.00,48,20,0,NULL,'ACTIVE',NULL,'d229aa74-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-003','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b84b1c-1fd3-11f1-b0e4-a2011c8b675f','MBUJ-00002','Bujía Bosch Super Plus FR7DC','Bujía de doble electrodo de larga duración',18000.00,2,10,0,NULL,'ACTIVE',NULL,'d229aa74-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-003','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b84dce-1fd3-11f1-b0e4-a2011c8b675f','SAMO-00001','Amortiguador Monroe Gas-Magnum Delantero','Amortiguador de gas de alto rendimiento eje delantero',185000.00,6,4,0,NULL,'ACTIVE',NULL,'d229eb6a-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-004','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b850e4-1fd3-11f1-b0e4-a2011c8b675f','SAMO-00002','Amortiguador Monroe Trasero','Amortiguador trasero para sedanes y hatchback',165000.00,0,4,0,NULL,'ACTIVE',NULL,'d229eb6a-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-004','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b85396-1fd3-11f1-b0e4-a2011c8b675f','FPAS-00001','Pastillas de Freno Brembo P06020','Pastillas de freno delanteras cerámicas de alto rendimiento',125000.00,15,6,0,NULL,'ACTIVE',NULL,'d22a1b4e-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-005','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b85b8e-1fd3-11f1-b0e4-a2011c8b675f','FPAS-00002','Pastillas de Freno Bosch BP956','Pastillas traseras para vehículos compactos',89000.00,3,6,0,NULL,'ACTIVE',NULL,'d22a1b4e-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-005','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b85e86-1fd3-11f1-b0e4-a2011c8b675f','FDIS-00001','Disco de Freno Brembo 09A40111','Disco de freno ventilado delantero de alto rendimiento',220000.00,8,4,0,NULL,'ACTIVE',NULL,'d22a2530-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-005','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b86142-1fd3-11f1-b0e4-a2011c8b675f','EBAT-00001','Batería Bosch S4 70Ah','Batería libre de mantenimiento 70Ah 640A arranque en frío',385000.00,5,3,0,NULL,'ACTIVE',NULL,'d22a5b7c-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-006','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b86426-1fd3-11f1-b0e4-a2011c8b675f','EBAT-00002','Batería Motorcraft BXT-45','Batería estándar 45Ah para vehículos compactos',295000.00,0,3,0,NULL,'INACTIVE',NULL,'d22a5b7c-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-006','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b866d8-1fd3-11f1-b0e4-a2011c8b675f','ESEN-00001','Sensor de Oxígeno Bosch 0258005133','Sensor lambda universal banda ancha 4 cables',145000.00,7,3,0,NULL,'ACTIVE',NULL,'d22a61bc-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-006','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b869f8-1fd3-11f1-b0e4-a2011c8b675f','CESP-00001','Espejo Retrovisor Derecho Universal','Espejo retrovisor manual con ajuste lateral derecho',75000.00,4,3,0,NULL,'ACTIVE',NULL,'d22a8dd6-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-007','2026-03-14 13:24:53','2026-03-14 13:24:53'),('18b86de0-1fd3-11f1-b0e4-a2011c8b675f','CESP-00002','Espejo Retrovisor Izquierdo Universal','Espejo retrovisor manual con ajuste lateral izquierdo',75000.00,4,3,0,NULL,'ACTIVE',NULL,'d22a8dd6-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-007','2026-03-14 13:24:53','2026-03-14 13:24:53'),('7f1a3a13-9c90-4194-9142-699df45f7e8a','MOTO-00001','Aceite Motor Mobil 1 5W-30','Aceite sintético de alto rendimiento para motores modernos',85000.00,20,8,0,NULL,'ACTIVE',NULL,'bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-001','2026-03-14 18:07:29','2026-03-14 18:07:29'),('baa2d81b-cd34-45f5-9e21-00b980b18b14','MOTO-00003','Aceite Motor Mobil 1 5W-30','Aceite sintético de alto rendimiento para motores modernos',85000.00,25,8,0,NULL,'ACTIVE',NULL,'bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-002','2026-03-14 18:10:04','2026-03-14 18:57:21'),('cc763267-2231-4e11-bb60-7f482e369f5f','MOTO-00002','Aceite Motor Mobil 1 5W-30','Aceite sintético de alto rendimiento para motores modernos',85000.00,20,8,0,NULL,'ACTIVE',NULL,'bcebbb02-1fd2-11f1-b0e4-a2011c8b675f','LOC-EST-001','2026-03-14 18:08:24','2026-03-14 18:08:24'),('e841c05e-e5c8-410c-a3da-a5dec8d0a986','MFIL-00004','Demo prueba','Demo',10000.00,0,0,0,NULL,'ACTIVE',NULL,'d229976e-1fd2-11f1-b0e4-a2011c8b675f',NULL,'2026-03-14 22:16:22','2026-03-14 22:16:22');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `permissions` json NOT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('997ad072-1fd2-11f1-b0e4-a2011c8b675f','Administrador','Acceso total al sistema','{\"roles\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"users\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"alerts\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"products\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"dashboard\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"locations\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"movements\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"suppliers\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}, \"categories\": {\"read\": true, \"create\": true, \"delete\": true, \"update\": true}}',1,1,'2026-03-14 13:21:20','2026-03-14 13:21:20'),('997b0934-1fd2-11f1-b0e4-a2011c8b675f','Supervisor','Gestión de inventario sin administración de usuarios','{\"roles\": {\"read\": false, \"create\": false, \"delete\": false, \"update\": false}, \"users\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"alerts\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}, \"products\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}, \"dashboard\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"locations\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}, \"movements\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}, \"suppliers\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}, \"categories\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": true}}',1,1,'2026-03-14 13:21:20','2026-03-14 13:21:20'),('997b0c72-1fd2-11f1-b0e4-a2011c8b675f','Operador','Solo registro de movimientos y consultas','{\"roles\": {\"read\": false, \"create\": false, \"delete\": false, \"update\": false}, \"users\": {\"read\": false, \"create\": false, \"delete\": false, \"update\": false}, \"alerts\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"products\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"dashboard\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"locations\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"movements\": {\"read\": true, \"create\": true, \"delete\": false, \"update\": false}, \"suppliers\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"categories\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}}',1,1,'2026-03-14 13:21:20','2026-03-14 13:21:20'),('9a83d9be-6bfa-445a-86a2-8e3691d8938d','Auditor Externo','Acceso de solo lectura para auditores externos','{\"roles\": {\"read\": false, \"create\": false, \"delete\": false, \"update\": false}, \"users\": {\"read\": false, \"create\": false, \"delete\": false, \"update\": false}, \"alerts\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"products\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"dashboard\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"locations\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"movements\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"suppliers\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}, \"categories\": {\"read\": true, \"create\": false, \"delete\": false, \"update\": false}}',0,1,'2026-03-14 16:08:05','2026-03-14 16:09:36');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_alerts`
--

DROP TABLE IF EXISTS `stock_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_alerts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('LOW_STOCK','EXPIRY_30D','EXPIRY_15D','EXPIRY_7D') COLLATE utf8mb4_unicode_ci NOT NULL,
  `threshold` int NOT NULL,
  `current_value` int NOT NULL,
  `status` enum('ACTIVE','RESOLVED','DISMISSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stock_alerts_product_id` (`product_id`),
  KEY `idx_stock_alerts_status` (`status`),
  KEY `idx_stock_alerts_type` (`type`),
  KEY `idx_stock_alerts_resolved_by` (`resolved_by`),
  KEY `idx_stock_alerts_created_at` (`created_at`),
  CONSTRAINT `fk_stock_alerts_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_alerts_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_alerts`
--

LOCK TABLES `stock_alerts` WRITE;
/*!40000 ALTER TABLE `stock_alerts` DISABLE KEYS */;
INSERT INTO `stock_alerts` VALUES ('4b574636-1fd3-11f1-b0e4-a2011c8b675f','LOW_STOCK',8,3,'ACTIVE','Stock por debajo del mínimo requerido','18b83ba4-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18'),('4b57514e-1fd3-11f1-b0e4-a2011c8b675f','LOW_STOCK',6,3,'ACTIVE','Stock crítico pastillas de freno','18b85b8e-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18'),('4b57545a-1fd3-11f1-b0e4-a2011c8b675f','LOW_STOCK',10,2,'ACTIVE','Stock bajo bujías Bosch','18b84b1c-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18'),('4b575694-1fd3-11f1-b0e4-a2011c8b675f','LOW_STOCK',4,0,'ACTIVE','Sin stock amortiguador trasero','18b850e4-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18'),('4b5758c4-1fd3-11f1-b0e4-a2011c8b675f','LOW_STOCK',5,0,'ACTIVE','Sin stock filtro de combustible','18b83fdc-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18'),('4b575aea-1fd3-11f1-b0e4-a2011c8b675f','LOW_STOCK',10,5,'RESOLVED','Stock repuesto con compra FAC-2026-003','18b86142-1fd3-11f1-b0e4-a2011c8b675f','ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','2026-03-14 13:26:18','2026-03-14 13:26:18'),('4b575cd4-1fd3-11f1-b0e4-a2011c8b675f','EXPIRY_30D',30,28,'ACTIVE','Producto próximo a vencer en 28 días','18b81610-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18'),('4b575eaa-1fd3-11f1-b0e4-a2011c8b675f','EXPIRY_15D',15,12,'ACTIVE','Producto vence en 12 días — acción urgente','18b83ba4-1fd3-11f1-b0e4-a2011c8b675f',NULL,NULL,'2026-03-14 13:26:18');
/*!40000 ALTER TABLE `stock_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trade_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('NATIONAL','INTERNATIONAL','MANUFACTURER','DISTRIBUTOR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contributor_type` enum('LARGE','COMMON','SIMPLIFIED','NON_CONTRIBUTOR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Colombia',
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COP',
  `website` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_suppliers_tax_id` (`tax_id`),
  KEY `idx_suppliers_type` (`type`),
  KEY `idx_suppliers_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES ('4fb16ca0-25a0-49ab-a36a-10b484dd37e6','Distribuidora Andina de Repuestos S.A.S','Repuestos Andina','900111222-3','DISTRIBUTOR','COMMON','Colombia','Antioquia','Medellín','Carrera 65 # 98-30 Zona Industrial','6044112233','ventas@repuestosandina.com','María Cardona','30','COP',NULL,NULL,1,'2026-03-14 17:47:10','2026-03-14 17:47:10'),('fd078978-1fd2-11f1-b0e4-a2011c8b675f','Bosch Colombia S.A.S','Bosch Auto','900123456-1','MANUFACTURER','LARGE','Colombia','Cundinamarca','Bogotá','Calle 100 # 15-20 Zona Industrial','6017001234','ventas@bosch.com.co','Carlos Mendoza','30','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07'),('fd07917a-1fd2-11f1-b0e4-a2011c8b675f','Distribuidora Monroe Andina Ltda','Monroe Andina','800987654-2','DISTRIBUTOR','COMMON','Colombia','Antioquia','Medellín','Carrera 50 # 45-10 Itagüí','6044509876','comercial@monroeandina.com','Ana Gómez','60','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07'),('fd079382-1fd2-11f1-b0e4-a2011c8b675f','Filtros Fram Colombia S.A.S','Fram Colombia','901234567-3','MANUFACTURER','COMMON','Colombia','Valle del Cauca','Cali','Avenida 3N # 25-40 Zona Franca','6023451234','info@framcolombia.com','Pedro Restrepo','30','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07'),('fd07a3cc-1fd2-11f1-b0e4-a2011c8b675f','Brembo South America Inc','Brembo','900456789-4','MANUFACTURER','LARGE','Colombia','Cundinamarca','Bogotá','Calle 80 # 69-05 Fontibón','6017890123','ventas@brembo.com.co','María Torres','60','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07'),('fd07a552-1fd2-11f1-b0e4-a2011c8b675f','Motorcraft Distribuciones S.A','Motorcraft','800345678-5','DISTRIBUTOR','COMMON','Colombia','Atlántico','Barranquilla','Carrera 46 # 70-20 Barranquilla','6053456789','pedidos@motorcraft.com.co','Luis Herrera','30','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07'),('fd07a6b0-1fd2-11f1-b0e4-a2011c8b675f','NGK Spark Plugs Colombia','NGK Colombia','901567890-6','MANUFACTURER','LARGE','Colombia','Cundinamarca','Bogotá','Autopista Norte Km 15 Zona Industrial','6016789012','ventas@ngkcolombia.com','Jorge Ramírez','45','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07'),('fd07ab1a-1fd2-11f1-b0e4-a2011c8b675f','Autopartes del Pacífico S.A.S','Autopacífico','800678901-7','DISTRIBUTOR','SIMPLIFIED','Colombia','Valle del Cauca','Cali','Calle 15 # 40-10 Acopi Yumbo','6022345678','info@autopacifico.com','Sandra López','CONTADO','COP',NULL,NULL,1,'2026-03-14 13:24:07','2026-03-14 13:24:07');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `first_login` tinyint(1) NOT NULL DEFAULT '1',
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_is_active` (`is_active`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('08156bc1-fc37-472c-8100-cc62197054a0','Daniel mayo','vargasmayo.c99@gmail.com','$2b$12$Zpoedm8g08KHadtbt1xV1eNy6PIKv3V8zSOhMcQVUf9SiZktaccIO',1,1,'997b0934-1fd2-11f1-b0e4-a2011c8b675f',NULL,'2026-03-14 16:38:19','2026-03-14 17:42:18'),('2615be8f-f607-47f3-9515-956267777c55','Juan Restrepo','vargasmayo.c99+01@gmail.com','$2b$12$jBegwFps99ccjvHyAnM2nuSxY3AIyHaY4rHxTyQmqgYMsVtwq/vrS',1,1,'997b0934-1fd2-11f1-b0e4-a2011c8b675f',NULL,'2026-03-14 17:43:05','2026-03-14 17:43:05'),('ae20dac6-1fd2-11f1-b0e4-a2011c8b675f','Administrador Principal','admin@sgia.com','$2b$12$nK0HlKiIey0Fz1hBqY4cLeLl4zhe3ZNC6RP3r8qHF7eAQcJWDtuhq',1,0,'997ad072-1fd2-11f1-b0e4-a2011c8b675f','2026-03-15 10:30:53','2026-03-14 13:21:55','2026-03-15 10:30:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'sgia_dev'
--

--
-- Dumping routines for database 'sgia_dev'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-15 11:12:33
