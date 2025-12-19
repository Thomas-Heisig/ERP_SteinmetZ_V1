// SPDX-License-Identifier: MIT

/**
 * Help Desk Router
 *
 * Provides API endpoints for managing help articles and documentation.
 * Supports CRUD operations, search, categories, and article management.
 *
 * @module helpRouter
 */

import express, { Request, Response, Router } from "express";
import { createLogger } from "../../utils/logger.js";
import db from "../../services/dbService.js";

const router: Router = express.Router();
const logger = createLogger("help");

// Types
interface HelpArticle {
  id?: number;
  title: string;
  content: string;
  category: string;
  excerpt?: string;
  keywords?: string;
  icon?: string;
  path?: string;
  status: "draft" | "published" | "archived";
  author?: string;
  created_at?: string;
  updated_at?: string;
  view_count?: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

/**
 * GET /api/help/articles
 * Get all help articles with optional filtering
 */
router.get("/articles", async (req: Request, res: Response) => {
  try {
    const { category, status, search, limit, offset } = req.query;

    let query = "SELECT * FROM help_articles WHERE 1=1";
    const params: any[] = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    } else {
      // Default to only published articles
      query += " AND status = ?";
      params.push("published");
    }

    if (search) {
      query +=
        " AND (title LIKE ? OR content LIKE ? OR keywords LIKE ? OR excerpt LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY created_at DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(Number(limit));
    }

    if (offset) {
      query += " OFFSET ?";
      params.push(Number(offset));
    }

    const articles = await db.all(query, params);

    logger.info(
      { count: articles.length, category, status, search },
      "Retrieved help articles",
    );

    res.json({
      success: true,
      articles,
      count: articles.length,
    });
  } catch (error) {
    logger.error({ error }, "Failed to retrieve help articles");
    res.status(500).json({
      success: false,
      error: "Failed to retrieve help articles",
    });
  }
});

/**
 * GET /api/help/articles/:id
 * Get a specific help article by ID
 */
router.get("/articles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await db.get(
      "SELECT * FROM help_articles WHERE id = ?",
      [id],
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        error: "Article not found",
      });
    }

    // Increment view count
    await db.run("UPDATE help_articles SET view_count = view_count + 1 WHERE id = ?", [
      id,
    ]);

    logger.info({ articleId: id }, "Retrieved help article");

    res.json({
      success: true,
      article,
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, "Failed to retrieve help article");
    res.status(500).json({
      success: false,
      error: "Failed to retrieve help article",
    });
  }
});

/**
 * POST /api/help/articles
 * Create a new help article
 */
router.post("/articles", async (req: Request, res: Response) => {
  try {
    const article: HelpArticle = req.body;

    // Validate required fields
    if (!article.title || !article.content || !article.category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, content, category",
      });
    }

    const result = await db.run(
      `INSERT INTO help_articles 
       (title, content, category, excerpt, keywords, icon, path, status, author, created_at, updated_at, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)`,
      [
        article.title,
        article.content,
        article.category,
        article.excerpt || "",
        article.keywords || "",
        article.icon || "",
        article.path || "",
        article.status || "draft",
        article.author || "system",
      ],
    );

    logger.info({ articleId: result.lastID }, "Created new help article");

    res.status(201).json({
      success: true,
      id: result.lastID,
      message: "Help article created successfully",
    });
  } catch (error) {
    logger.error({ error }, "Failed to create help article");
    res.status(500).json({
      success: false,
      error: "Failed to create help article",
    });
  }
});

/**
 * PUT /api/help/articles/:id
 * Update an existing help article
 */
