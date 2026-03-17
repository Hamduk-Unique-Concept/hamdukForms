import { streamText } from 'ai';

const model = 'groq/mixtral-8x7b-32768';

export async function POST(request: Request) {
  const { formTitle, formDescription, existingFields = [] } = await request.json();

  const existingFieldsText = existingFields
    .map((f: any) => `- ${f.label} (${f.type})`)
    .join('\n');

  const prompt = `
You are a form UX expert. Suggest additional fields for this form:

Form Title: "${formTitle}"
Form Description: "${formDescription}"

Existing Fields:
${existingFieldsText || '(None yet)'}

Analyze the form purpose and suggest 2-4 additional fields that would improve data collection.

For each suggestion, provide:
1. Field type (text, email, phone, number, textarea, select, checkbox, radio, date, time, file)
2. Label
3. Why it's needed
4. Suggested placeholder
5. Whether it should be required

Return ONLY valid JSON array:
[
  {
    "type": "string",
    "label": "string",
    "placeholder": "string",
    "required": boolean,
    "reasoning": "string"
  }
]
`;

  const result = streamText({
    model,
    prompt,
    system: `You are a form design expert. Suggest fields that would improve form completion and data quality. Return ONLY valid JSON.`,
  });

  return result.toTextStreamResponse();
}
