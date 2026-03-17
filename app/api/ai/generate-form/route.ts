import { streamText } from 'ai';
import { z } from 'zod';

const model = 'groq/mixtral-8x7b-32768';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  fields: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      placeholder: z.string().nullable(),
      required: z.boolean(),
      options: z.array(z.string()).nullable(),
    })
  ),
});

export async function POST(request: Request) {
  const { formDescription } = await request.json();

  const prompt = `
You are an expert form builder. Create a well-structured form based on this description:
"${formDescription}"

Generate a JSON form with the following structure:
- title: A clear, concise form title
- description: A helpful description for users
- fields: An array of form fields

Available field types: text, email, phone, number, textarea, select, checkbox, radio, date, time, file.

Create appropriate fields that would logically fit for this use case. Use proper field types, meaningful labels, and smart defaults.

Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "description": "string",
  "fields": [
    {
      "type": "string (one of: text, email, phone, number, textarea, select, checkbox, radio, date, time, file)",
      "label": "string",
      "placeholder": "string or null",
      "required": boolean,
      "options": ["array of strings for select/radio/checkbox or null"]
    }
  ]
}
`;

  const result = streamText({
    model,
    prompt,
    system: `You are a form creation assistant. When asked to generate a form, return ONLY valid JSON that can be parsed. No additional text, no markdown code blocks, just pure JSON.`,
  });

  return result.toTextStreamResponse();
}
