import { Router } from 'express';
import {
  statsController,
  articlesController,
  categoriesController,
  cleaningController,
  exportController,
} from '../controllers/index.js';

const router = Router();

router.get('/stats/overview', statsController.getOverview);
router.get('/stats/trends', statsController.getTrends);

router.get('/articles', articlesController.getList);
router.get('/articles/ranking', articlesController.getRanking);
router.get('/articles/:id', articlesController.getById);

router.get('/categories', categoriesController.getList);
router.get('/categories/stats', categoriesController.getStats);

router.post('/cleaning/run', cleaningController.clean);

router.get('/export/csv', exportController.exportCSV);

export default router;
