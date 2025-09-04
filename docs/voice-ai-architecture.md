# Voice AI Technical Architecture

## System Overview

This document outlines the complete technical architecture for integrating voice AI capabilities into the Lewis Perez professional digital twin portfolio system.

## High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Layer  │    │  Gateway Layer   │    │  AI/Voice Layer │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   Browser   │ │    │ │ Next.js API  │ │    │ │   VAPI.ai   │ │
│ │  WebRTC     │◄├────┤ │   Routes     │◄├────┤ │   Service   │ │
│ │  Audio      │ │    │ │              │ │    │ │             │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Voice UI    │ │    │ │ WebSocket    │ │    │ │ OpenAI      │ │
│ │ Components  │ │    │ │ Handler      │ │    │ │ Realtime    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
               ┌─────────────────────────────────┐
               │        Data Layer               │
               │                                 │
               │ ┌─────────────┐ ┌─────────────┐ │
               │ │ PostgreSQL  │ │ Vector DB   │ │
               │ │ Database    │ │ (Embeddings)│ │
               │ └─────────────┘ └─────────────┘ │
               └─────────────────────────────────┘
```

## Component Architecture

### 1. Client Layer Components

#### Voice Chat Component (`components/voice-chat.tsx`)
```typescript
interface VoiceChatProps {
  onStateChange?: (state: VoiceState) => void;
  fallbackToText?: boolean;
  audioConstraints?: MediaStreamConstraints;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  audioLevel: number;
  error?: VoiceError;
}
```

#### Audio Processing Manager
```typescript
class AudioProcessor {
  private mediaRecorder: MediaRecorder;
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  
  async initializeAudio(): Promise<MediaStream>;
  startRecording(): void;
  stopRecording(): Blob;
  getAudioLevel(): number;
  processAudioChunk(chunk: Blob): Promise<void>;
}
```

#### WebRTC Connection Manager
```typescript
class VoiceConnectionManager {
  private connection: RTCPeerConnection;
  private websocket: WebSocket;
  
  async establishConnection(): Promise<void>;
  sendAudioData(data: Blob): Promise<void>;
  handleIncomingAudio(stream: MediaStream): void;
  disconnect(): void;
}
```

### 2. API Layer Architecture

#### Voice API Routes Structure
```
/api/voice/
├── connect/          # WebSocket connection endpoint
├── session/          # Session management
│   ├── create/       # Create new voice session
│   ├── [id]/         # Session-specific operations
│   └── end/          # End voice session
├── audio/            # Audio processing endpoints
│   ├── upload/       # Audio file upload
│   ├── process/      # Real-time audio processing
│   └── synthesize/   # Text-to-speech conversion
└── config/           # Voice configuration
    ├── persona/      # Voice persona settings
    └── quality/      # Audio quality settings
```

#### Core API Implementation

##### Session Management (`/api/voice/session/create/route.ts`)
```typescript
export async function POST(request: Request) {
  const session = await createVoiceSession({
    userId: getUserId(request),
    persona: 'lewis-perez-professional',
    quality: 'hd',
    context: await getRAGContext()
  });
  
  return NextResponse.json({
    sessionId: session.id,
    websocketUrl: `/api/voice/connect?session=${session.id}`,
    configuration: session.config
  });
}
```

##### WebSocket Handler (`/api/voice/connect/route.ts`)
```typescript
export function GET(request: Request) {
  const { socket, response } = Deno.upgradeWebSocket(request);
  
  socket.onopen = () => initializeVoiceSession(socket);
  socket.onmessage = (event) => handleVoiceMessage(socket, event);
  socket.onclose = () => cleanupVoiceSession(socket);
  
  return response;
}
```

### 3. Voice AI Integration Layer

#### VAPI.ai Integration Service
```typescript
class VAPIService {
  private apiKey: string;
  private baseUrl: string;
  
  async createCall(config: VAPICallConfig): Promise<VAPICall>;
  async handleWebhook(payload: VAPIWebhook): Promise<void>;
  async updateCallContext(callId: string, context: RAGContext): Promise<void>;
  async endCall(callId: string): Promise<CallSummary>;
}

interface VAPICallConfig {
  voice: VoicePersona;
  model: LLMConfig;
  tools: ToolConfig[];
  context: RAGContext;
}
```

#### OpenAI Realtime Integration
```typescript
class OpenAIRealtimeService {
  private connection: WebSocket;
  private audioQueue: AudioChunk[];
  
