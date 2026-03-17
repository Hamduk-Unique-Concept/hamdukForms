import { streamText } from 'ai';

const model = 'groq/mixtral-8x7b-32768';

export async function POST(request: Request) {
  const { response, formContext, analysisType = 'sentiment' } = await request.json();

  let prompt = '';

  if (analysisType === 'sentiment') {
    prompt = `
Analyze the sentiment and key themes in this form response:

Response:
"${response}"

Provide a JSON analysis with:
- sentiment: 'positive' | 'neutral' | 'negative'
- confidence: number (0-100)
- themes: string[]
- summary: string

Return ONLY valid JSON.
`;
  } else if (analysisType === 'validation') {
    prompt = `
Validate this form response against the expected format:

Expected format: ${JSON.stringify(formContext)}
Response: "${response}"

Check for:
- Data type correctness
- Required fields
- Format compliance
- Suspicious patterns

Return JSON with:
- valid: boolean
- issues: string[]
- suggestions: string[]
`;
  } else if (analysisType === 'flagging') {
    prompt = `
Review this form response for potential issues:

Response: "${response}"

Look for:
- Spam indicators
- Malicious content
- Incomplete information
- Suspicious patterns

Return JSON with:
- riskLevel: 'low' | 'medium' | 'high'
- flags: string[]
- recommendedAction: string
`;
  }

  const result = streamText({
    model,
    prompt,
    system: `You are a form response analyst. Analyze the provided response and return ONLY valid JSON. No additional text.`,
  });

  return result.toTextStreamResponse();
}
