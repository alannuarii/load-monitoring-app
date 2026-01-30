-- =====================================================
-- Overhaul Realizations Table
-- Run this script on your PostgreSQL server
-- =====================================================

CREATE TABLE overhaul_realizations (
    id SERIAL PRIMARY KEY,
    unit INTEGER NOT NULL,
    jenis_overhaul VARCHAR(50) NOT NULL,
    tanggal_selesai DATE NOT NULL,
    jam_overhaul INTEGER NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup of latest realization per unit
CREATE INDEX idx_overhaul_realizations_unit_date ON overhaul_realizations(unit, tanggal_selesai DESC);
