import { db } from './index.js';

const CATEGORIES = ['行业资讯', '产品运营', '技术干货', '用户增长', '品牌营销', '案例分析', '行业报告'];
const AUTHORS = ['张明', '李华', '王芳', '赵强', '陈静', '刘洋', '周磊'];

const TITLE_TEMPLATES = [
  '2024年{topic}深度分析与未来趋势',
  '如何通过{topic}实现业务增长：实战指南',
  '{topic}最佳实践：从入门到精通',
  '揭秘{topic}背后的核心逻辑',
  '案例拆解：{topic}如何提升转化率300%',
  '{topic}避坑指南：运营人必看的10个要点',
  '万字长文：{topic}全景解读',
  '干货分享：{topic}方法论全解析',
  '{topic}的底层逻辑与商业价值',
  '从0到1搭建{topic}体系完整方案',
  '{topic}进阶技巧：高手都在用的方法',
  '一文读懂{topic}：运营小白进阶指南',
  '深度洞察：{topic}发展现状与挑战',
  '{topic}实战案例：5个经典场景解析',
  '新视角看{topic}：被忽略的关键因素',
];

const TOPICS = [
  '内容运营', '用户增长', '私域流量', '短视频营销', '品牌建设',
  '数据驱动', '社群运营', '转化漏斗', '用户画像', 'A/B测试',
  '内容策略', '流量变现', '会员体系', '活动策划', '裂变增长',
];

function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitle(): string {
  const template = randomItem(TITLE_TEMPLATES);
  const topic = randomItem(TOPICS);
  return template.replace('{topic}', topic);
}

function generateDates(daysBack: number, count: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - randomInt(0, daysBack));
    d.setHours(randomInt(6, 23), randomInt(0, 59));
    dates.push(d.toISOString());
  }
  return dates;
}

export function seedData(): void {
  const existing = db.prepare('SELECT COUNT(*) as cnt FROM articles').get() as { cnt: number };
  if (existing.cnt > 0) return;

  const articlesCount = 60;
  const dates = generateDates(90, articlesCount);

  const insertArticle = db.prepare(`
    INSERT INTO articles (id, title, category, author, publish_date, cover_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMetrics = db.prepare(`
    INSERT INTO article_metrics (id, article_id, views, unique_views, completed_views, likes, shares, comments, favorites, new_followers, avg_read_time_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVisit = db.prepare(`
    INSERT INTO raw_visit_logs (id, article_id, visitor_id, visit_time, duration_seconds, scroll_depth_percent, is_valid, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (let i = 0; i < articlesCount; i++) {
      const articleId = randomId();
      const category = randomItem(CATEGORIES);
      const author = randomItem(AUTHORS);
      const title = generateTitle();
      const publishDate = dates[i];

      insertArticle.run(articleId, title, category, author, publishDate, null);

      const views = randomInt(500, 50000);
      const uniqueViews = Math.floor(views * randomInt(55, 85) / 100);
      const completedViews = Math.floor(uniqueViews * randomInt(30, 75) / 100);
      const likes = Math.floor(uniqueViews * randomInt(2, 15) / 100);
      const shares = Math.floor(likes * randomInt(15, 45) / 100);
      const comments = Math.floor(likes * randomInt(10, 35) / 100);
      const favorites = Math.floor(uniqueViews * randomInt(1, 8) / 100);
      const newFollowers = Math.floor(uniqueViews * randomInt(1, 5) / 100);
      const avgReadTime = randomInt(20, 240);

      insertMetrics.run(
        randomId(), articleId, views, uniqueViews, completedViews,
        likes, shares, comments, favorites, newFollowers, avgReadTime
      );

      const visitCount = Math.min(views, randomInt(50, 500));
      for (let v = 0; v < visitCount; v++) {
        const visitTime = new Date(publishDate);
        visitTime.setHours(visitTime.getHours() + randomInt(0, 720));
        const duration = randomInt(1, 300);
        const scrollDepth = randomInt(0, 100);
        const isValid = duration >= 3 && scrollDepth >= 5 ? 1 : (randomInt(0, 100) < 30 ? 0 : 1);

        insertVisit.run(
          randomId(), articleId, randomId(), visitTime.toISOString(),
          duration, scrollDepth, isValid,
          `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`
        );
      }
    }
  });

  tx();
  console.log('Database seeded with sample data');
}