  async connect(config: RealtimeConfig): Promise<void>;
  sendAudio(audioData: ArrayBuffer): Promise<void>;
  sendMessage(message: RealtimeMessage): Promise<void>;
  onAudioReceived(callback: (audio: ArrayBuffer) => void): void;
  onTextReceived(callback: (text: string) => void): void;
}
```

### 4. RAG System Integration

#### Voice-Optimized RAG Service
```typescript
class VoiceRAGService extends VectorSearchService {
  async getVoiceContext(query: string): Promise<VoiceContext> {
    const results = await this.searchVectors(query, {
      topK: 5,
      minSimilarityScore: 0.7,
      optimizeForSpeech: true
    });
    
    return {
      spokenContext: this.formatForSpeech(results),
      backgroundContext: results,
      suggestedResponses: this.generateSpeechResponses(results),
      sources: this.extractSources(results)
    };
  }
  
  private formatForSpeech(results: SearchResult[]): string {
    // Convert technical content to natural speech patterns
    return results
      .map(r => this.convertToSpeechFormat(r.content))
      .join('. ');
  }
}
```

#### Context Integration Pipeline
```typescript
interface VoiceContext {
  spokenContext: string;      // Optimized for natural speech
  backgroundContext: SearchResult[];  // Full technical details
  suggestedResponses: string[];       // Pre-formatted responses
  sources: SourceReference[];         // Attribution information
  conversationHistory: VoiceMessage[]; // Previous exchanges
}
```

### 5. Conversation State Management

#### Voice Session State
```typescript
interface VoiceSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  state: 'initializing' | 'active' | 'paused' | 'ended';
  
  // Audio Configuration
  audioConfig: {
    sampleRate: number;
    channels: number;
    bitrate: number;
    codec: 'opus' | 'pcm';
  };
  
  // Persona Configuration
  persona: {
    voiceId: string;
    personality: PersonalityConfig;
    responseStyle: ResponseStyle;
  };
  
  // Conversation Context
  context: {
    messages: VoiceMessage[];
    ragContext: RAGContext;
    topics: string[];
    sentiment: number;
  };
  
  // Performance Metrics
  metrics: {
    latency: number[];
    audioQuality: number;
    transcriptionAccuracy: number;
    userSatisfaction?: number;
  };
}
```

#### State Persistence Service
```typescript
class VoiceSessionManager {
  async createSession(config: SessionConfig): Promise<VoiceSession>;
  async updateSession(id: string, updates: Partial<VoiceSession>): Promise<void>;
  async getSession(id: string): Promise<VoiceSession>;
  async endSession(id: string, summary: SessionSummary): Promise<void>;
  
  // Real-time state synchronization
  async syncState(sessionId: string): Promise<VoiceSession>;
  subscribeToUpdates(sessionId: string, callback: StateUpdateCallback): void;
}
```

### 6. Error Handling and Fallbacks

#### Error Types and Handling
```typescript
enum VoiceErrorType {
  AUDIO_PERMISSION_DENIED = 'audio_permission_denied',
  MICROPHONE_NOT_AVAILABLE = 'microphone_not_available',
  NETWORK_CONNECTION_LOST = 'network_connection_lost',
  AI_SERVICE_UNAVAILABLE = 'ai_service_unavailable',
  AUDIO_QUALITY_TOO_LOW = 'audio_quality_too_low',
  TRANSCRIPTION_FAILED = 'transcription_failed',
  SYNTHESIS_FAILED = 'synthesis_failed'
}

class VoiceErrorHandler {
  async handleError(error: VoiceError): Promise<ErrorResolution> {
    switch (error.type) {
      case VoiceErrorType.AUDIO_PERMISSION_DENIED:
        return this.requestPermissions();
      
      case VoiceErrorType.AI_SERVICE_UNAVAILABLE:
        return this.fallbackToTextChat();
      
      case VoiceErrorType.NETWORK_CONNECTION_LOST:
        return this.attemptReconnection();
      
      default:
        return this.gracefulDegradation();
    }
  }
}
```

#### Fallback Strategies
1. **AI Service Fallback**: VAPI.ai → OpenAI Realtime → Text Chat
2. **Network Fallback**: WebRTC → WebSocket → Long Polling
3. **Audio Fallback**: HD Audio → Standard Audio → Text Only
4. **Processing Fallback**: Real-time → Batch Processing → Manual Processing

### 7. Real-time Audio Processing Pipeline

#### Audio Processing Flow
```
Audio Input (Microphone)
    ↓
Browser Audio Capture (WebRTC)
    ↓
Audio Encoding (Opus/PCM)
    ↓
WebSocket Transmission
    ↓
Server Audio Processing
    ↓
AI Service Integration (VAPI/OpenAI)
    ↓
Response Generation
    ↓
Audio Synthesis
    ↓
