export function canManageArticleRecord(userId: string | null | undefined, updatedBy: string | null | undefined) {
  return Boolean(userId && updatedBy && userId === updatedBy);
}

export function canManageArticleRelation(
  userId: string | null | undefined,
  article: { updated_by: string | null | undefined } | null | undefined,
) {
  return canManageArticleRecord(userId, article?.updated_by);
}
