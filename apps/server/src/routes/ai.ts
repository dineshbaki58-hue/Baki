import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { requireAuth, AuthRequest } from '../middleware/auth';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const router = Router();

const dietSchema = z.object({
  goal: z.string().default('fat loss'),
  calories: z.number().int().min(1200).max(4500).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
});

router.post('/diet', requireAuth, async (req: AuthRequest, res) => {
  const parsed = dietSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { goal, calories, dietaryPreferences } = parsed.data;
  const prompt = `Create a 7-day meal plan with macros for goal: ${goal}. ${
    calories ? `Target calories: ${calories}.` : ''
  } Dietary preferences: ${(dietaryPreferences || []).join(', ')}. Return JSON with days, meals, calories, proteinG, carbsG, fatsG.`;
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a nutritionist generating structured JSON meal plans.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    const text = completion.choices[0]?.message?.content || '{}';
    const json = JSON.parse(text);
    res.json({ plan: json });
  } catch (e) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});
