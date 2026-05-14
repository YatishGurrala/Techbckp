export type BuildstackConfig = {
  baseUrl: string;
  projectSlug: string;
  projectId: string;
  adminApiKey: string;
  webhookSecret: string;
};

export type CmsErrorCode = "config" | "timeout" | "network" | "http" | "parse";

export type CmsError = {
  code: CmsErrorCode;
  message: string;
  status?: number;
  cause?: unknown;
  details?: unknown;
};

export type CmsResult<T> =
  | {
      ok: true;
      data: T;
      status?: number;
    }
  | {
      ok: false;
      error: CmsError;
    };

export type CmsEnvelope<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

export type BuildstackPage = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  updatedAt?: string;
  publishedAt?: string;
};

export type BuildstackBlog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
  updatedAt?: string;
};

export type BuildstackContentBlock = {
  id: string;
  key: string;
  title?: string;
  body?: string;
  contentHtml?: string;
  data?: unknown;
  updatedAt?: string;
};

export type BuildstackMediaItem = {
  id: string;
  url: string;
  alt?: string;
  key?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  updatedAt?: string;
};

export type BuildstackWebhookEventType = "page.published" | "blog.published" | "media.updated";

export type BuildstackWebhookEvent = {
  type: string;
  projectId?: string;
  slug?: string;
  entityId?: string;
  payload?: unknown;
};

export type BuildstackAdminEntity = "pages" | "blogs" | "content-blocks" | "media";

export type BuildstackAdminMutationMethod = "POST" | "PATCH" | "DELETE";

export type BuildstackAdminSuccess<T> = {
  success: true;
  status: number;
  data: T;
};

export type BuildstackAdminFailure = {
  success: false;
  status?: number;
  error: CmsError;
};

export type BuildstackAdminResult<T> = BuildstackAdminSuccess<T> | BuildstackAdminFailure;
