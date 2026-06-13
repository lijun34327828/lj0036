import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'analytics.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      publish_date DATETIME NOT NULL,
      cover_url TEXT
    );

    CREATE TABLE IF NOT EXISTS article_metrics (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      unique_views INTEGER DEFAULT 0,
      completed_views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      favorites INTEGER DEFAULT 0,
      new_followers INTEGER DEFAULT 0,
      avg_read_time_seconds REAL DEFAULT 0,
      FOREIGN KEY (article_id) REFERENCES articles(id)
    );

    CREATE TABLE IF NOT EXISTS raw_visit_logs (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      visit_time DATETIME NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      scroll_depth_percent INTEGER DEFAULT 0,
      is_valid BOOLEAN DEFAULT 1,
      ip_address TEXT,
      FOREIGN KEY (article_id) REFERENCES articles(id)
    );

    CREATE INDEX IF NOT EXISTS idx_article_metrics_article_id ON article_metrics(article_id);
    CREATE INDEX IF NOT EXISTS idx_visits_article_time ON raw_visit_logs(article_id, visit_time);
    CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
  `);
}
