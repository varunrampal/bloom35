import "server-only";

import { executeStatement, queryRow, queryRows } from "@/lib/database";

type StoredStarterGuideEmailRow = {
  created_at: string;
  download_count: number;
  email: string;
  id: number;
  last_downloaded_at: string;
};

export type StarterGuideEmailLead = {
  createdAt: string;
  downloadCount: number;
  email: string;
  id: number;
  lastDownloadedAt: string;
};

type StarterGuideEmailListingOptions = {
  page: number;
  pageSize: number;
  query: string;
};

type StarterGuideEmailListingResult = {
  leads: StarterGuideEmailLead[];
  page: number;
  pageSize: number;
  query: string;
  totalItems: number;
  totalPages: number;
};

const normalizeEmailAddress = (email: string) => email.trim().toLowerCase();

const mapStoredLead = (
  row: StoredStarterGuideEmailRow,
): StarterGuideEmailLead => ({
  createdAt: row.created_at,
  downloadCount: row.download_count,
  email: row.email,
  id: row.id,
  lastDownloadedAt: row.last_downloaded_at,
});

export const saveStarterGuideEmail = async (email: string) => {
  const normalizedEmail = normalizeEmailAddress(email);

  if (!normalizedEmail) {
    throw new Error("Email address is required.");
  }

  await executeStatement(
    `
      INSERT INTO starter_guide_downloads (
        email,
        download_count,
        last_downloaded_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        download_count = starter_guide_downloads.download_count + 1,
        last_downloaded_at = CURRENT_TIMESTAMP;
    `,
    [normalizedEmail],
  );
};

export const getStarterGuideEmailOverview = async () => {
  const uniqueRow = await queryRow<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM starter_guide_downloads;
    `);
  const totalDownloadsRow = await queryRow<{ count: number }>(`
      SELECT COALESCE(SUM(download_count), 0) as count
      FROM starter_guide_downloads;
    `);
  const recentRow = await queryRow<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM starter_guide_downloads
      WHERE datetime(last_downloaded_at) >= datetime('now', '-7 days');
    `);

  return {
    downloadsLast7Days: recentRow?.count ?? 0,
    totalDownloads: totalDownloadsRow?.count ?? 0,
    uniqueEmails: uniqueRow?.count ?? 0,
  };
};

export const getStarterGuideEmailPage = async ({
  page,
  pageSize,
  query,
}: StarterGuideEmailListingOptions): Promise<StarterGuideEmailListingResult> => {
  const trimmedQuery = normalizeEmailAddress(query);
  const searchValue = `%${trimmedQuery}%`;
  const filters = trimmedQuery
    ? `
      WHERE email LIKE ?
    `
    : "";
  const countRow = await queryRow<{ count: number }>(`
    SELECT COUNT(*) as count
    FROM starter_guide_downloads
    ${filters};
  `, trimmedQuery ? [searchValue] : undefined);
  const totalItems = countRow?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const rows = await queryRows<StoredStarterGuideEmailRow>(`
    SELECT
      id,
      email,
      download_count,
      created_at,
      last_downloaded_at
    FROM starter_guide_downloads
    ${filters}
    ORDER BY datetime(last_downloaded_at) DESC, id DESC
    LIMIT ? OFFSET ?;
  `, trimmedQuery ? [searchValue, pageSize, offset] : [pageSize, offset]);

  return {
    leads: rows.map(mapStoredLead),
    page: currentPage,
    pageSize,
    query: trimmedQuery,
    totalItems,
    totalPages,
  };
};