router.put("/articles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article: HelpArticle = req.body;

    // Check if article exists
    const existing = await db.get(
      "SELECT id FROM help_articles WHERE id = ?",
      [id],
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Article not found",
      });
    }

    await db.run(
      `UPDATE help_articles 
       SET title = ?, content = ?, category = ?, excerpt = ?, keywords = ?, 
           icon = ?, path = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        article.title,
        article.content,
        article.category,
        article.excerpt || "",
        article.keywords || "",
        article.icon || "",
        article.path || "",
        article.status,
        id,
      ],
    );

    logger.info({ articleId: id }, "Updated help article");

    res.json({
      success: true,
      message: "Help article updated successfully",
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, "Failed to update help article");
    res.status(500).json({
      success: false,
      error: "Failed to update help article",
    });
  }
});

/**
 * DELETE /api/help/articles/:id
 * Delete a help article
 */
router.delete("/articles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existing = await db.get(
      "SELECT id FROM help_articles WHERE id = ?",
      [id],
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Article not found",
      });
    }

    await db.run("DELETE FROM help_articles WHERE id = ?", [id]);

    logger.info({ articleId: id }, "Deleted help article");

    res.json({
      success: true,
      message: "Help article deleted successfully",
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, "Failed to delete help article");
    res.status(500).json({
      success: false,
      error: "Failed to delete help article",
    });
  }
});

/**
 * GET /api/help/categories
 * Get all help categories
 */
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await db.all(
      "SELECT * FROM help_categories ORDER BY `order` ASC",
    );

    logger.info({ count: categories.length }, "Retrieved help categories");

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    logger.error({ error }, "Failed to retrieve help categories");
    res.status(500).json({
      success: false,
      error: "Failed to retrieve help categories",
    });
  }
});

/**
 * POST /api/help/categories
 * Create a new help category
 */
router.post("/categories", async (req: Request, res: Response) => {
  try {
    const category: HelpCategory = req.body;

    // Validate required fields
    if (!category.id || !category.name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: id, name",
      });
    }

    await db.run(
      `INSERT INTO help_categories (id, name, icon, description, \`order\`)
       VALUES (?, ?, ?, ?, ?)`,
      [
        category.id,
        category.name,
        category.icon || "",
        category.description || "",
        category.order || 999,
      ],
    );

    logger.info({ categoryId: category.id }, "Created new help category");

    res.status(201).json({
      success: true,
      message: "Help category created successfully",
    });
  } catch (error) {
    logger.error({ error }, "Failed to create help category");
    res.status(500).json({
      success: false,
      error: "Failed to create help category",
    });
  }
});

/**
 * GET /api/help/search
 * Advanced search across help articles
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q, category, limit = "20" } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query (q) is required",
      });
    }

    let query = `
      SELECT id, title, category, excerpt, icon, path, view_count,
             (CASE 
               WHEN title LIKE ? THEN 10
               WHEN excerpt LIKE ? THEN 5
               WHEN keywords LIKE ? THEN 3
               ELSE 1
             END) as relevance
      FROM help_articles 
      WHERE status = 'published'
        AND (title LIKE ? OR content LIKE ? OR keywords LIKE ? OR excerpt LIKE ?)
    `;

    const searchTerm = `%${q}%`;
    const params: any[] = [
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    ];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY relevance DESC, view_count DESC LIMIT ?";
    params.push(Number(limit));

    const results = await db.all(query, params);

    logger.info(
      { query: q, category, count: results.length },
      "Performed help search",
    );

    res.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    logger.error({ error }, "Failed to search help articles");
    res.status(500).json({
      success: false,
      error: "Failed to search help articles",
    });
  }
});

/**
 * GET /api/help/stats
 * Get help system statistics
 */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const totalArticles = await db.get(
      "SELECT COUNT(*) as count FROM help_articles",
    );
    const publishedArticles = await db.get(
      "SELECT COUNT(*) as count FROM help_articles WHERE status = 'published'",
    );
    const draftArticles = await db.get(
      "SELECT COUNT(*) as count FROM help_articles WHERE status = 'draft'",
    );
    const totalViews = await db.get(
      "SELECT SUM(view_count) as total FROM help_articles",
    );
    const topArticles = await db.all(
      "SELECT id, title, category, view_count FROM help_articles ORDER BY view_count DESC LIMIT 5",
    );

    logger.info("Retrieved help statistics");

    res.json({
      success: true,
      stats: {
        totalArticles: totalArticles.count,
        publishedArticles: publishedArticles.count,
        draftArticles: draftArticles.count,
        totalViews: totalViews.total || 0,
        topArticles,
      },
    });
  } catch (error) {
    logger.error({ error }, "Failed to retrieve help statistics");
    res.status(500).json({
      success: false,
      error: "Failed to retrieve help statistics",
    });
  }
});

export default router;
