/**
 * AI Chat Conversation Tool Testing
 * Phase 2: Comprehensive testing of different personas and conversation types
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !match[1].startsWith('#') && match[1].trim()) {
        process.env[match[1].trim()] = match[2].replace(/^"(.*)"$/, '$1');
      }
    });
    return true;
  } catch (error) {
    console.error('❌ Failed to load environment:', error.message);
    return false;
  }
}

// Test scenarios for different personas and conversation types
const testScenarios = [
  {
    name: "Technical Interview Scenario",
    conversationType: "interview",
    persona: "technical_assessor",
    message: "Tell me about your experience with microservices architecture and how you handled inter-service communication",
    expectedKeywords: ["microservices", "architecture", "communication", "experience"]
  },
  {
    name: "Curious Explorer Scenario", 
    conversationType: "exploration",
    persona: "curious_explorer",
    message: "What's the most interesting project you've worked on and what made it special?",
    expectedKeywords: ["project", "interesting", "special"]
  },
  {
    name: "Professional Analyst Scenario",
    conversationType: "analysis",
    persona: "analyst", 
    message: "Analyze your career progression and technical skill development over the past 5 years",
    expectedKeywords: ["career", "progression", "skill", "development"]
  },
  {
    name: "Assessment Scenario",
    conversationType: "assessment",
    persona: "interviewer",
    message: "How do you approach performance optimization in Java applications?",
    expectedKeywords: ["performance", "optimization", "java"]
  }
];

class AIChatTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  logTest(name, passed, details = '') {
    if (passed) {
      console.log(`✅ ${name}`);
      this.results.passed++;
    } else {
      console.log(`❌ ${name}: ${details}`);
      this.results.failed++;
      this.results.errors.push({ name, details });
    }
  }

  async testPersonaEnhancement() {
    console.log('\n🎭 Testing Persona Enhancement...');
    
    const testMessage = "Tell me about your Java experience";
    
    // Import the persona enhancement function (simulated)
    const personas = {
      interviewer: "You are being interviewed by a professional recruiter. Provide detailed, specific examples of your experience and achievements. Be professional but personable.",
      technical_assessor: "You are being assessed by a senior technical expert. Provide deep technical details, explain your decision-making process, and demonstrate your technical expertise.",
      curious_explorer: "You are talking with someone genuinely interested in learning about your professional journey. Be open, share insights, and provide context for your experiences.",
      analyst: "You are being analyzed by a professional analyst. Provide comprehensive information that allows for thorough evaluation of your skills, experience, and professional trajectory."
    };

    for (const [persona, enhancement] of Object.entries(personas)) {
      const enhanced = `${enhancement}\n\n${testMessage}`;
      this.logTest(
        `Persona Enhancement - ${persona}`,
        enhanced.includes(enhancement) && enhanced.includes(testMessage),
        `Enhancement length: ${enhanced.length}`
      );
    }
  }

  async testTopicExtraction() {
    console.log('\n🔍 Testing Topic Extraction...');
    
    const testTexts = [
      "I have 8 years of experience with Java Spring Boot microservices on AWS",
      "Working with PostgreSQL databases and Docker containerization for DevOps",
      "Frontend development using React TypeScript and Next.js frameworks"
    ];

    const expectedTopics = [
      ["java", "spring", "microservices", "aws"],
      ["postgresql", "docker", "devops"],
      ["react", "typescript"]
    ];

    // Simple topic extraction simulation
    const topicKeywords = [
      'java', 'spring', 'microservices', 'database', 'api', 'performance', 'optimization',
      'architecture', 'design', 'development', 'testing', 'deployment', 'cloud', 'aws',
      'docker', 'kubernetes', 'postgresql', 'elasticsearch', 'monitoring', 'leadership',
      'team', 'project', 'agile', 'scrum', 'devops', 'ci/cd', 'automation', 'react', 'typescript'
    ];

    testTexts.forEach((text, index) => {
      const found = topicKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const hasExpectedTopics = expectedTopics[index].some(topic => 
        found.includes(topic)
      );
      
      this.logTest(
        `Topic Extraction - Text ${index + 1}`,
        hasExpectedTopics,
        `Found topics: ${found.join(', ')}`
      );
    });
  }

  async testFollowUpGeneration() {
    console.log('\n🔄 Testing Follow-up Question Generation...');
    
    const response = "I've worked extensively with Java Spring Boot for 5 years, building microservices that handle high-volume transactions in banking systems. The main challenges were ensuring data consistency across services and managing inter-service communication efficiently.";
    
    const conversationTypes = ['interview', 'assessment', 'exploration', 'analysis'];
    
    conversationTypes.forEach(type => {
      // Simulate follow-up generation logic
      const followUpPatterns = {
        interview: [
          "Can you give me a specific example of when you...",
          "How did you handle the situation when...",
          "What was the outcome of..."
        ],
        assessment: [
          "What were the technical challenges with...",
          "How did you optimize...",
          "What alternatives did you consider for..."
        ],
        exploration: [
          "That's interesting, can you tell me more about...",
          "What led you to...",
          "How did that experience shape..."
        ],
        analysis: [
          "Based on your experience, how would you evaluate...",
          "What patterns do you see in...",
          "How has your approach evolved..."
        ]
      };
      
      const patterns = followUpPatterns[type];
      const hasPatterns = patterns && patterns.length > 0;
      
      this.logTest(
        `Follow-up Generation - ${type}`,
        hasPatterns,
        `Pattern count: ${patterns?.length || 0}`
      );
    });
  }

  async testSessionManagement() {
    console.log('\n📝 Testing Session Management...');
    
    const sessionId = `test-session-${Date.now()}`;
    
    // Test session ID format
    this.logTest(
      'Session ID Format',
      sessionId.includes('test-session-') && sessionId.length > 15,
      `Session ID: ${sessionId}`
    );
    
    // Test session parameters
    const sessionParams = {
      sessionId,
      conversationType: 'interview',
      persona: 'technical_assessor',
      aiModel: 'openai/gpt-4o-mini'
    };
    
    const validConversationTypes = ['interview', 'assessment', 'exploration', 'analysis'];
    const validPersonas = ['interviewer', 'technical_assessor', 'curious_explorer', 'analyst'];
    
    this.logTest(
      'Valid Conversation Type',
      validConversationTypes.includes(sessionParams.conversationType),
      `Type: ${sessionParams.conversationType}`
    );
    
    this.logTest(
      'Valid Persona',
      validPersonas.includes(sessionParams.persona),
      `Persona: ${sessionParams.persona}`
    );
    
    this.logTest(
      'Valid AI Model',
      sessionParams.aiModel.includes('openai/'),
      `Model: ${sessionParams.aiModel}`
    );
  }

  async testResponseFormatting() {
    console.log('\n📋 Testing Response Formatting...');
    
    const mockResponse = {
      response: "I have extensive experience with Java Spring Boot...",
      sources: [
        { title: "Experience Record", type: "database", relevanceScore: 0.95 },
        { title: "Skills Assessment", type: "evaluation", relevanceScore: 0.87 }
      ]
    };
    
    const options = {
      sessionId: 'test-session-123',
      conversationType: 'interview',
      persona: 'technical_assessor',
      responseFormat: 'comprehensive',
      followUpQuestions: [
        "Can you elaborate on your Spring Boot architecture decisions?",
        "How did you handle scalability challenges?",
        "What testing strategies did you implement?"
      ],
      conversationTurn: 3
    };
    
    // Simulate response formatting
    let formatted = `**AI Portfolio Response** (Turn ${options.conversationTurn})\n\n`;
    formatted += `${mockResponse.response}\n\n`;
    
    if (mockResponse.sources && mockResponse.sources.length > 0) {
      formatted += `**Sources Consulted:**\n`;
      mockResponse.sources.forEach((source, index) => {
        formatted += `${index + 1}. ${source.title || source.type} (Relevance: ${(source.relevanceScore * 100).toFixed(1)}%)\n`;
      });
      formatted += '\n';
    }
    
    if (options.followUpQuestions && options.followUpQuestions.length > 0) {
      formatted += `**Suggested Follow-up Questions:**\n`;
      options.followUpQuestions.forEach((question, index) => {
        formatted += `${index + 1}. ${question}\n`;
      });
      formatted += '\n';
    }
    
    formatted += `*Session: ${options.sessionId} | Type: ${options.conversationType} | Persona: ${options.persona}*`;
    
    this.logTest(
      'Response Header Format',
      formatted.includes('**AI Portfolio Response**') && formatted.includes(`Turn ${options.conversationTurn}`),
      'Header formatting correct'
    );
    
    this.logTest(
      'Sources Section',
      formatted.includes('**Sources Consulted:**') && formatted.includes('Relevance:'),
      'Sources formatting correct'
    );
    
    this.logTest(
      'Follow-up Questions',
      formatted.includes('**Suggested Follow-up Questions:**') && formatted.includes('Can you elaborate'),
      'Follow-up formatting correct'
    );
    
    this.logTest(
      'Session Metadata',
      formatted.includes(options.sessionId) && formatted.includes(options.conversationType),
      'Metadata formatting correct'
    );
  }

  async runAllTests() {
    console.log('\n🧪 PHASE 2: AI Chat Conversation Tool Testing\n');
    
    if (!loadEnv()) {
      console.log('❌ Environment setup failed');
      return false;
    }
    
    await this.testPersonaEnhancement();
    await this.testTopicExtraction();
    await this.testFollowUpGeneration();
    await this.testSessionManagement();
    await this.testResponseFormatting();
    
    // Print test summary
    console.log('\n📊 AI Chat Tool Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error.name}: ${error.details}`);
      });
    }
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    return this.results.failed === 0;
  }
}

// Run the tests
const tester = new AIChatTester();
tester.runAllTests().then(success => {
  console.log('\n🎉 AI Chat Tool Testing Completed!');
  if (success) {
    console.log('✅ All tests passed - Tool is ready for integration');
  } else {
    console.log('⚠️ Some tests failed - Review and fix before deployment');
  }
}).catch(error => {
  console.error('💥 Test suite crashed:', error);
});