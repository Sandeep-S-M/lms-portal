import { HfInference } from '@huggingface/inference';
import { config } from '../../config/env';

const hf = new HfInference(config.hfToken);

export class AIService {
  private static model = 'mistralai/Mistral-7B-Instruct-v0.3';

  static async generateChatResponse(prompt: string, context?: string) {
    if (!config.hfToken) {
      throw new Error('HF_TOKEN is not configured');
    }

    const systemPrompt = `You are an AI Tutor for an LMS Portal. 
    Use the following educational context to answer the student's question concisely and accurately.
    If the question is not related to the context or general education, politely decline to answer.
    
    Context: ${context || 'General educational assistant'}
    
    Question: ${prompt}`;

    try {
      const response = await hf.textGeneration({
        model: this.model,
        inputs: `<s>[INST] ${systemPrompt} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.2
        }
      });

      return response.generated_text;
    } catch (error: any) {
      console.error('Hugging Face API Error:', error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  static async summarizeContent(content: string) {
    if (!config.hfToken) {
      throw new Error('HF_TOKEN is not configured');
    }

    try {
      const response = await hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: content,
        parameters: {
          max_length: 150,
          min_length: 40,
          do_sample: false
        }
      });

      return response.summary_text;
    } catch (error: any) {
      console.error('Hugging Face Summarization Error:', error.message);
      throw new Error('Failed to summarize content');
    }
  }
}
