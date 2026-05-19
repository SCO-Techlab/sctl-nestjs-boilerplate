export const formatObjectId = (_id: string): string => {
  if (!_id) {
    return '';
  }

  return _id.toString().trim();
}