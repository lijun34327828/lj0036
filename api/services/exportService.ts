import { getArticlesForExport } from './aggregationService.js';
import type { FilterParams } from '../../shared/types.js';

export function generateArticlesCSV(filter: FilterParams = {}): string {
  const articles = getArticlesForExport(filter);

  const headers = [
    '文章ID',
    '标题',
    '分类',
    '作者',
    '发布日期',
    '阅读量',
    '独立访客',
    '完成阅读',
    '点赞数',
    '转发数',
    '评论数',
    '收藏数',
    '新增粉丝',
    '平均阅读时长(秒)',
    '阅读完成率(%)',
    '互动率(%)',
    '互动得分',
  ];

  const escapeCSV = (value: string | number): string => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', { hour12: false });
  };

  const rows = articles.map(a => [
    a.id,
    a.title,
    a.category,
    a.author,
    formatDate(a.publishDate),
    a.metrics.views,
    a.metrics.uniqueViews,
    a.metrics.completedViews,
    a.metrics.likes,
    a.metrics.shares,
    a.metrics.comments,
    a.metrics.favorites,
    a.metrics.newFollowers,
    a.metrics.avgReadTime,
    a.completionRate,
    a.engagementRate,
    a.engagementScore,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(r => r.map(escapeCSV).join(',')),
  ].join('\r\n');

  return '\uFEFF' + csvContent;
}
