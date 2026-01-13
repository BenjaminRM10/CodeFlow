import { AIProvider, ProjectType } from '@/types';

export interface AIGenerationRequest {
  provider: AIProvider;
  apiKey: string;
  model: string;
  language: string;
  prompt: string;
  type: ProjectType;
  searchContext?: string;
}

export interface AIGenerationResponse {
  mode: ProjectType;
  language: string;
  code: string[];
  comments: string[];
}

export interface CourseOutline {
  title: string;
  description: string;
  lessons: Array<{
    title: string;
    description: string;
  }>;
}

const DEFAULT_MODELS = {
  openai: 'gpt-4o',
  grok: 'grok-beta',
  gemini: 'gemini-2.5-flash',
};

const SYSTEM_PROMPT = `You are an expert programming instructor creating code for typing practice. 

CRITICAL RULES:
1. Generate EXECUTABLE, PROFESSIONAL code only - no toy examples or placeholders
2. Each line must be real, working code that would run/compile
3. For terminal mode: valid bash/powershell commands only
4. For editor mode: complete, coherent files with proper structure
5. NO explanatory text, headers, or prose in the code array
6. Code must follow latest syntax and best practices
7. Each code lesson must have 30+ lines minimum

Response format (JSON):
{
  "mode": "terminal" or "editor",
  "language": "bash|python|javascript|sql|dockerfile|etc",
  "code": ["line1", "line2", ...],
  "comments": ["comment1 (300-350 chars)", "comment2", ...]
}

Comments requirements:
- One comment per code line (1:1 mapping)
- Each comment: 300-350 characters
- Explain syntax, functions, purpose, and WHY
- Educational and detailed

NO \\n escapes in code lines - each array element is ONE physical line.`;


export function getDefaultApiKey(provider: string): string {
  switch (provider) {
    case 'gemini':
      return import.meta.env.VITE_GEMINI_API_KEY || '';
    default:
      return '';
  }
}

