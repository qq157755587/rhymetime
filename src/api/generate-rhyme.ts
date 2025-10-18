import { GenerateRhymeRequest, GenerateRhymeResponse, RhymeData } from '../types';

// LLM Service Factory
class LLMService {
  private static async callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative children\'s nursery rhyme writer. Create engaging, educational, and fun English nursery rhymes that help children learn vocabulary and pronunciation. Keep the language simple, use repetitive patterns, and include rhyming words that are easy for children to remember.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    return data.choices[0]?.message?.content || '';
  }

  private static async callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a creative children's nursery rhyme writer. Create engaging, educational, and fun English nursery rhymes that help children learn vocabulary and pronunciation. Keep the language simple, use repetitive patterns, and include rhyming words that are easy for children to remember.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private static async callClaude(prompt: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        temperature: 0.8,
        system: 'You are a creative children\'s nursery rhyme writer. Create engaging, educational, and fun English nursery rhymes that help children learn vocabulary and pronunciation. Keep the language simple, use repetitive patterns, and include rhyming words that are easy for children to remember.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Claude API error');
    }

    return data.content?.[0]?.text || '';
  }

  public static async generateRhyme(
    elements: string[],
    provider: 'openai' | 'gemini' | 'claude' = 'gemini'
  ): Promise<string> {
    const prompt = `Create a fun and educational English nursery rhyme that includes these elements: ${elements.join(', ')}.

Requirements:
- Write in simple English suitable for children aged 3-8
- Include all the mentioned elements naturally in the story
- Use rhyming patterns (AABB or ABAB)
- Keep it 4-8 lines long
- Make it educational and fun
- Use repetitive sounds and words that help with pronunciation
- Include action words or descriptive words that children can learn

Example format:
Little [element1] loves to [action]
[Element2] dancing in the [place]
[Element3] singing a sweet song
All day long, all day long!

Please create an original nursery rhyme now:`;

    const providers = [provider, 'gemini', 'openai', 'claude'].filter((p, i, arr) => arr.indexOf(p) === i);

    for (const currentProvider of providers) {
      try {
        console.log(`Trying ${currentProvider} for rhyme generation...`);
        
        switch (currentProvider) {
          case 'openai':
            return await this.callOpenAI(prompt);
          case 'gemini':
            return await this.callGemini(prompt);
          case 'claude':
            return await this.callClaude(prompt);
          default:
            throw new Error(`Unknown provider: ${currentProvider}`);
        }
      } catch (error) {
        console.error(`${currentProvider} failed:`, error);
        
        if (currentProvider === providers[providers.length - 1]) {
          throw error;
        }
        
        continue;
      }
    }

    throw new Error('All LLM providers failed');
  }
}

// API Handler
export async function POST(request: Request): Promise<Response> {
  try {
    const body: GenerateRhymeRequest = await request.json();
    const { elements, llmProvider = 'gemini', language = 'en' } = body;

    if (!elements || elements.length === 0) {
      return Response.json({
        success: false,
        error: 'No elements provided'
      } as GenerateRhymeResponse, { status: 400 });
    }

    if (language !== 'en') {
      return Response.json({
        success: false,
        error: 'Only English language is supported'
      } as GenerateRhymeResponse, { status: 400 });
    }

    // Generate the rhyme content
    const content = await LLMService.generateRhyme(elements, llmProvider);
    
    if (!content.trim()) {
      throw new Error('Generated content is empty');
    }

    // Create rhyme data
    const rhymeData: RhymeData = {
      id: `rhyme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `A Rhyme About ${elements.slice(0, 2).join(' and ')}${elements.length > 2 ? ' and More' : ''}`,
      content: content.trim(),
      elements,
      createdAt: new Date().toISOString(),
      language: 'en',
      llmProvider,
    };

    return Response.json({
      success: true,
      data: rhymeData
    } as GenerateRhymeResponse);

  } catch (error) {
    console.error('Error generating rhyme:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate rhyme'
    } as GenerateRhymeResponse, { status: 500 });
  }
}

// For development/testing - can be called directly
export async function generateRhymeHandler(request: GenerateRhymeRequest): Promise<GenerateRhymeResponse> {
  try {
    const { elements, llmProvider = 'gemini', language = 'en' } = request;

    if (!elements || elements.length === 0) {
      return {
        success: false,
        error: 'No elements provided'
      };
    }

    if (language !== 'en') {
      return {
        success: false,
        error: 'Only English language is supported'
      };
    }

    const content = await LLMService.generateRhyme(elements, llmProvider);
    
    if (!content.trim()) {
      throw new Error('Generated content is empty');
    }

    const rhymeData: RhymeData = {
      id: `rhyme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `A Rhyme About ${elements.slice(0, 2).join(' and ')}${elements.length > 2 ? ' and More' : ''}`,
      content: content.trim(),
      elements,
      createdAt: new Date().toISOString(),
      language: 'en',
      llmProvider,
    };

    return {
      success: true,
      data: rhymeData
    };

  } catch (error) {
    console.error('Error generating rhyme:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate rhyme'
    };
  }
}