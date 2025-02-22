export function formatDateForDB(dateStr: string): string {
  try {
    // Check if date is already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Handle DD/MM/YY format
    const [day, month, year] = dateStr.split('/').map(num => num.padStart(2, '0'));
    if (!day || !month || !year) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    
    const fullYear = `20${year}`; // Assuming years are in the 2000s
    return `${fullYear}-${month}-${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    throw error;
  }
}

export function formatDateForDisplay(dateStr: string): string {
  // Convert YYYY-MM-DD to DD/MM/YY
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
} 