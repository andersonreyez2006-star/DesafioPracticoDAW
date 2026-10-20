-- Script opcional (MySQL / MariaDB). Importar con:
--   mysql -u root -p < paises_clima.sql
-- La app React consume las APIs directamente; esta base sirve para
-- guardar un catálogo local y el historial de consultas de clima.

CREATE DATABASE IF NOT EXISTS paises_clima
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paises_clima;

DROP TABLE IF EXISTS consultas_clima;
DROP TABLE IF EXISTS paises;

CREATE TABLE paises (
  cca3        CHAR(3)       NOT NULL PRIMARY KEY,
  cca2        CHAR(2)       NOT NULL,
  nombre      VARCHAR(120)  NOT NULL,
  capital     VARCHAR(120)  NULL,
  region      VARCHAR(60)   NULL,
  poblacion   BIGINT        NULL,
  bandera_url VARCHAR(255)  NOT NULL
);

CREATE TABLE consultas_clima (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cca3          CHAR(3)       NOT NULL,
  temperatura   DECIMAL(5,2)  NOT NULL,
  estado        VARCHAR(100)  NOT NULL,
  humedad       TINYINT       NOT NULL,
  viento_ms     DECIMAL(5,2)  NOT NULL,
  consultado_en TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consulta_pais FOREIGN KEY (cca3) REFERENCES paises(cca3)
);

INSERT INTO paises (cca3, cca2, nombre, capital, region, poblacion, bandera_url) VALUES
('SLV','SV','El Salvador','San Salvador','Americas',6364943,'https://flagcdn.com/w320/sv.png'),
('MEX','MX','México','Ciudad de México','Americas',128932753,'https://flagcdn.com/w320/mx.png'),
('GTM','GT','Guatemala','Ciudad de Guatemala','Americas',17843908,'https://flagcdn.com/w320/gt.png'),
('HND','HN','Honduras','Tegucigalpa','Americas',9904608,'https://flagcdn.com/w320/hn.png'),
('COL','CO','Colombia','Bogotá','Americas',50882884,'https://flagcdn.com/w320/co.png'),
('ARG','AR','Argentina','Buenos Aires','Americas',45376763,'https://flagcdn.com/w320/ar.png'),
('ESP','ES','España','Madrid','Europe',47351567,'https://flagcdn.com/w320/es.png'),
('FRA','FR','Francia','París','Europe',67391582,'https://flagcdn.com/w320/fr.png'),
('JPN','JP','Japón','Tokio','Asia',125836021,'https://flagcdn.com/w320/jp.png'),
('USA','US','Estados Unidos','Washington, D.C.','Americas',329484123,'https://flagcdn.com/w320/us.png');

INSERT INTO consultas_clima (cca3, temperatura, estado, humedad, viento_ms) VALUES
('SLV', 27.50, 'nubes dispersas', 70, 3.10),
('ESP', 18.20, 'cielo claro', 55, 2.40);

-- Consultas de ejemplo
SELECT nombre, capital FROM paises ORDER BY nombre;
SELECT p.nombre, c.temperatura, c.estado, c.humedad, c.viento_ms, c.consultado_en
FROM consultas_clima c JOIN paises p ON p.cca3 = c.cca3
ORDER BY c.consultado_en DESC;
