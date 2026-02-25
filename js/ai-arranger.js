// Conductr - AI Arranger (Prompt + API Call + JSON Parsing)

import { API_CONFIG } from './config.js';

/**
 * Build the system prompt with music theory rules for the AI
 */
function buildSystemPrompt() {
  return `You are a professional music arranger. Given a chord progression, style, key, and BPM, generate a 4-track arrangement in JSON format.

## Output Format
Return ONLY valid JSON (no markdown, no explanation) with this structure:
{
  "bass": [{"time": "0:0:0", "note": "C2", "duration": "4n"}, ...],
  "drums": [{"time": "0:0:0", "note": "kick", "duration": "8n"}, ...],
  "harmony": [{"time": "0:0:0", "notes": ["C4","E4","G4"], "duration": "2n"}, ...],
  "melody": [{"time": "0:0:0", "note": "E5", "duration": "8n"}, ...]
}

## Track Rules

### Bass (MonoSynth)
- Range: C1 to C3
- Play root notes and occasional 5ths
- Rhythmically steady, lock with drums
- Use note names like "C2", "G1", etc.

### Drums (Percussion)
- Use these drum names ONLY: "kick", "snare", "hihat", "openhat", "clap", "tom"
- Build patterns appropriate to the style
- Keep a steady groove

### Harmony (PolySynth - chords)
- Range: C3 to C5
- "notes" field is an ARRAY of note names (the chord voicing)
- Provide smooth voice leading between chords
- Use inversions for minimal movement

### Melody (PolySynth - lead)
- Range: C4 to C6
- Single notes (not chords)
- Create a memorable melodic line that fits the chord tones
- Use chord tones on strong beats, passing tones on weak beats

## Timing Format (Tone.js Transport notation)
- "0:0:0" = bar:beat:sixteenth (0-indexed)
- Each chord gets 1 bar (4 beats in 4/4)
- Total bars = number of chords in the progression
- Quarter note = "4n", eighth = "8n", half = "2n", whole = "1n", sixteenth = "16n"
- Dotted: "4n.", "8n."

## Guidelines
- Generate enough notes to fill all bars (1 bar per chord)
- Make it musically interesting and appropriate for the chosen style
- Ensure all tracks are rhythmically aligned
- The arrangement should loop smoothly`;
}

/**
 * Build the user prompt with specific chord progression and parameters
 */
function buildUserPrompt(chords, style, key, bpm) {
  return `Create an arrangement for:
- Chord progression: ${chords.join(' → ')}
- Style: ${style}
- Key: ${key} major
- BPM: ${bpm}
- Time signature: 4/4
- Total bars: ${chords.length}

Return ONLY the JSON object.`;
}

/**
 * Call the AI API and return parsed arrangement
 */
export async function generateArrangement(chords, style, key, bpm) {
  if (!API_CONFIG.endpoint || !API_CONFIG.apiKey) {
    throw new Error('Please configure API endpoint and key in settings');
  }
  if (chords.length === 0) {
    throw new Error('Please add at least one chord to the progression');
  }

  const endpoint = API_CONFIG.endpoint.replace(/\/$/, '');
  let url;
  if (endpoint.includes('/chat/completions')) {
    url = endpoint;
  } else if (endpoint.includes('/v1')) {
    // Already has /v1, just append /chat/completions
    url = `${endpoint}/chat/completions`;
  } else {
    url = `${endpoint}/v1/chat/completions`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(chords, style, key, bpm) },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from AI');
  }

  return parseArrangement(content);
}

/**
 * Parse AI response into arrangement object
 * Handles both raw JSON and markdown-wrapped JSON
 */
function parseArrangement(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  let arrangement;
  try {
    arrangement = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e.message}\n\nResponse: ${text.slice(0, 500)}`);
  }

  // Validate structure
  const requiredTracks = ['bass', 'drums', 'harmony', 'melody'];
  for (const track of requiredTracks) {
    if (!Array.isArray(arrangement[track])) {
      throw new Error(`Missing or invalid track: ${track}`);
    }
  }

  return arrangement;
}
