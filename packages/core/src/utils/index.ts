export function generateSpacing(base = 4): Record<string, string> {
  const spacing: Record<string, string> = {};

  // Generate 0-100 spacing values in 4px increments
  for (let index = 0; index <= 25; index++) {
    const value = index * base;
    spacing[index.toString()] = `${value}px`;
  }

  return spacing;
}

export function validateBemPrefix(prefix: string): boolean {
  if (!prefix) return true;
  return /^[a-z][\da-z-]*[\da-z]$/.test(prefix);
}
