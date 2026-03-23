import { Request, Response } from 'express';
import { AIService } from './ai.service';

export const chatWithAI = async (req: Request, res: Response) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await AIService.generateChatResponse(prompt, context);
    res.status(200).json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const summarizeLesson = async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const summary = await AIService.summarizeContent(content);
    res.status(200).json({ summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
