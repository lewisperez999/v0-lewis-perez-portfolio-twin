# Telephony Implementation Technical Guide

## Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [API Reference](#api-reference)
3. [Integration Examples](#integration-examples)
4. [Configuration](#configuration)
5. [Testing Procedures](#testing-procedures)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Twilio account with verified phone number
- ngrok for local development (optional)

### Environment Setup

```bash
# Install dependencies
npm install twilio @twilio/voice-sdk

# Environment variables (.env.local)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/telephony/webhook

# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Security
ENCRYPTION_KEY=your_32_char_encryption_key
WEBHOOK_SECRET=your_webhook_secret
```

### Database Migration

```sql
-- Run this migration to add telephony tables
-- /database/migration-002-telephony.sql

-- Telephony configuration
CREATE TABLE IF NOT EXISTS telephony_config (
  id SERIAL PRIMARY KEY,
  twilio_account_sid VARCHAR(255),
  phone_number VARCHAR(50),
  webhook_url VARCHAR(255),
  recording_enabled BOOLEAN DEFAULT TRUE,
  greeting_message TEXT DEFAULT 'Hello! You''ve reached Lewis Perez''s professional digital assistant. How can I help you today?',
  business_hours JSON DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call sessions
CREATE TABLE IF NOT EXISTS call_sessions (
  id SERIAL PRIMARY KEY,
  call_sid VARCHAR(255) UNIQUE NOT NULL,
  caller_number VARCHAR(50),
  caller_country VARCHAR(10),
  call_direction VARCHAR(20) CHECK (call_direction IN ('inbound', 'outbound')),
  call_status VARCHAR(20) DEFAULT 'initiated',
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP,
  total_duration INTEGER DEFAULT 0,
  conversation_context JSON DEFAULT '{}',
  escalated_at TIMESTAMP,
  escalation_reason TEXT,
  recording_url VARCHAR(255),
  recording_sid VARCHAR(255),
  transcript TEXT,
  summary TEXT,
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  total_cost DECIMAL(10,4) DEFAULT 0.0000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation turns
CREATE TABLE IF NOT EXISTS conversation_turns (
  id SERIAL PRIMARY KEY,
  call_session_id INTEGER REFERENCES call_sessions(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  speaker VARCHAR(20) CHECK (speaker IN ('caller', 'assistant')) NOT NULL,
  message_text TEXT,
  audio_url VARCHAR(255),
  audio_duration INTEGER, -- seconds
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  intent_classification VARCHAR(100),
  entities_extracted JSON,
  response_source VARCHAR(50), -- 'mcp_tool', 'ai_generated', 'escalation'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call analytics
CREATE TABLE IF NOT EXISTS call_metrics (
  id SERIAL PRIMARY KEY,
  call_session_id INTEGER REFERENCES call_sessions(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4),
  metric_unit VARCHAR(50),
  metadata JSON,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call feedback
CREATE TABLE IF NOT EXISTS call_feedback (
  id SERIAL PRIMARY KEY,
  call_session_id INTEGER REFERENCES call_sessions(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50), -- 'rating', 'comment', 'complaint'
  feedback_value TEXT,
  caller_email VARCHAR(255),
  follow_up_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_sessions_call_sid ON call_sessions(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_sessions_caller_number ON call_sessions(caller_number);
CREATE INDEX IF NOT EXISTS idx_call_sessions_created_at ON call_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_turns_call_session_id ON conversation_turns(call_session_id);
CREATE INDEX IF NOT EXISTS idx_call_metrics_call_session_id ON call_metrics(call_session_id);
```

### Basic Implementation

```typescript
// /app/api/telephony/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { TelephonyService } from '@/lib/telephony-service';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData);
    
    // Validate webhook signature
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = process.env.TWILIO_WEBHOOK_URL!;
    
    if (!twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN!, body, url, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    
    const telephonyService = new TelephonyService();
    const twiml = await telephonyService.handleWebhook(body);
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## API Reference

### Core Classes

#### TelephonyService

```typescript
class TelephonyService {
  // Initialize new call session
  async initializeCall(callData: CallInitData): Promise<CallSession>
  
  // Process voice input
  async processVoiceInput(callSid: string, audioUrl: string): Promise<ProcessedInput>
  
  // Generate voice response
  async generateVoiceResponse(callSid: string, query: string): Promise<VoiceResponse>
  
  // Handle call escalation
  async escalateCall(callSid: string, reason: string): Promise<EscalationResult>
  
  // End call session
  async endCall(callSid: string): Promise<CallSummary>
}
```

#### CallSession

```typescript
interface CallSession {
  id: number;
  callSid: string;
  callerNumber: string;
  callDirection: 'inbound' | 'outbound';
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  context: ConversationContext;
  metrics: CallMetrics;
}

interface ConversationContext {
  currentTopic: string;
  previousQueries: string[];
  userPreferences: UserPreferences;
  escalationTriggers: string[];
}
```

### Webhook Endpoints

#### Voice Webhook
```
POST /api/telephony/webhook
Content-Type: application/x-www-form-urlencoded

Parameters:
- CallSid: Unique call identifier
- From: Caller's phone number
- To: Called phone number
- CallStatus: Current call status
- Direction: 'inbound' or 'outbound'
```

#### Status Callback
```
POST /api/telephony/status
Content-Type: application/x-www-form-urlencoded

Parameters:
- CallSid: Unique call identifier
- CallStatus: Updated call status
- CallDuration: Total call duration in seconds
```

#### Recording Callback
```
POST /api/telephony/recording
Content-Type: application/x-www-form-urlencoded

Parameters:
- RecordingSid: Unique recording identifier
- RecordingUrl: URL to access recording
- RecordingDuration: Recording duration in seconds
```

### TwiML Responses

#### Basic Greeting
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello! You've reached Lewis Perez's professional digital assistant. 
    How can I help you today?
  </Say>
  <Gather action="/api/telephony/process" method="POST" timeout="10">
    <Say voice="alice">Please speak your question after the tone.</Say>
  </Gather>
</Response>
```

#### Voice Processing
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Thank you for your question about my experience with React. 
    I have over 3 years of experience building React applications...
  </Say>
  <Gather action="/api/telephony/process" method="POST" timeout="10">
    <Say voice="alice">Is there anything else you'd like to know?</Say>
  </Gather>
</Response>
```

#### Escalation
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    I'd be happy to have Lewis contact you directly. 
    Please leave your name, email, and a brief message after the tone.
  </Say>
  <Record action="/api/telephony/voicemail" maxLength="120" />
</Response>
```

---

## Integration Examples

### Basic Voice Processing

```typescript
// /lib/telephony-service.ts
import { executeTool } from '@/app/mcp/server';
import { CallSession } from '@/lib/types/telephony';

export class TelephonyService {
  async processVoiceQuery(callSid: string, transcript: string): Promise<string> {
    try {
      // Classify intent
      const intent = await this.classifyIntent(transcript);
      
      // Route to appropriate MCP tool
      let response: string;
      switch (intent.category) {
        case 'experience':
          response = await this.handleExperienceQuery(transcript);
          break;
        case 'projects':
          response = await this.handleProjectQuery(transcript);
          break;
        case 'skills':
          response = await this.handleSkillQuery(transcript);
          break;
        case 'contact':
          response = await this.handleContactQuery(transcript);
          break;
        default:
          response = await this.handleGeneralQuery(transcript);
      }
      
      // Log conversation turn
      await this.logConversationTurn(callSid, transcript, response, intent);
      
      return response;
    } catch (error) {
      console.error('Voice processing error:', error);
      return "I apologize, but I'm having trouble processing your question. Could you please try again?";
    }
  }

  private async handleExperienceQuery(transcript: string): Promise<string> {
    const result = await executeTool('get_experience_history', {
      include_details: true,
      format: 'summary'
    });
    
    // Convert to conversational response
    return this.formatForVoice(result.content[0].text);
  }

  private async handleProjectQuery(transcript: string): Promise<string> {
    // Extract technology from transcript
    const technology = this.extractTechnology(transcript);
    
    const result = await executeTool('query_projects', {
      technology,
      featured: true,
      limit: 3
    });
    
    return this.formatForVoice(result.content[0].text);
  }

  private formatForVoice(text: string): string {
    // Convert markdown and technical formatting to voice-friendly text
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\n+/g, '. ') // Convert line breaks to pauses
      .replace(/[#•]/g, '') // Remove bullet points and headers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
```

### Call Analytics Implementation

```typescript
// /lib/call-analytics.ts
export class CallAnalytics {
  async recordCallStart(callData: CallStartData): Promise<void> {
    await query(`
      INSERT INTO call_sessions (
        call_sid, caller_number, caller_country, call_direction, call_status
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      callData.callSid,
      callData.callerNumber,
      callData.callerCountry,
      callData.direction,
      'in-progress'
    ]);
  }

  async recordConversationTurn(turnData: ConversationTurnData): Promise<void> {
    await query(`
      INSERT INTO conversation_turns (
        call_session_id, turn_number, speaker, message_text, 
        processing_time_ms, confidence_score, intent_classification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      turnData.callSessionId,
      turnData.turnNumber,
      turnData.speaker,
      turnData.messageText,
      turnData.processingTime,
      turnData.confidenceScore,
      turnData.intentClassification
    ]);
  }

  async recordCallMetric(metricData: CallMetricData): Promise<void> {
    await query(`
      INSERT INTO call_metrics (
        call_session_id, metric_name, metric_value, metric_unit
      ) VALUES ($1, $2, $3, $4)
    `, [
      metricData.callSessionId,
      metricData.metricName,
      metricData.metricValue,
      metricData.metricUnit
    ]);
  }

  async getCallAnalytics(timeframe: 'day' | 'week' | 'month'): Promise<AnalyticsData> {
    const interval = timeframe === 'day' ? '1 day' : 
                    timeframe === 'week' ? '7 days' : '30 days';
    
    const [callVolume, averageDuration, topIntents] = await Promise.all([
      this.getCallVolume(interval),
      this.getAverageDuration(interval),
      this.getTopIntents(interval)
    ]);

    return {
      callVolume,
      averageDuration,
      topIntents,
      timeframe
    };
  }
}
```

### Voice Quality Optimization

```typescript
// /lib/voice-optimization.ts
export class VoiceOptimization {
  // Optimize text for speech synthesis
  static optimizeForTTS(text: string): string {
    return text
      // Add pauses for readability
      .replace(/\. /g, '. <break time="0.5s"/> ')
      .replace(/: /g, ': <break time="0.3s"/> ')
      
      // Pronounce technical terms correctly
      .replace(/\bReact\b/g, '<phoneme ph="riːækt">React</phoneme>')
      .replace(/\bNext\.js\b/g, '<phoneme ph="nɛkst dɒt dʒeɪ ɛs">Next.js</phoneme>')
      .replace(/\bTypeScript\b/g, '<phoneme ph="taɪp skrɪpt">TypeScript</phoneme>')
      
      // Handle acronyms
      .replace(/\bAPI\b/g, '<say-as interpret-as="characters">API</say-as>')
      .replace(/\bUI\b/g, '<say-as interpret-as="characters">UI</say-as>')
      .replace(/\bUX\b/g, '<say-as interpret-as="characters">UX</say-as>')
      
      // Add emphasis to important points
      .replace(/\b(expert|advanced|proficient)\b/gi, '<emphasis level="moderate">$1</emphasis>');
  }

  // Detect and handle poor audio quality
  static async analyzeAudioQuality(audioUrl: string): Promise<AudioQualityReport> {
    // Implement audio analysis
    const analysis = await this.performAudioAnalysis(audioUrl);
    
    return {
      signalToNoiseRatio: analysis.snr,
      clarity: analysis.clarity,
      recommendations: this.generateQualityRecommendations(analysis)
    };
  }
}
```

---

## Configuration

### Environment Variables

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_WEBHOOK_URL=https://your-domain.com/api/telephony/webhook

# Voice Configuration
TTS_VOICE_NAME=alice
TTS_LANGUAGE=en-US
STT_LANGUAGE=en-US
STT_ENHANCED=true

# Call Recording
RECORDING_ENABLED=true
RECORDING_TRANSCRIPTION=true
RECORDING_RETENTION_DAYS=180

# Business Hours (JSON string)
BUSINESS_HOURS='{"monday":{"start":"09:00","end":"17:00"},"tuesday":{"start":"09:00","end":"17:00"},"wednesday":{"start":"09:00","end":"17:00"},"thursday":{"start":"09:00","end":"17:00"},"friday":{"start":"09:00","end":"17:00"}}'
BUSINESS_TIMEZONE=America/New_York

# AI Configuration
AI_PROVIDER=openai  # or anthropic
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=gpt-4-turbo-preview
MAX_RESPONSE_LENGTH=500

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
WEBHOOK_SECRET=your-webhook-verification-secret
RATE_LIMIT_CALLS_PER_MINUTE=10

# Monitoring
ENABLE_CALL_ANALYTICS=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=info
```

### Twilio Configuration

```typescript
// /lib/twilio-config.ts
export const twilioConfig = {
  voice: {
    tts: {
      voice: process.env.TTS_VOICE_NAME || 'alice',
      language: process.env.TTS_LANGUAGE || 'en-US'
    },
    stt: {
      language: process.env.STT_LANGUAGE || 'en-US',
      enhanced: process.env.STT_ENHANCED === 'true',
      speechTimeout: 'auto',
      speechModel: 'experimental_conversations'
    },
    recording: {
      enabled: process.env.RECORDING_ENABLED === 'true',
      transcription: process.env.RECORDING_TRANSCRIPTION === 'true',
      trim: 'trim-silence'
    }
  },
  webhooks: {
    voice: process.env.TWILIO_WEBHOOK_URL + '/webhook',
    status: process.env.TWILIO_WEBHOOK_URL + '/status',
    recording: process.env.TWILIO_WEBHOOK_URL + '/recording'
  }
};
```

---

## Testing Procedures

### Unit Tests

```typescript
// /tests/telephony/telephony-service.test.ts
import { TelephonyService } from '@/lib/telephony-service';
import { mockCallData, mockTranscript } from './test-fixtures';

describe('TelephonyService', () => {
  let service: TelephonyService;

  beforeEach(() => {
    service = new TelephonyService();
  });

  describe('processVoiceQuery', () => {
    it('should handle experience queries correctly', async () => {
      const response = await service.processVoiceQuery(
        'test-call-sid',
        'Tell me about your work experience'
      );
      
      expect(response).toContain('experience');
      expect(response.length).toBeLessThan(500); // Voice response limit
    });

    it('should handle project queries with technology filter', async () => {
      const response = await service.processVoiceQuery(
        'test-call-sid',
        'What React projects have you worked on?'
      );
      
      expect(response).toContain('React');
      expect(response).not.toContain('**'); // Markdown removed
    });
  });

  describe('formatForVoice', () => {
    it('should remove markdown formatting', () => {
      const input = '**Bold text** and *italic text*';
      const output = service.formatForVoice(input);
      
      expect(output).toBe('Bold text and italic text');
    });

    it('should convert line breaks to pauses', () => {
      const input = 'Line one\nLine two\n\nLine three';
      const output = service.formatForVoice(input);
      
      expect(output).toBe('Line one. Line two. Line three');
    });
  });
});
```

### Integration Tests

```typescript
// /tests/integration/telephony-webhook.test.ts
import { POST } from '@/app/api/telephony/webhook/route';
import { createMockRequest } from '@/tests/utils/mock-request';

describe('Telephony Webhook Integration', () => {
  it('should handle incoming call webhook', async () => {
    const formData = new FormData();
    formData.append('CallSid', 'CA123456789');
    formData.append('From', '+15551234567');
    formData.append('To', '+15559876543');
    formData.append('CallStatus', 'ringing');

    const request = createMockRequest(formData, {
      'x-twilio-signature': 'valid-signature'
    });

    const response = await POST(request);
    const twiml = await response.text();

    expect(response.status).toBe(200);
    expect(twiml).toContain('<Say');
    expect(twiml).toContain('professional digital assistant');
  });

  it('should reject invalid webhook signatures', async () => {
    const formData = new FormData();
    formData.append('CallSid', 'CA123456789');

    const request = createMockRequest(formData, {
      'x-twilio-signature': 'invalid-signature'
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});
```

### Load Testing

```typescript
// /tests/load/call-volume.test.ts
import { performance } from 'perf_hooks';

describe('Call Volume Load Testing', () => {
  it('should handle 10 concurrent calls', async () => {
    const startTime = performance.now();
    
    const calls = Array.from({ length: 10 }, (_, i) => 
      simulateCall(`test-call-${i}`)
    );
    
    const results = await Promise.all(calls);
    const endTime = performance.now();
    
    expect(results.every(r => r.success)).toBe(true);
    expect(endTime - startTime).toBeLessThan(5000); // 5 second max
  });

  async function simulateCall(callSid: string) {
    // Simulate full call flow
    const service = new TelephonyService();
    
    try {
      await service.initializeCall({ callSid, from: '+15551234567' });
      await service.processVoiceQuery(callSid, 'Tell me about your experience');
      await service.endCall(callSid);
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
});
```

### Manual Testing Checklist

```markdown
## Pre-deployment Testing Checklist

### Basic Functionality
- [ ] Incoming calls connect successfully
- [ ] Greeting message plays correctly
- [ ] Speech recognition works with clear audio
- [ ] Text-to-speech responses are natural
- [ ] Calls end gracefully

### Voice Quality
- [ ] Audio quality is acceptable
- [ ] No significant delays or echoes
- [ ] Background noise handling
- [ ] Different accents and speaking speeds
- [ ] Various phone types (mobile, landline, VoIP)

### AI Integration
- [ ] Experience queries return relevant information
- [ ] Project queries filter correctly
- [ ] Skills queries are comprehensive
- [ ] Contact information is accurate
- [ ] Escalation triggers work properly

### Business Logic
- [ ] Business hours detection
- [ ] Voicemail system functions
- [ ] Call recording operates correctly
- [ ] Analytics data is captured
- [ ] Cost tracking is accurate

### Error Handling
- [ ] Poor audio quality scenarios
- [ ] Network interruptions
- [ ] Database connection issues
- [ ] AI service outages
- [ ] Invalid input handling

### Security
- [ ] Webhook signature validation
- [ ] Rate limiting enforcement
- [ ] Data encryption verification
- [ ] Access control compliance
- [ ] Audit logging functionality
```

---

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Calls

**Symptoms:**
- Calls go directly to voicemail
- No webhook requests in logs
- Twilio shows webhook errors

**Solutions:**
```bash
# Check webhook URL configuration
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers.json" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN

# Verify webhook URL is accessible
curl -X POST https://your-domain.com/api/telephony/webhook \
  -d "CallSid=test&From=+15551234567&To=+15559876543"

# Check firewall and port configuration
netstat -tulpn | grep :443
```

#### 2. Poor Voice Quality

**Symptoms:**
- Choppy or distorted audio
- Significant delays
- Echo or feedback

**Diagnostic Steps:**
```typescript
// Add audio quality monitoring
async function monitorAudioQuality(callSid: string) {
  const metrics = await twilioClient.calls(callSid)
    .insights
    .fetch();
    
  console.log('Audio Quality Metrics:', {
    jitter: metrics.mean_jitter,
    rtt: metrics.mean_rtt,
    packetLoss: metrics.packet_loss
  });
}
```

**Solutions:**
- Check network bandwidth and latency
- Optimize audio codec settings
- Implement adaptive bitrate
- Use regional Twilio endpoints

#### 3. Speech Recognition Errors

**Symptoms:**
- Incorrect transcriptions
- No transcription returned
- Timeout errors

**Debugging:**
```typescript
// Add speech recognition debugging
const gather = twiml.gather({
  action: '/api/telephony/process',
  method: 'POST',
  timeout: 10,
  speechTimeout: 'auto',
  enhanced: true,
  speechModel: 'experimental_conversations'
});

// Log speech recognition results
app.post('/api/telephony/process', (req, res) => {
  console.log('Speech Recognition Results:', {
    speechResult: req.body.SpeechResult,
    confidence: req.body.Confidence,
    speechModel: req.body.SpeechModel
  });
});
```

#### 4. Database Connection Issues

**Symptoms:**
- Call data not being saved
- Analytics queries failing
- Connection timeout errors

**Solutions:**
```typescript
// Add database health check
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Implement connection retry logic
async function queryWithRetry(sql: string, params: any[], retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await query(sql, params);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Performance Optimization

#### Response Time Optimization
```typescript
// Cache common responses
const responseCache = new Map<string, string>();

async function getCachedResponse(query: string): Promise<string | null> {
  const cacheKey = query.toLowerCase().trim();
  return responseCache.get(cacheKey) || null;
}

async function cacheResponse(query: string, response: string): Promise<void> {
  const cacheKey = query.toLowerCase().trim();
  responseCache.set(cacheKey, response);
  
  // Limit cache size
  if (responseCache.size > 1000) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
}
```

#### Database Query Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_call_sessions_caller_created 
ON call_sessions (caller_number, created_at DESC);

CREATE INDEX CONCURRENTLY idx_conversation_turns_call_session_turn 
ON conversation_turns (call_session_id, turn_number);

-- Optimize analytics queries
CREATE MATERIALIZED VIEW call_daily_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as call_count,
  AVG(total_duration) as avg_duration,
  COUNT(CASE WHEN escalated_at IS NOT NULL THEN 1 END) as escalated_count
FROM call_sessions
GROUP BY DATE_TRUNC('day', created_at);

-- Refresh view daily
REFRESH MATERIALIZED VIEW call_daily_stats;
```

### Monitoring and Alerting

#### Health Check Endpoint
```typescript
// /app/api/health/telephony/route.ts
export async function GET() {
  const healthChecks = await Promise.all([
    checkTwilioConnectivity(),
    checkDatabaseConnection(),
    checkAIServiceAvailability(),
    checkDiskSpace(),
    checkMemoryUsage()
  ]);

  const isHealthy = healthChecks.every(check => check.status === 'healthy');
  
  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: healthChecks
  }, {
    status: isHealthy ? 200 : 503
  });
}
```

#### Alert Configuration
```typescript
// Set up monitoring alerts
const alertThresholds = {
  responseTime: 2000, // 2 seconds
  errorRate: 0.05, // 5%
  callVolume: 100, // calls per hour
  diskSpace: 0.9 // 90% full
};

async function checkAlertThresholds() {
  const metrics = await getSystemMetrics();
  
  if (metrics.avgResponseTime > alertThresholds.responseTime) {
    await sendAlert('High response time detected', metrics);
  }
  
  if (metrics.errorRate > alertThresholds.errorRate) {
    await sendAlert('High error rate detected', metrics);
  }
}
```

This technical guide provides comprehensive implementation details for integrating telephony capabilities into your professional portfolio. The modular design allows for incremental implementation and easy maintenance.