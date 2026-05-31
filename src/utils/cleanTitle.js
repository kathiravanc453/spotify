/**
 * Cleans a raw Cloudinary filename / song title for display.
 * Strips hash suffixes, bitrates, codec jargon, and extra separators.
 * Example:
 *   "En_Jeevan_Paduthu___Neethana_Antha_Kuyil___Ilayaraja___KJ_Yesudas_M4A_128K_xmauk8"
 *   → "En Jeevan Paduthu"
 */
export function cleanTitle(raw = '') {
  if (!raw) return '';

  let title = raw
    .replace(/[-_]/g, ' ')   // underscores / hyphens → spaces
    .replace(/\s+/g, ' ')    // collapse multiple spaces
    .trim();

  // Patterns to strip out
  const stripPatterns = [
    /high quality/gi,
    /clear audio/gi,
    /audio song/gi,
    /video song/gi,
    /bass boosted/gi,
    /yuvan hits/gi,
    /svp beats/gi,
    /voice of spb/gi,
    /dolby digital/gi,
    /blu[\s-]?ray/gi,
    /4k ultra hd/gi,
    /5\.1\s*surround/gi,
    /5\.1/gi,
    /surround/gi,
    /128k/gi,
    /320k/gi,
    /m4a/gi,
    /mp3/gi,
    /--\s*\d+/g,
    /\|\s*.+$/g,              // everything after a pipe
    /\b[a-z0-9]{6}\b$/i,     // 6-char random hash at end (e.g. xmauk8)
  ];

  stripPatterns.forEach(p => {
    title = title.replace(p, '');
  });

  // Collapse triple-spaces left after stripping
  title = title.replace(/\s{2,}/g, ' ').trim();

  // If title ends with common separators, trim them
  title = title.replace(/[\s|_\-–]+$/, '').trim();

  return title || raw; // fallback to raw if result is empty
}

/**
 * Returns the mood-based accent color CSS class for borders/text/glows.
 */
export function moodAccent(mood = '') {
  const m = (mood || '').toLowerCase();
  if (m.includes('love'))    return { text: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   glow: 'shadow-rose-500/20',   hex: '#fb7185' };
  if (m.includes('romance')) return { text: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30',   glow: 'shadow-pink-500/20',   hex: '#f472b6' };
  if (m.includes('melody'))  return { text: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  glow: 'shadow-amber-500/20',  hex: '#fbbf24' };
  if (m.includes('energy'))  return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/20', hex: '#fb923c' };
  if (m.includes('vibe'))    return { text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   glow: 'shadow-cyan-500/20',   hex: '#22d3ee' };
  // default
  return { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', glow: 'shadow-violet-500/20', hex: '#a78bfa' };
}
