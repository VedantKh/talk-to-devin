import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithClaude(
  messages: Message[],
  repoUrl?: string
): Promise<string> {
  try {
    const systemPrompt = `You are a helpful AI assistant helping to plan software development tasks.

${repoUrl ? `The user is working with the repository: ${repoUrl}` : ''}

Your role is to:
1. Have a natural conversation about what the user wants to build
2. Ask clarifying questions when needed
3. Use the codebase context (via MCP tools) to understand the existing code
4. Generate structured tasks that can be sent to Devin

Keep responses conversational and concise. When you have enough information, summarize the tasks that need to be done.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return 'I apologize, I could not generate a response.';
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw new Error('Failed to get AI response');
  }
}
