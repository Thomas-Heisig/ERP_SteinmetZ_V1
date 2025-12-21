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
import { z, type ZodIssue } from "zod";

import { BadRequestError, NotFoundError } from "../error/errors.js";
import db from "../database/dbService.js";
import { createLogger } from "../../utils/logger.js";
import type { SqlValue } from "../database/database.js";

const router: Router = express.Router();
const logger = createLogger("help");

type ArticleStatus = "draft" | "published" | "archived";

interface HelpArticleRecord {
  id: number;
  title: string;
  content: string;
  category: string;
  excerpt: string;
  keywords: string;
  icon: string;
  path: string;
  status: ArticleStatus;
  author: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

interface HelpSearchResult {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  icon: string;
  path: string;
  view_count: number;
  relevance: number;
}

interface HelpStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  topArticles: Array<
    Pick<HelpArticleRecord, "id" | "title" | "category" | "view_count">
  >;
}

const articleStatusSchema = z.enum(["draft", "published", "archived"]);

const listArticlesQuerySchema = z
  .object({
    category: z.string().min(1).optional(),
    status: articleStatusSchema.optional(),
    search: z.string().trim().min(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

const createArticleSchema = z
  .object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    category: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    keywords: z.string().max(500).optional(),
    icon: z.string().max(32).optional(),
    path: z.string().max(500).optional(),
    status: articleStatusSchema.default("draft"),
    author: z.string().max(120).optional(),
  })
  .strict();

const updateArticleSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    excerpt: z.string().max(500).optional(),
    keywords: z.string().max(500).optional(),
    icon: z.string().max(32).optional(),
    path: z.string().max(500).optional(),
    status: articleStatusSchema.optional(),
    author: z.string().max(120).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
    path: ["body"],
  });

const categorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    icon: z.string().max(16).optional().default(""),
    description: z.string().max(500).optional().default(""),
    order: z.coerce.number().int().nonnegative().default(999),
  })
  .strict();

const searchQuerySchema = z
  .object({
    q: z.string().trim().min(1),
    category: z.string().min(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();

function formatValidationErrors(issues: ZodIssue[]): Record<string, unknown> {
  return {
    issues: issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
      code: issue.code,
    })),
  };
}

function parseArticleId(idParam: string): number {
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    throw new BadRequestError("Article id must be a positive number");
  }
  return id;
}

function handleError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
): void {
  if (error instanceof BadRequestError || error instanceof NotFoundError) {
    const status = error.statusCode ?? 400;
    res.status(status).json({
      success: false,
      error: error.message,
      details: error.details,
    });
    return;
  }

  logger.error({ error }, fallbackMessage);
  res.status(500).json({ success: false, error: fallbackMessage });
}

/**
 * GET /api/help/articles
 * Get all help articles with optional filtering
 */
