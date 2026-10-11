import * as ImageManipulator from 'expo-image-manipulator';

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
// Free Gemini API (get a key at aistudio.google.com). Model can be changed via env.
const MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'gemini-3.6-flash';

const PROMPT = `You are an expert automotive identifier. Look at the image and identify the main car.
Respond with ONLY a JSON object, no markdown, in this exact shape:
{
  "carDetected": boolean,
  "make": string,
  "model": string,
  "generation": string,
  "color": string,
  "yearRange": string,
  "bodyType": string,
  "fuelType": string,
  "engine": string,
  "transmission": string,
  "drivetrain": string,
  "seats": number,
  "horsepower": number,
  "topSpeedKmh": number,
  "zeroTo100": number,
  "originCountry": string,
  "priceRangeINR": string,
  "features": [string],
  "funFact": string,
  "similarCars": [string],
  "confidence": number,
  "notes": string
}
Rules:
- confidence is 0-100 (your honest certainty in make+model).
- color is the simple dominant paint color (e.g. "Pearl White", "Midnight Blue").
- All spec fields describe the TYPICAL version of the identified model/generation. Use 0 for unknown numbers and "" for unknown strings.
- zeroTo100 is seconds for 0-100 km/h. priceRangeINR is a short approximate new/used range in Indian rupees, e.g. "Rs 9-14 lakh".
- features: up to 4 short visible or notable features (e.g. "LED DRLs"). similarCars: up to 3 rival models.
- funFact: one short interesting sentence. notes: one short sentence about what you saw (angle, condition).
- If there is no car, set carDetected=false, confidence=0, empty strings/arrays and 0 numbers.
- If unsure of the exact model, give your best guess and lower the confidence.`;

// Shrink + compress so uploads are fast and cheap. Returns { uri, base64 }.
export async function prepareImage(uri) {
  try {
    if (typeof ImageManipulator.manipulate === 'function') {
      const ctx = ImageManipulator.manipulate(uri).resize({ width: 768 });
      const rendered = await ctx.renderAsync();
      const out = await rendered.saveAsync({
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });
      if (out?.base64) return { uri: out.uri, base64: out.base64 };
    }
  } catch (e) {
    // fall through to the legacy API below
  }
  if (typeof ImageManipulator.manipulateAsync === 'function') {
    const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 768 } }], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    if (out?.base64) return { uri: out.uri, base64: out.base64 };
  }
  throw new Error('Could not process this image. Try a different photo.');
}

function parseJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The AI returned an unreadable answer. Try again.');
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error('The AI answer was cut off. Try again.');
  }
}

const str = (v) => (typeof v === 'string' ? v : '');
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const list = (v, n) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, n) : []);

// Models to try in order if one is unavailable or rate limited.
const MODELS = [MODEL, 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].filter(
  (m, i, arr) => arr.indexOf(m) === i
);

async function callGemini(model, base64, withThinkingConfig) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const generationConfig = {
    responseMimeType: 'application/json',
    // thinking tokens count toward this limit, so keep plenty of room
    maxOutputTokens: 4096,
    temperature: 0.2,
  };
  if (withThinkingConfig) generationConfig.thinkingConfig = { thinkingLevel: 'low' };

  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: 'image/jpeg', data: base64 } }, { text: PROMPT }] }],
      generationConfig,
    }),
  });
}

async function requestWithFallback(base64) {
  let lastStatus = 0;
  let lastBody = '';
  for (const model of MODELS) {
    for (const thinking of [true, false]) {
      let res;
      try {
        res = await callGemini(model, base64, thinking);
      } catch (e) {
        throw new Error('Network error. Check your internet connection and try again.');
      }
      if (res.ok) return res;
      lastStatus = res.status;
      lastBody = await res.text().catch(() => '');
      // a rejected key fails on every model, so stop right away
      if (res.status === 400 && /API key/i.test(lastBody)) return failWith(lastStatus, lastBody);
      // 400 may be an unsupported thinking setting: retry same model without it
      if (res.status === 400 && thinking) continue;
      break; // otherwise move on to the next model
    }
    // a bad key will fail on every model, so stop early
    if (lastStatus === 401 || lastStatus === 403) break;
  }
  return failWith(lastStatus, lastBody);
}

function failWith(lastStatus, lastBody) {
  let msg = lastBody;
  try {
    msg = JSON.parse(lastBody)?.error?.message || lastBody;
  } catch {}
  if (lastStatus === 429) throw new Error('Free limit reached. Wait a minute and try again.');
  if (lastStatus === 400 && /API key/i.test(msg)) throw new Error('Your AI key is not valid. Check the key you saved.');
  if (lastStatus === 401 || lastStatus === 403) throw new Error(`AI key was rejected (${lastStatus}). ${msg.slice(0, 120)}`);
  throw new Error(`Recognition failed (${lastStatus}). ${msg.slice(0, 160)}`);
}

export async function recognizeCar(imageUri) {
  if (!API_KEY || API_KEY === 'your-key-here') {
    throw new Error('Missing API key. The app was built without EXPO_PUBLIC_AI_API_KEY.');
  }

  const { uri, base64 } = await prepareImage(imageUri);
  const res = await requestWithFallback(base64);

  const data = await res.json();
  const cand = data?.candidates?.[0];
  const parts = (cand?.content?.parts || []).filter((x) => !x.thought);
  const text = parts.map((c) => c.text || '').join('');
  if (!text) {
    if (data?.promptFeedback?.blockReason) throw new Error('The AI blocked this image. Try another photo.');
    throw new Error('The AI returned no answer. Try again.');
  }
  const p = parseJson(text);

  return {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    imageUri: uri,
    favorite: false,
    carDetected: !!p.carDetected,
    make: str(p.make),
    model: str(p.model),
    generation: str(p.generation),
    color: str(p.color),
    yearRange: str(p.yearRange),
    bodyType: str(p.bodyType),
    fuelType: str(p.fuelType),
    engine: str(p.engine),
    transmission: str(p.transmission),
    drivetrain: str(p.drivetrain),
    seats: num(p.seats),
    horsepower: num(p.horsepower),
    topSpeedKmh: num(p.topSpeedKmh),
    zeroTo100: num(p.zeroTo100),
    originCountry: str(p.originCountry),
    priceRangeINR: str(p.priceRangeINR),
    features: list(p.features, 4),
    funFact: str(p.funFact),
    similarCars: list(p.similarCars, 3),
    confidence: Math.max(0, Math.min(100, Math.round(num(p.confidence)))),
    notes: str(p.notes),
  };
}
