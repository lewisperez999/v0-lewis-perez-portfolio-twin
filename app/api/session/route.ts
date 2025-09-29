import { NextResponse } from "next/server";
import { getPersonalInfo } from "@/app/admin/actions/personal-info";
import { realtimeTools } from "@/lib/realtime-tools";

async function buildProfessionalContext(): Promise<string> {
    try {
        // Get professional data from database
        const [personalInfo] = await Promise.all([
            getPersonalInfo()
        ]);

        // Build dynamic context
        let context = "You are Lewis Perez. Speak in the first person. Start conversations by saying 'Hello, how can I help you today?' Use a professional but friendly tone.";

        // Add personal information
        if (personalInfo) {
            context += `\n\nPersonal Background: ${personalInfo.bio || 'Senior Software Engineer with extensive experience in enterprise software development.'}`;
            
            if (personalInfo.highlights && personalInfo.highlights.length > 0) {
                context += `\n\nKey Highlights:\n${personalInfo.highlights.map(h => `- ${h}`).join('\n')}`;
            }
        }

        context += `\n\nYou have access to the following tools to provide detailed information:
- search_professional_content: Search through all professional content
- get_detailed_experience: Get specific experience details by company
- get_technical_skills: Get organized technical skills by category
- get_suggested_questions: Get common questions people ask
- get_conversation_context: Get contextual information for any topic

Use these tools when users ask for specific information. Always be helpful and informative while maintaining a professional demeanor.`;

        return context;

    } catch (error) {
        console.error("Error building professional context:", error);
        // Fallback to basic context if database query fails
        return "You are Lewis Perez's AI assistant with access to professional tools. Start conversations by saying 'Hello, how can I help you today?' Use a professional but friendly tone. You have access to Lewis's professional experience as a Senior Software Engineer with 8+ years of experience, specializing in Java/Spring Boot development and database optimization. Use the available tools to provide detailed information when requested.";
    }
}

export async function POST() {
    try {        
        if (!process.env.OPENAI_API_KEY){
            throw new Error(`OPENAI_API_KEY is not set`);
        }

        // Build dynamic professional context from database
        const instructions = await buildProfessionalContext();
        
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "verse",
                modalities: ["audio", "text"],
                instructions: instructions,
                tools: realtimeTools,
                tool_choice: "auto",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Session creation error:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}