// Normalize labels from older backends without changing space identifiers.
export function formatSpaceLabel(label: string): string {
 return label.replace(/^espacio\s+(?:n[°º]\s*)?(\d+)$/i, 'Espacio N° $1');
}
