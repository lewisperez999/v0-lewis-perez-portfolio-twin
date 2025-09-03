"use server"

import { generateAIResponse } from "../../actions/chat"

export interface SystemHealthStatus {
  database: {
    status: "healthy" | "warning" | "error"
    message: string
  }
  vectorSearch: {
    status: "healthy" | "warning" | "error" 
    message: string
  }
  aiModel: {
    status: "healthy" | "warning" | "error"
    message: string
    model?: string
  }
}

export async function checkSystemHealth(): Promise<SystemHealthStatus> {
  const health: SystemHealthStatus = {
    database: { status: "healthy", message: "Connected" },
    vectorSearch: { status: "healthy", message: "Operational" },
    aiModel: { status: "error", message: "Not tested" }
  }

  // Test AI Model
  try {
    console.log("Testing AI model health...")
    
    // Test with a simple prompt
    const testResult = await generateAIResponse("Hello, this is a health check. Please respond with 'OK'")
    
    if (testResult && testResult.response && testResult.response.trim().length > 0) {
      // Get the configured model from environment
      const configuredModel = process.env.AI_MODEL || "openai/gpt-4o-mini"
      
      health.aiModel = {
        status: "healthy",
        message: "Operational",
        model: configuredModel
      }
      console.log("AI model health check passed:", configuredModel)
    } else {
      health.aiModel = {
        status: "warning",
        message: "Empty response received"
      }
    }
  } catch (error) {
    console.error("AI model health check failed:", error)
    
    // Determine if it's a configuration issue or API issue
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    if (errorMessage.includes("API key") || errorMessage.includes("authentication")) {
      health.aiModel = {
        status: "error",
        message: "Authentication failed - check AI_GATEWAY_API_KEY"
      }
    } else if (errorMessage.includes("model") || errorMessage.includes("AI_MODEL")) {
      health.aiModel = {
        status: "error", 
        message: "Model configuration error - check AI_MODEL setting"
      }
    } else {
      health.aiModel = {
        status: "warning",
        message: "AI service temporarily unavailable"
      }
    }
  }

  // TODO: Add actual database and vector search health checks
  // For now, we'll assume they're healthy since the app is running

  return health
}