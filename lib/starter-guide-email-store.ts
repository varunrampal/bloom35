import "server-only";

import { getDatabase } from "@/lib/database";

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

export const saveStarterGuideEmail = (email: string) => {
  const normalizedEmail = normalizeEmailAddress(email);

  if (!normalizedEmail) {
    throw new Error("Email address is required.");
  }

  const database = getDatabase();

  database
    .prepare(`
      INSERT INTO starter_guide_downloads (
        email,
        download_count,
        last_downloaded_at
      )
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        download_count = starter_guide_downloads.download_count + 1,
        last_downloaded_at = CURRENT_TIMESTAMP;
    `)
    .run(normalizedEmail);
};

export const getStarterGuideEmailOverview = () => {
  const database = getDatabase();
  const uniqueRow = database
    .prepare(`
      SELECT COUNT(*) as count
      FROM starter_guide_downloads;
    `)
    .get() as { count: number };
  const totalDownloadsRow = database
    .prepare(`
      SELECT COALESCE(SUM(download_count), 0) as count
      FROM starter_guide_downloads;
    `)
    .get() as { count: number };
  const recentRow = database
    .prepare(`
      SELECT COUNT(*) as count
      FROM starter_guide_downloads
      WHERE datetime(last_downloaded_at) >= datetime('now', '-7 days');
    `)
    .get() as { count: number };

  return {
    downloadsLast7Days: recentRow.count,
    totalDownloads: totalDownloadsRow.count,
    uniqueEmails: uniqueRow.count,
  };
};

export const getStarterGuideEmailPage = ({
  page,
  pageSize,
  query,
}: StarterGuideEmailListingOptions): StarterGuideEmailListingResult => {
  const database = getDatabase();
  const trimmedQuery = normalizeEmailAddress(query);
  const searchValue = `%${trimmedQuery}%`;
  const filters = trimmedQuery
    ? `
      WHERE email LIKE ?
    `
    : "";
  const countStatement = database.prepare(`
    SELECT COUNT(*) as count
    FROM starter_guide_downloads
    ${filters};
  `);
  const countRow = trimmedQuery
    ? (countStatement.get(searchValue) as { count: number })
    : (countStatement.get() as { count: number });
  const totalItems = countRow.count;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const listingStatement = database.prepare(`
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
  `);
  const rows = trimmedQuery
    ? (listingStatement.all(searchValue, pageSize, offset) as StoredStarterGuideEmailRow[])
    : (listingStatement.all(pageSize, offset) as StoredStarterGuideEmailRow[]);

  return {
    leads: rows.map(mapStoredLead),
    page: currentPage,
    pageSize,
    query: trimmedQuery,
    totalItems,
    totalPages,
  };
};
