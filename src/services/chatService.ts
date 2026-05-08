export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const queryChatbot = async (messages: ChatMessage[], dashboardContext: string, userToken?: string) => {
    let aiToken = userToken || import.meta.env.VITE_AI_TOKEN;
    if (!aiToken || aiToken === 'your_huggingface_KEY') {
        const storedToken = localStorage.getItem('hf_token');
        if (storedToken) {
            aiToken = storedToken;
        }
    }
    
    const fullMessages = [
        {
            role: 'system',
            content: `You are answering questions based ONLY on the following dashboard data: 
            
${dashboardContext}

If the user asks something not related to this data, politely decline and say you can only answer questions about the ISS and Dashboard News. Do not use outside knowledge. Keep answers very brief and concise.`
        },
        ...messages
    ];

    if (!aiToken || aiToken === 'your_huggingface_KEY') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    choices: [{
                        message: {
                            content: "I need a Hugging Face API token to answer. Please provide it in the Chat Settings."
                        }
                    }]
                });
            }, 1000);
        });
    }

    try {
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${aiToken}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    messages: fullMessages,
                    model: "Qwen/Qwen3-0.6B:featherless-ai"
                }),
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Chat error:", error);
        throw error;
    }
}
