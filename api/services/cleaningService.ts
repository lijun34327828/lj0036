import { db } from '../db/index.js';

export interface CleaningStats {
  totalVisits: number;
  invalidVisits: number;
  validVisits: number;
  invalidByShortDuration: number;
  invalidByLowScroll: number;
  invalidByDuplicate: number;
}

export function cleanInvalidVisits(): CleaningStats {
  const stats: CleaningStats = {
    totalVisits: 0,
    invalidVisits: 0,
    validVisits: 0,
    invalidByShortDuration: 0,
    invalidByLowScroll: 0,
    invalidByDuplicate: 0,
  };

  const totalRow = db.prepare('SELECT COUNT(*) as cnt FROM raw_visit_logs').get() as { cnt: number };
  stats.totalVisits = totalRow.cnt;

  const shortDuration = db.prepare(`
    SELECT COUNT(*) as cnt FROM raw_visit_logs
    WHERE duration_seconds < 3 AND is_valid = 1
  `).get() as { cnt: number };
  stats.invalidByShortDuration = shortDuration.cnt;

  db.prepare(`
    UPDATE raw_visit_logs
    SET is_valid = 0
    WHERE duration_seconds < 3 AND is_valid = 1
  `).run();

  const lowScroll = db.prepare(`
    SELECT COUNT(*) as cnt FROM raw_visit_logs
    WHERE scroll_depth_percent < 5 AND is_valid = 1
  `).get() as { cnt: number };
  stats.invalidByLowScroll = lowScroll.cnt;

  db.prepare(`
    UPDATE raw_visit_logs
    SET is_valid = 0
    WHERE scroll_depth_percent < 5 AND is_valid = 1
  `).run();

  const duplicates = db.prepare(`
    SELECT COUNT(*) as cnt
    FROM raw_visit_logs r1
    WHERE is_valid = 1 AND EXISTS (
      SELECT 1 FROM raw_visit_logs r2
      WHERE r2.article_id = r1.article_id
        AND r2.visitor_id = r1.visitor_id
        AND r2.visit_time > r1.visit_time
        AND (JULIANDAY(r2.visit_time) - JULIANDAY(r1.visit_time)) * 24 < 1
    )
  `).get() as { cnt: number };
  stats.invalidByDuplicate = duplicates.cnt;

  db.prepare(`
    UPDATE raw_visit_logs
    SET is_valid = 0
    WHERE id IN (
      SELECT r1.id
      FROM raw_visit_logs r1
      WHERE r1.is_valid = 1 AND EXISTS (
        SELECT 1 FROM raw_visit_logs r2
        WHERE r2.article_id = r1.article_id
          AND r2.visitor_id = r1.visitor_id
          AND r2.visit_time > r1.visit_time
          AND (JULIANDAY(r2.visit_time) - JULIANDAY(r1.visit_time)) * 24 < 1
      )
    )
  `).run();

  const invalidRow = db.prepare('SELECT COUNT(*) as cnt FROM raw_visit_logs WHERE is_valid = 0').get() as { cnt: number };
  stats.invalidVisits = invalidRow.cnt;
  stats.validVisits = stats.totalVisits - stats.invalidVisits;

  return stats;
}
