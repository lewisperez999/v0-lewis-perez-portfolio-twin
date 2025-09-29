import { generateAIResponse, searchProfessionalContent, getSuggestedQuestions } from "@/app/actions/chat";
import { getPersonalInfo } from "@/app/admin/actions/personal-info";
import { getExperiences } from "@/app/admin/actions/experience";
import { getSkillsByCategory } from "@/app/admin/actions/skills";

// Tool definitions for OpenAI Realtime API
export const realtimeTools = [
  {
    type: "function",
    name: "search_professional_content",
    description: "Search Lewis's professional content including experience, skills, and projects",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant professional information"
        }
      },
      required: ["query"]
    }
  },
  {
    type: "function", 
    name: "get_detailed_experience",
    description: "Get detailed information about Lewis's work experience at specific companies",
    parameters: {
      type: "object",
      properties: {
        company: {
          type: "string",
          description: "Optional company name to filter by (e.g., 'ING', 'Amdocs')"
        }
      }
    }
  },
  {
    type: "function",
    name: "get_technical_skills",
    description: "Get Lewis's technical skills organized by category with proficiency levels",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional skill category to filter by (e.g., 'Programming Languages', 'Cloud & DevOps')"
        }
      }
    }
  },
  {
    type: "function",
    name: "get_suggested_questions",
    description: "Get suggested questions that users commonly ask about Lewis's background",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    type: "function",
    name: "get_conversation_context",
    description: "Get contextual information based on the conversation topic using RAG",
    parameters: {
      type: "object", 
      properties: {
        topic: {
          type: "string",
          description: "The topic or question to get relevant context for"
        }
      },
      required: ["topic"]
    }
  }
];

// Tool handlers that use your existing chat functions
export const toolHandlers = {
  search_professional_content: async (args: { query: string }) => {
    try {
      const results = await searchProfessionalContent(args.query);
      return {
        success: true,
        results: results.results.map(r => ({
          content: r.content,
          relevance: r.score,
          type: r.metadata?.chunk_type || 'general'
        })),
        totalResults: results.totalResults
      };
    } catch (error) {
      return { success: false, error: 'Failed to search content' };
    }
  },

  get_detailed_experience: async (args: { company?: string }) => {
    try {
      const experiences = await getExperiences();
      const filtered = args.company 
        ? experiences.filter(exp => exp.company.toLowerCase().includes(args.company!.toLowerCase()))
        : experiences;
      
      return {
        success: true,
        experiences: filtered.map(exp => ({
          company: exp.company,
          position: exp.position,
          duration: exp.duration,
          description: exp.description,
          achievements: exp.achievements,
          technologies: exp.technologies
        }))
      };
    } catch (error) {
      return { success: false, error: 'Failed to get experience data' };
    }
  },

  get_technical_skills: async (args: { category?: string }) => {
    try {
      const skillsByCategory = await getSkillsByCategory();
      const filtered = args.category 
        ? { [args.category]: skillsByCategory[args.category] || [] }
        : skillsByCategory;
      
      return {
        success: true,
        skillsByCategory: filtered
      };
    } catch (error) {
      return { success: false, error: 'Failed to get skills data' };
    }
  },

  get_suggested_questions: async () => {
    try {
      const questions = await getSuggestedQuestions();
      return {
        success: true,
        questions
      };
    } catch (error) {
      return { success: false, error: 'Failed to get suggested questions' };
    }
  },

  get_conversation_context: async (args: { topic: string }) => {
    try {
      // Use your existing generateAIResponse logic for context
      const response = await generateAIResponse(args.topic, [], undefined, {
        responseFormat: "concise",
        includeSources: true
      });
      
      return {
        success: true,
        context: response.response,
        sources: response.sources
      };
    } catch (error) {
      return { success: false, error: 'Failed to get conversation context' };
    }
  }
};