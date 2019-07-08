export const TAG_COLORS = [
  '#E7AB5B',
  '#FF9800',
  '#B06298',
  '#18739F',
  '#70B1AA',
  '#758584',
  '#6E51A7',
  '#FA8084',
  '#80A3E4',
  '#9EC678',
  '#2196F3',
  '#B5355A',
  '#4CAF50',
  '#FFBA8C'
];

export function getTagColor(name) {
  const num = (name || '')
    .split('')
    .reduce((a, b) => a + (b.charCodeAt(0) || 0), 0);

  return TAG_COLORS[num % TAG_COLORS.length];
}
