/**
 * Follows `meta.totalPages` so dropdowns are not capped at the first page.
 * List screens keep their own pagination.
 */
export const collectPages = async (fetchPage) => {
  const first = await fetchPage(1);
  const totalPages = first.meta?.totalPages ?? 1;
  const rows = [...(first.data ?? [])];

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPage(page);
    rows.push(...(next.data ?? []));
  }

  return rows;
};
