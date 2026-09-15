import dotenv from 'dotenv';
import { Ollama, OllamaAgent } from '@llamaindex/ollama';
import { FunctionTool } from '@llamaindex/core/tools';
import { Settings } from 'llamaindex';

dotenv.config();

Settings.llm = new Ollama({
    model: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2',
});

async function main() {
    function sum({ a, b }: { a: number; b: number }): string {
        return String(a + b);
    }

    function getWeather({ city }: { city: string }): string {
        return `The weather in ${city} is sunny with a high of 25°C.`;
    }

    const sumFunctionTool = FunctionTool.from(sum, {
        name: 'sum',
        description: 'This function takes two numbers and returns their sum.',
        parameters: {
            type: 'object',
            properties: {
                a: { type: 'number', description: 'The first number to add.' },
                b: { type: 'number', description: 'The second number to add.' },
            },
            required: ['a', 'b'],
        },
    });

    const getWeatherFunctionTool = FunctionTool.from(getWeather, {
        name: 'getWeather',
        description: 'This function takes a city name and returns the current weather in that city.',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'The name of the city to get the weather for.' },
            },
            required: ['city'],
        },
    });

    const agent = new OllamaAgent({
        model: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2',
        tools: [sumFunctionTool, getWeatherFunctionTool],
        verbose: true,
    });

    const result = await agent.chat({
        message: 'What is the sum of 5 and 10? Also, what was the weather in New Delhi in last week?',
    });

    console.log('Agent Response:', result.message.content);
}

main().catch((err) => {
    console.error('Error:', err);
});