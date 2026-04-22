-- Run once on databases created from Migrate.sql before 2026-04 (API mock → DB).
-- Skip any statement that fails with "Duplicate column name" / "Duplicate key name".

-- Gallery (marketing)
CREATE TABLE IF NOT EXISTS gallery_media
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    media_type    ENUM ('image', 'video', 'youtube') NOT NULL,
    src           TEXT         NOT NULL,
    thumbnail     TEXT         NULL,
    video_id      VARCHAR(64)  NULL,
    category      VARCHAR(64)  NOT NULL,
    display_order INT          NOT NULL DEFAULT 0,
    created_by    VARCHAR(255) NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_category (category),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS gallery_media_units
(
    media_id INT         NOT NULL,
    unit       VARCHAR(64) NOT NULL,
    PRIMARY KEY (media_id, unit),
    FOREIGN KEY (media_id) REFERENCES gallery_media (id) ON DELETE CASCADE
);

-- Operation intel (mission-scoped text blocks)
ALTER TABLE operation_intel
    ADD COLUMN mission_id VARCHAR(255) NULL AFTER campaign_id,
    ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
    ADD INDEX idx_mission_id (mission_id);

ALTER TABLE operation_intel
    ADD CONSTRAINT fk_operation_intel_mission FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE;

-- Planning documents metadata
ALTER TABLE operation_documents
    ADD COLUMN doc_type VARCHAR(64) NULL AFTER description,
    ADD COLUMN classification VARCHAR(64) NULL AFTER doc_type,
    ADD COLUMN doc_date DATE NULL AFTER classification;

-- SSE items: mission scope + free-form type + classification
ALTER TABLE sse_items
    ADD COLUMN mission_id VARCHAR(255) NULL AFTER campaign_id,
    ADD COLUMN classification VARCHAR(64) NULL AFTER image_url,
    ADD COLUMN collected_date DATE NULL AFTER classification,
    ADD INDEX idx_mission_id (mission_id);

ALTER TABLE sse_items
    ADD CONSTRAINT fk_sse_items_mission FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE SET NULL;

ALTER TABLE sse_items
    MODIFY COLUMN type VARCHAR(64) NOT NULL;