export async function generateCode(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  const { provider, apiKey, model, language, prompt, type, searchContext } = request;

  let trimmedKey = apiKey?.trim();

  if (!trimmedKey) {
    const defaultKey = getDefaultApiKey(provider);
    if (defaultKey) {
      trimmedKey = defaultKey;
    }
  }

  if (!trimmedKey) {
    // Demo mode with simulated content
    return generateDemoContent(language, type);
  }

  if (trimmedKey.includes(' ') || trimmedKey.startsWith('npx') || trimmedKey.startsWith('npm')) {
    throw new Error('Invalid API Key format. Keys should not contain spaces or start with commands like "npx"');
  }

  // Use provider-specific default model if the requested model seems invalid (e.g. OpenAI model for Gemini)
  let effectiveModel = model;
  if (provider === 'gemini' && model.startsWith('gpt')) {
    effectiveModel = DEFAULT_MODELS.gemini;
  } else if (provider === 'grok' && model.startsWith('gpt')) {
    effectiveModel = DEFAULT_MODELS.grok;
  } else if (provider === 'openai' && !model) {
    effectiveModel = DEFAULT_MODELS.openai;
  }

  const userMessage = buildUserMessage(language, prompt, type, searchContext);

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(trimmedKey, effectiveModel, userMessage);
      case 'grok':
        return await callGrok(trimmedKey, effectiveModel, userMessage);
      case 'gemini':
        return await callGemini(trimmedKey, effectiveModel, userMessage);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

export async function generateCourseOutline(
  request: Omit<AIGenerationRequest, 'type'>
): Promise<CourseOutline> {
  const { provider, apiKey, model, language, prompt, searchContext } = request;

  const trimmedKey = apiKey?.trim();
  if (!trimmedKey) {
    throw new Error('API key required for course generation');
  }

  if (trimmedKey.includes(' ') || trimmedKey.startsWith('npx') || trimmedKey.startsWith('npm')) {
    throw new Error('Invalid API Key format. Keys should not contain spaces or start with commands like "npx"');
  }

  // Use provider-specific default model
  let effectiveModel = model;
  if (provider === 'gemini' && model.startsWith('gpt')) {
    effectiveModel = DEFAULT_MODELS.gemini;
  } else if (provider === 'grok' && model.startsWith('gpt')) {
    effectiveModel = DEFAULT_MODELS.grok;
  } else if (provider === 'openai' && !model) {
    effectiveModel = DEFAULT_MODELS.openai;
  }

  const outlinePrompt = `Create a comprehensive course curriculum for ${language}.
User request: ${prompt}

${searchContext ? `Latest information:\n${searchContext}\n\n` : ''}

Generate 10-20 lessons that progress from basics to advanced topics.
Each lesson should be a distinct, practical topic worthy of 30+ lines of code.

Response format (JSON):
{
  "title": "Course Title",
  "description": "Brief course description",
  "lessons": [
    {
      "title": "Lesson title",
      "description": "What this lesson covers (2-3 sentences)"
    }
  ]
}`;

  const messages = [
    { role: 'system', content: 'You are a curriculum designer creating comprehensive programming courses.' },
    { role: 'user', content: outlinePrompt }
  ];

  try {
    let response: any;

    switch (provider) {
      case 'openai':
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${trimmedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: effectiveModel,
            messages,
            response_format: { type: 'json_object' }
          }),
        });
        break;

      case 'grok':
        response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${trimmedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: effectiveModel, messages }),
        });
        break;

      case 'gemini':
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${trimmedKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}\n\nResponse format (JSON):`
              }]
            }],
            generationConfig: {
              response_mime_type: "application/json"
            }
          }),
        });
        break;
        throw new Error(`Unknown provider: ${provider}`);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse response based on provider structure
    let content;
    if (provider === 'gemini') {
      content = data.candidates[0].content.parts[0].text;
    } else {
      content = data.choices[0].message.content;
    }

    return JSON.parse(cleanJson(content));

  } catch (error) {
    console.error('Course outline generation error:', error);
    throw error;
  }
}

async function callOpenAI(apiKey: string, model: string, userMessage: string): Promise<AIGenerationResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function callGrok(apiKey: string, model: string, userMessage: string): Promise<AIGenerationResponse> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function callGemini(apiKey: string, model: string, userMessage: string): Promise<AIGenerationResponse> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nUser request: ${userMessage}`
        }]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  return JSON.parse(cleanJson(content));
}

function buildUserMessage(
  language: string,
  prompt: string,
  type: ProjectType,
  searchContext?: string
): string {
  const today = new Date().toISOString().split('T')[0];

  return `Today's date: ${today}

${searchContext ? `Latest ${language} information:\n${searchContext}\n\n` : ''}

Language/Tool: ${language}
Mode: ${type === 'terminal' ? 'Terminal commands' : 'Code editor'}
User request: ${prompt}

Generate professional, executable code following latest best practices.
Minimum 30 lines of real, working code.
Include detailed comments (300-350 chars each) explaining every line.`;
}

function generateDemoContent(language: string, type: ProjectType): AIGenerationResponse {
  // Demo content for when no API key is configured
  const demoCode = [
    `# Demo ${language} code`,
    'print("This is demo content")',
    'x = 42',
    'y = x * 2',
    'print(f"Result: {y}")',
  ];

  const demoComments = [
    'This is a demo comment explaining the first line. In a real scenario, this would be a detailed explanation of the syntax, purpose, and context of this specific line of code. Each comment should be between 300-350 characters to provide comprehensive educational value.',
    'This is a demo comment for the second line. It would explain what this line does, why it is important, and how it fits into the larger program structure. The goal is to help learners understand not just what but why.',
    'Demo comment for variable assignment. Would explain the syntax, data type, value, and purpose of this variable in the context of the program. Educational comments should be thorough and clear.',
    'Demo comment explaining the calculation. Would describe the operation, the purpose of this calculation, and how the result will be used in subsequent code.',
    'Demo comment for the output statement. Would explain the print function, string formatting syntax, and what the user will see when this code runs.',
  ];

  return {
    mode: type,
    language,
    code: demoCode,
    comments: demoComments,
  };
}

function cleanJson(text: string): string {
  // Remove markdown code blocks if present
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean;
}