Client Audio Playback
```

#### Processing Optimization
```typescript
class AudioProcessingPipeline {
  private audioWorklet: AudioWorkletNode;
  private compressionWorker: Worker;
  
  async processAudioChunk(chunk: Float32Array): Promise<ProcessedAudio> {
    // Noise reduction
    const denoised = await this.noiseReduction(chunk);
    
    // Voice activity detection
    const hasVoice = this.detectVoiceActivity(denoised);
    if (!hasVoice) return null;
    
    // Audio enhancement
    const enhanced = this.enhanceAudio(denoised);
    
    // Compression for transmission
    const compressed = await this.compressAudio(enhanced);
    
    return {
      audio: compressed,
      metadata: {
        timestamp: Date.now(),
        duration: chunk.length / this.sampleRate,
        volume: this.calculateVolume(chunk),
        quality: this.assessQuality(enhanced)
      }
    };
  }
}
```

### 8. Performance Optimization

#### Caching Strategy
```typescript
class VoiceCache {
  // Response caching for common questions
  private responseCache = new Map<string, CachedResponse>();
  
  // Audio synthesis caching
  private audioCache = new Map<string, AudioBuffer>();
  
  // Context caching for session continuity
  private contextCache = new Map<string, RAGContext>();
  
  async getCachedResponse(query: string): Promise<CachedResponse | null>;
  async cacheAudioResponse(text: string, audio: AudioBuffer): Promise<void>;
  async preloadCommonResponses(): Promise<void>;
}
```

#### Latency Optimization
- **Audio Streaming**: Real-time audio streaming during generation
- **Predictive Loading**: Pre-load likely responses based on conversation context
- **Connection Pooling**: Maintain persistent connections to AI services
- **Edge Processing**: Use CDN edge locations for audio processing

### 9. Security and Privacy

#### Security Measures
```typescript
class VoiceSecurity {
  // Audio data encryption
  async encryptAudioData(audio: ArrayBuffer): Promise<EncryptedAudio>;
  async decryptAudioData(encrypted: EncryptedAudio): Promise<ArrayBuffer>;
  
  // Session security
  validateSession(sessionId: string, token: string): Promise<boolean>;
  generateSecureToken(): string;
  
  // Privacy protection
  anonymizeAudioMetadata(metadata: AudioMetadata): AudioMetadata;
  scheduleDataDeletion(sessionId: string, retentionPeriod: number): void;
}
```

#### Privacy Compliance
- **Data Minimization**: Only collect necessary audio data
- **Retention Policies**: Automatic deletion of audio data after specified period
- **User Consent**: Clear consent flow for voice data processing
- **Data Anonymization**: Remove identifying information from stored audio

### 10. Monitoring and Analytics

#### Performance Monitoring
```typescript
interface VoiceMetrics {
  latency: {
    audioCapture: number;
    transmission: number;
    aiProcessing: number;
    synthesis: number;
    playback: number;
    total: number;
  };
  
  quality: {
    audioInputQuality: number;
    transcriptionAccuracy: number;
    responseRelevance: number;
    voiceNaturalness: number;
  };
  
  engagement: {
    sessionDuration: number;
    messageCount: number;
    userSatisfaction: number;
    completionRate: number;
  };
}
```

#### Analytics Dashboard Integration
- Real-time voice session monitoring
- Audio quality assessment
- Conversation flow analysis
- Performance bottleneck identification
- User engagement metrics

## Implementation Dependencies

### Required Packages
```json
{
  "dependencies": {
    "@vapi-ai/web": "^1.0.0",
    "openai": "^4.0.0",
    "webrtc-adapter": "^8.2.3",
    "opus-media-recorder": "^0.8.0",
    "audio-worklet-polyfill": "^1.0.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "@types/webrtc": "^0.0.0"
  }
}
```

### Environment Variables
```env
# VAPI.ai Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_webhook_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview

# Audio Configuration
AUDIO_SAMPLE_RATE=24000
AUDIO_CHANNELS=1
AUDIO_BITRATE=64000

# Security
VOICE_SESSION_SECRET=your_session_secret
AUDIO_ENCRYPTION_KEY=your_encryption_key
```

## Deployment Considerations

### Infrastructure Requirements
- **Compute**: Real-time audio processing requires low-latency compute
- **Storage**: Temporary audio file storage for processing
- **Network**: High-bandwidth, low-latency network connections
- **CDN**: Global distribution for optimal voice experience

### Scalability Planning
- **Auto-scaling**: Dynamic scaling based on concurrent voice sessions
- **Load Balancing**: Distribute voice processing across multiple instances
- **Regional Deployment**: Deploy closer to users for reduced latency
- **Resource Monitoring**: Monitor CPU, memory, and network usage patterns