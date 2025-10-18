import { GenerateRhymeRequest, GenerateRhymeResponse, RhymeData } from '../types';

// Unified prompt configuration
const SYSTEM_PROMPT = `You are a creative poet specializing in nursery rhymes for 2-3 year old toddlers. 
Your task is to write a new, original nursery rhyme based on keywords provided by a child. 

**--- RULES ---** 
1.  **TARGET AUDIENCE:** 2-3 year olds. Vocabulary must be EXTREMELY simple (e.g., cat, sun, run, go, red, blue, see, look). 
2.  **LENGTH:** The rhyme must be VERY short, exactly 4 lines. 
3.  **STYLE:** The rhyme must be highly rhythmic, repetitive, and simple. Use AABB or ABCB rhyme schemes. Repetition of words or phrases is highly encouraged. 

**--- EXAMPLES ---** 

**[Keywords]:** Rain, Day 
**[Rhyme]:** 
Rain, rain, go away, 
Come again another day. 

**[Keywords]:** Star, Night 
**[Rhyme]:** 
Star light, star bright, 
The first star I see tonight. 

**[Keywords]:** Sheep, Wool 
**[Rhyme]:** 
Baa, baa, black sheep, 
Have you any wool? 
Yes sir, yes sir, 
Three bags full. 

**[Keywords]:** Jack, Jump 
**[Rhyme]:** 
Jack be nimble, 
Jack be quick, 
Jack jump over 
The candlestick. 

**[Keywords]:** One, Two 
**[Rhyme]:** 
One, two, 
Buckle my shoe. 
Three, four, 
Knock at the door.`;

// Unified prompt builder
function buildPrompt(elements: string[]): string {
  return `**[Keywords]:** ${elements.join(', ')}
**[Rhyme]:**`;
}

// LLM Service Factory
class LLMService {
  private static async callOpenAI(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
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
            content: SYSTEM_PROMPT
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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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
            text: `${SYSTEM_PROMPT}\n\n${prompt}`
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
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
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
        system: SYSTEM_PROMPT,
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
    const prompt = buildPrompt(elements);

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