router.get("/articles", async (req: Request, res: Response) => {
  try {
    const validation = listArticlesQuerySchema.safeParse(req.query);
    if (!validation.success) {
      throw new BadRequestError(
        "Invalid query parameters",
        formatValidationErrors(validation.error.issues),
      );
    }

    const { category, status, search, limit, offset } = validation.data;

    let query = "SELECT * FROM help_articles WHERE 1=1";
    const params: SqlValue[] = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    const effectiveStatus: ArticleStatus = status ?? "published";
    query += " AND status = ?";
    params.push(effectiveStatus);

    if (search) {
      query +=
        " AND (title LIKE ? OR content LIKE ? OR keywords LIKE ? OR excerpt LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const articles = await db.all<HelpArticleRecord>(query, params);

    logger.info(
      { count: articles.length, category, status: effectiveStatus, search },
      "Retrieved help articles",
    );

    res.json({
      success: true,
      articles,
      count: articles.length,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve help articles");
  }
});

/**
 * GET /api/help/articles/:id
 * Get a specific help article by ID
 */
router.get("/articles/:id", async (req: Request, res: Response) => {
  try {
    const articleId = parseArticleId(req.params.id);

    const article = await db.get<HelpArticleRecord>(
      "SELECT * FROM help_articles WHERE id = ?",
      [articleId],
    );

    if (!article) {
      throw new NotFoundError("Article not found", { articleId });
    }

    await db.run(
      "UPDATE help_articles SET view_count = view_count + 1 WHERE id = ?",
      [articleId],
    );

    logger.info({ articleId }, "Retrieved help article");

    res.json({
      success: true,
      article: { ...article, view_count: article.view_count + 1 },
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve help article");
  }
});

/**
 * POST /api/help/articles
 * Create a new help article
 */
router.post("/articles", async (req: Request, res: Response) => {
  try {
    const validation = createArticleSchema.safeParse(req.body);
    if (!validation.success) {
      throw new BadRequestError(
        "Invalid article data",
        formatValidationErrors(validation.error.issues),
      );
    }

    const article = validation.data;
    const params: SqlValue[] = [
      article.title,
      article.content,
      article.category,
      article.excerpt ?? "",
      article.keywords ?? "",
      article.icon ?? "",
      article.path ?? "",
      article.status,
      article.author ?? "system",
    ];

    const result = await db.run(
      `INSERT INTO help_articles 
       (title, content, category, excerpt, keywords, icon, path, status, author, created_at, updated_at, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)`,
      params,
    );

    const articleId = Number(result.lastID ?? 0);
    logger.info({ articleId }, "Created new help article");

    res.status(201).json({
      success: true,
      id: articleId,
      message: "Help article created successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to create help article");
  }
});

/**
 * PUT /api/help/articles/:id
 * Update an existing help article
 */
router.put("/articles/:id", async (req: Request, res: Response) => {
  try {
    const articleId = parseArticleId(req.params.id);

    const validation = updateArticleSchema.safeParse(req.body);
    if (!validation.success) {
      throw new BadRequestError(
        "Invalid article update data",
        formatValidationErrors(validation.error.issues),
      );
    }

    const article = validation.data;

    const existing = await db.get<{ id: number }>(
      "SELECT id FROM help_articles WHERE id = ?",
      [articleId],
    );

    if (!existing) {
      throw new NotFoundError("Article not found", { articleId });
    }

    const sets: string[] = [];
    const params: SqlValue[] = [];

    if (article.title !== undefined) {
      sets.push("title = ?");
      params.push(article.title);
    }
    if (article.content !== undefined) {
      sets.push("content = ?");
      params.push(article.content);
    }
    if (article.category !== undefined) {
      sets.push("category = ?");
      params.push(article.category);
    }
    if (article.excerpt !== undefined) {
      sets.push("excerpt = ?");
      params.push(article.excerpt);
    }
    if (article.keywords !== undefined) {
      sets.push("keywords = ?");
      params.push(article.keywords);
    }
    if (article.icon !== undefined) {
      sets.push("icon = ?");
      params.push(article.icon);
    }
    if (article.path !== undefined) {
      sets.push("path = ?");
      params.push(article.path);
    }
    if (article.status !== undefined) {
      sets.push("status = ?");
      params.push(article.status);
    }
    if (article.author !== undefined) {
      sets.push("author = ?");
      params.push(article.author);
    }

    sets.push("updated_at = datetime('now')");

    const updateSql = `UPDATE help_articles SET ${sets.join(", ")} WHERE id = ?`;
    params.push(articleId);

    await db.run(updateSql, params);

    const updatedArticle = await db.get<HelpArticleRecord>(
      "SELECT * FROM help_articles WHERE id = ?",
      [articleId],
    );

    logger.info({ articleId }, "Updated help article");

    res.json({
      success: true,
      message: "Help article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    handleError(res, error, "Failed to update help article");
  }
});

/**
 * DELETE /api/help/articles/:id
 * Delete a help article
 */
router.delete("/articles/:id", async (req: Request, res: Response) => {
  try {
    const articleId = parseArticleId(req.params.id);

    const existing = await db.get<{ id: number }>(
      "SELECT id FROM help_articles WHERE id = ?",
      [articleId],
    );

    if (!existing) {
      throw new NotFoundError("Article not found", { articleId });
    }

    await db.run("DELETE FROM help_articles WHERE id = ?", [articleId]);

    logger.info({ articleId }, "Deleted help article");

    res.json({
      success: true,
      message: "Help article deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete help article");
  }
});

/**
 * GET /api/help/categories
 * Get all help categories
 */
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await db.all<HelpCategory>(
      "SELECT * FROM help_categories ORDER BY `order` ASC",
    );

    logger.info({ count: categories.length }, "Retrieved help categories");

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve help categories");
  }
});

/**
 * POST /api/help/categories
 * Create a new help category
 */
router.post("/categories", async (req: Request, res: Response) => {
  try {
    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
      throw new BadRequestError(
        "Invalid category data",
        formatValidationErrors(validation.error.issues),
      );
    }

    const category = validation.data;

    await db.run(
      `INSERT INTO help_categories (id, name, icon, description, \`order\`)
       VALUES (?, ?, ?, ?, ?)`,
      [
        category.id,
        category.name,
        category.icon ?? "",
        category.description ?? "",
        category.order,
      ],
    );

    logger.info({ categoryId: category.id }, "Created new help category");

    res.status(201).json({
      success: true,
      message: "Help category created successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to create help category");
  }
});

/**
 * GET /api/help/search
 * Advanced search across help articles
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const validation = searchQuerySchema.safeParse(req.query);
    if (!validation.success) {
      throw new BadRequestError(
        "Invalid search parameters",
        formatValidationErrors(validation.error.issues),
      );
    }

    const { q, category, limit } = validation.data;

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
    const params: SqlValue[] = [
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
    params.push(limit);

    const results = await db.all<HelpSearchResult>(query, params);

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
    handleError(res, error, "Failed to search help articles");
  }
});

/**
 * GET /api/help/stats
 * Get help system statistics
 */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const totalArticles = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM help_articles",
    );
    const publishedArticles = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM help_articles WHERE status = 'published'",
    );
    const draftArticles = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM help_articles WHERE status = 'draft'",
    );
    const totalViews = await db.get<{ total: number | null }>(
      "SELECT SUM(view_count) as total FROM help_articles",
    );
    const topArticles = await db.all<
      Pick<HelpArticleRecord, "id" | "title" | "category" | "view_count">
    >(
      "SELECT id, title, category, view_count FROM help_articles ORDER BY view_count DESC LIMIT 5",
    );

    const stats: HelpStats = {
      totalArticles: totalArticles?.count ?? 0,
      publishedArticles: publishedArticles?.count ?? 0,
      draftArticles: draftArticles?.count ?? 0,
      totalViews: totalViews?.total ?? 0,
      topArticles,
    };

    logger.info(
      stats as unknown as Record<string, unknown>,
      "Retrieved help statistics",
    );

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve help statistics");
  }
});

export default router;
