import { Request, Response } from 'express';

import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getAnalyticsSummary(req: Request, res: Response): Promise<void> {
    const summary = await analyticsService.getAnalyticsSummary();
    res.json({
      success: true,
      data: summary,
    });
  }

  async getProductsAnalyticsList(req: Request, res: Response): Promise<void> {
    const search = req.query.search as string | undefined;
    const productsAnalytics = await analyticsService.getProductsAnalyticsList(search);
    res.json({
      success: true,
      data: productsAnalytics,
    });
  }

  async getProductAnalytics(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ success: false, error: 'Product ID parameter is required' });
      return;
    }
    const productAnalytics = await analyticsService.getProductAnalytics(id);
    if (!productAnalytics) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({
      success: true,
      data: productAnalytics,
    });
  }
}

export const analyticsController = new AnalyticsController();
