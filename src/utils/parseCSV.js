/**
 * Parse CSV data from weekly_summary.csv
 * @param {string} csvText - Raw CSV text content
 * @returns {Array} Parsed data array with typed values
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const row = {
      weekStart: values[0],
      topSong: values[1],
      topSongArtist: values[2],
      topSongMinutes: parseFloat(values[3]) || 0,
      totalMinutesPlayed: parseFloat(values[4]) || 0,
      avgTempo: parseFloat(values[5]) || 0,
      avgDanceability: parseFloat(values[6]) || 0,
      lowestTempoSong: values[7],
      lowestTempo: parseFloat(values[8]) || 0,
      lowestDanceabilitySong: values[9],
      lowestDanceability: parseFloat(values[10]) || 0,
      highestTempoSong: values[11],
      highestTempo: parseFloat(values[12]) || 0,
      highestDanceabilitySong: values[13],
      highestDanceability: parseFloat(values[14]) || 0,
      tracksWithFeatures: parseInt(values[15]) || 0,
      totalTracks: parseInt(values[16]) || 0
    };
    
    data.push(row);
  }
  
  return data;
}

/**
 * Parse a single CSV line handling quoted values with commas
 * @param {string} line - Single CSV line
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Load and parse CSV from URL
 * @param {string} url - URL to fetch CSV from
 * @returns {Promise<Array>} Parsed data
 */
export async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseCSV(text);
}
