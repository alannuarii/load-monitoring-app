-- =====================================================
-- PM Realizations Database Schema
-- Run this script on your PostgreSQL server
-- =====================================================

-- Tabel utama untuk realisasi PM
CREATE TABLE pm_realizations (
    id SERIAL PRIMARY KEY,
    tanggal_pelaksanaan DATE NOT NULL,
    unit INTEGER NOT NULL,
    mesin VARCHAR(100) NOT NULL,
    jenis_pm VARCHAR(10) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel detail material yang digunakan
CREATE TABLE pm_realization_materials (
    id SERIAL PRIMARY KEY,
    realization_id INTEGER NOT NULL REFERENCES pm_realizations(id) ON DELETE CASCADE,
    nama_material VARCHAR(255) NOT NULL,
    jumlah_standar DECIMAL(10,2) NOT NULL DEFAULT 0,
    jumlah_realisasi DECIMAL(10,2) NOT NULL DEFAULT 0,
    satuan VARCHAR(50) NOT NULL,
    cycle VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk query performa
CREATE INDEX idx_pm_realizations_tanggal ON pm_realizations(tanggal_pelaksanaan);
CREATE INDEX idx_pm_realizations_unit ON pm_realizations(unit);
CREATE INDEX idx_pm_realization_materials_realization ON pm_realization_materials(realization_id);
