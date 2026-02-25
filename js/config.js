// Conductr - Configuration & Constants

// API Configuration (user-configurable via Settings modal)
// Users should configure these with their own credentials from https://console.anthropic.com
export const API_CONFIG = {
  endpoint: 'https://api.anthropic.com/v1/chat/completions',
  apiKey: '',  // User must set via Settings modal
  model: 'claude-opus-4-6',  // Use latest Claude model
};

// Piano keyboard mapping: computer key → MIDI note name
// Maps two octaves starting from C4
export const KEY_MAP = {
  // White keys (lower row)
  'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4',
  'g': 'G4', 'h': 'A4', 'j': 'B4',
  'k': 'C5', 'l': 'D5', ';': 'E5',

  // Black keys (upper row)
  'w': 'C#4', 'e': 'D#4',
  't': 'F#4', 'y': 'G#4', 'u': 'A#4',
  'o': 'C#5', 'p': 'D#5',
};

// Reverse map: note → key (for UI display)
export const NOTE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

// All piano notes in order (for rendering)
export const PIANO_NOTES = [
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4',
  'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5',
];

// Musical styles for AI generation
export const STYLES = [
  { id: 'pop', name: 'Pop' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'classical', name: 'Classical' },
  { id: 'electronic', name: 'Electronic' },
  { id: 'lofi', name: 'Lo-Fi' },
  { id: 'rock', name: 'Rock' },
  { id: 'rnb', name: 'R&B' },
  { id: 'bossa', name: 'Bossa Nova' },
];

// Available keys
export const KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

// Default BPM
export const DEFAULT_BPM = 120;

// Track definitions
export const TRACKS = [
  { id: 'bass', name: 'Bass', icon: '🎸', color: '#f97316' },
  { id: 'drums', name: 'Drums', icon: '🥁', color: '#ef4444' },
  { id: 'harmony', name: 'Harmony', icon: '🎹', color: '#8b5cf6' },
  { id: 'melody', name: 'Melody', icon: '🎵', color: '#06b6d4' },
];
