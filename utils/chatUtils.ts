import { ActionButton, ChatMode } from '../types';

export const coffeeModels = [
    { id: 'gemini-3-flash', name: 'Gemini 3.0 Flash', provider: 'Google', icon: 'auto_awesome', color: 'text-indigo-500' },
    { id: 'claude-3-7', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', icon: 'psychology', color: 'text-orange-500' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: 'bolt', color: 'text-green-500' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', icon: 'lightbulb', color: 'text-blue-500' },
    { id: 'llama-3-1', name: 'Llama 3.1', provider: 'Meta', icon: 'deployed_code', color: 'text-blue-400' },
    { id: 'grok-2', name: 'Grok 2', provider: 'xAI', icon: 'rocket_launch', color: 'text-gray-500' },
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', icon: 'wind_power', color: 'text-yellow-500' },
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSuggestions = (mode: ChatMode): ActionButton[] => {
    switch (mode) {
        case 'creative':
            return [
                { icon: 'brush', label: 'Design a logo', colorClass: 'text-pink-500 group-hover:text-pink-600', delay: '100ms', actionPayload: 'Design a minimalist logo for ' },
                { icon: 'image', label: 'Illustration', colorClass: 'text-purple-500 group-hover:text-purple-600', delay: '200ms', actionPayload: 'Create a digital illustration of ' },
                { icon: 'palette', label: 'Color palette', colorClass: 'text-orange-500 group-hover:text-orange-600', delay: '300ms', actionPayload: 'Generate a color palette for ' },
                { icon: 'wallpaper', label: 'Concept art', colorClass: 'text-blue-500 group-hover:text-blue-600', delay: '400ms', actionPayload: 'Generate concept art for ' },
            ];
        case 'code':
            return [
                { icon: 'bug_report', label: 'Debug code', colorClass: 'text-red-500 group-hover:text-red-600', delay: '100ms', actionPayload: 'Debug the following code: \n' },
                { icon: 'integration_instructions', label: 'React Component', colorClass: 'text-blue-500 group-hover:text-blue-600', delay: '200ms', actionPayload: 'Write a functional React component that ' },
                { icon: 'terminal', label: 'Explain script', colorClass: 'text-green-500 group-hover:text-green-600', delay: '300ms', actionPayload: 'Explain how this code works: \n' },
                { icon: 'build', label: 'Refactor', colorClass: 'text-purple-500 group-hover:text-purple-600', delay: '400ms', actionPayload: 'Refactor this code to be more efficient: \n' },
            ];
        case 'data':
            return [
                { icon: 'bar_chart', label: 'Visualize trends', colorClass: 'text-blue-500 group-hover:text-blue-600', delay: '100ms', actionPayload: 'Create a visualization for ' },
                { icon: 'table_view', label: 'Analyze dataset', colorClass: 'text-green-500 group-hover:text-green-600', delay: '200ms', actionPayload: 'Analyze this data and find key insights: ' },
                { icon: 'query_stats', label: 'Forecast', colorClass: 'text-purple-500 group-hover:text-purple-600', delay: '300ms', actionPayload: 'Forecast future numbers based on ' },
                { icon: 'code', label: 'Python Analysis', colorClass: 'text-orange-500 group-hover:text-orange-600', delay: '400ms', actionPayload: 'Write a Python script to analyze ' },
            ];
        case 'research':
        case 'web':
            return [
                { icon: 'newspaper', label: 'Latest News', colorClass: 'text-blue-500 group-hover:text-blue-600', delay: '100ms', actionPayload: 'Search for the latest news about ' },
                { icon: 'travel_explore', label: 'Deep Dive', colorClass: 'text-indigo-500 group-hover:text-indigo-600', delay: '200ms', actionPayload: 'Conduct a deep research on ' },
                { icon: 'analytics', label: 'Market Analysis', colorClass: 'text-purple-500 group-hover:text-purple-600', delay: '300ms', actionPayload: 'Analyze the market for ' },
                { icon: 'trending_up', label: 'Tech Trends', colorClass: 'text-green-500 group-hover:text-green-600', delay: '400ms', actionPayload: 'What are the emerging trends in ' },
            ];
        case 'doc':
            return [
                { icon: 'summarize', label: 'Summarize', colorClass: 'text-orange-500 group-hover:text-orange-600', delay: '100ms', actionPayload: 'Summarize this text: ' },
                { icon: 'list', label: 'Key Points', colorClass: 'text-blue-500 group-hover:text-blue-600', delay: '200ms', actionPayload: 'Extract key points from: ' },
                { icon: 'psychology', label: 'Analyze Tone', colorClass: 'text-purple-500 group-hover:text-purple-600', delay: '300ms', actionPayload: 'Analyze the tone and sentiment of: ' },
                { icon: 'translate', label: 'Translate', colorClass: 'text-green-500 group-hover:text-green-600', delay: '400ms', actionPayload: 'Translate this to Spanish: ' },
            ];
        default:
            return [
                { icon: 'travel_explore', label: 'Research', colorClass: 'text-purple-500 group-hover:text-purple-600', delay: '50ms', targetMode: 'research' },
                { icon: 'palette', label: 'Creative', colorClass: 'text-pink-500 group-hover:text-pink-600', delay: '100ms', targetMode: 'creative' },
                { icon: 'terminal', label: 'Write code', colorClass: 'text-orange-500 group-hover:text-orange-600', delay: '200ms', targetMode: 'code' },
                { icon: 'table_chart', label: 'Analyze data', colorClass: 'text-green-500 group-hover:text-green-600', delay: '300ms', targetMode: 'data' },
            ];
    }
};