import * as ImageManipulator from 'expo-image-manipulator';

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
const ENDPOINT = process.env.EXPO_PUBLIC_AI_ENDPOINT || 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'claude-haiku-5-5';

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
  const ctx = ImageManipulator.manipulate(uri).resize({ width: 768 });
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({
    compress: 0.6,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return { uri: out.uri, base64: out.base64 };
}

function parseJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The AI returned an unreadable answer.');
  return JSON.parse(text.slice(start, end + 1));
}

const str = (v) => (typeof v === 'string' ? v : '');
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const list = (v, n) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, n) : []);

export async function recognizeCar(imageUri) {
  if (!API_KEY || API_KEY === 'your-key-here') {
    throw new Error('Missing API key. Add EXPO_PUBLIC_AI_API_KEY to your .env file and restart.');
  }

  const { uri, base64 } = await prepareImage(imageUri);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    throw new Error('Network error. Check your internet connection and try again.');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Recognition failed (${res.status}). ${body.slice(0, 120)}`);
  }

  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || '').join('');
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
