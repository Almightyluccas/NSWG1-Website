CREATE TABLE IF NOT EXISTS operation_document_missions (
  document_id INT NOT NULL,
  mission_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (document_id, mission_id),
  FOREIGN KEY (document_id) REFERENCES operation_documents (id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sse_item_missions (
  sse_id INT NOT NULL,
  mission_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (sse_id, mission_id),
  FOREIGN KEY (sse_id) REFERENCES sse_items (id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE
);

INSERT IGNORE INTO operation_document_missions (document_id, mission_id)
SELECT id, mission_id
FROM operation_documents
WHERE mission_id IS NOT NULL;

INSERT IGNORE INTO sse_item_missions (sse_id, mission_id)
SELECT id, mission_id
FROM sse_items
WHERE mission_id IS NOT NULL;
