"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import useOpenAIRealtime from "@/hooks/use-openai-realtime";
import { realtimeTools } from "@/lib/realtime-tools";
import { Conversation } from "@/lib/types/conversation";
import { useUser } from "@clerk/nextjs";

interface VoiceChatProps {
  voice?: string;
  className?: string;
}

export function VoiceChat({ voice = "alloy", className = "" }: VoiceChatProps) {
  const { user } = useUser();
  const {
    status,
    isSessionActive,
    audioIndicatorRef,
    handleStartStopClick,
    conversation,
    currentVolume,
  } = useOpenAIRealtime(voice, realtimeTools, user?.firstName || undefined);

  const [isMuted, setIsMuted] = useState(false);

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get status color based on session state
  const getStatusColor = () => {
    if (isSessionActive) return "bg-green-500";
    if (status.includes("Error")) return "bg-red-500";
    if (status.includes("Requesting") || status.includes("Fetching") || status.includes("Establishing")) {
      return "bg-yellow-500";
    }
    return "bg-gray-500";
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Status */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-lg ${isSessionActive ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-semibold text-white">
            {isSessionActive ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Volume indicator */}
          {isSessionActive && (
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              {currentVolume > 0.1 ? (
                <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/70" />
              )}
              <div className="w-12 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                  style={{ width: `${Math.min(currentVolume * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className="px-6 py-3 bg-muted/30 shrink-0">
          <p className="text-sm text-white/90 font-medium">{status}</p>
        </div>
      )}

      {/* Conversation Area */}
      <div className="flex-1 overflow-hidden px-6">
        <ScrollArea className="h-full py-4">
          <div className="space-y-4 pr-4">
            {conversation.length === 0 && !isSessionActive && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-white/90 leading-relaxed">
                    {user?.firstName 
                      ? `Hi ${user.firstName}! Click the microphone button below to start a voice conversation with Lewis's AI assistant.`
                      : "Click the microphone button below to start a voice conversation with Lewis's AI assistant."
                    }
                  </p>
                </div>
              </div>
            )}
            
            {conversation.map((msg, index) => (
              <div
                key={`${msg.id}-${index}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-muted/80 backdrop-blur-sm border border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-semibold ${
                      msg.role === "user" ? "text-white/90" : "text-white/90"
                    }`}>
                      {msg.role === "user" ? "You" : "Lewis's AI"}
                    </span>
                    <span className={`text-xs ${
                      msg.role === "user" ? "text-white/70" : "text-white/60"
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {!msg.isFinal && (
                      <Badge variant="secondary" className="text-xs py-0 h-5">
                        {msg.status}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    msg.role === "user" ? "text-white" : "text-white"
                  }`}>
                    {msg.text || (msg.status === "speaking" ? "Speaking..." : "Processing...")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Controls */}
      <div className="p-6 pt-4 border-t border-border/50 bg-muted/20 shrink-0">
        <div className="flex flex-col items-center gap-4">
          {/* Audio Visualization Indicator (hidden but referenced by hook) */}
          <div
            ref={audioIndicatorRef}
            className="hidden"
          />
          
          {/* Main Voice Button */}
          <Button
            variant={isSessionActive ? "destructive" : "default"}
            size="lg"
            className={`${
              isSessionActive 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/50'
            } transition-all duration-300 flex items-center gap-3 relative px-10 py-6 text-base font-semibold rounded-xl`}
            onClick={handleStartStopClick}
          >
            {isSessionActive && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 animate-pulse bg-red-100 text-red-700 text-xs px-2 py-1 font-bold shadow-md"
              >
                LIVE
              </Badge>
            )}
            
            {isSessionActive ? (
              <>
                <MicOff className="h-5 w-5" />
                End Voice Chat
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Voice Chat
              </>
            )}
            
            {isSessionActive && (
              <div className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping pointer-events-none opacity-50"></div>
            )}
          </Button>
          
          {/* Instructions */}
          <div className="text-center space-y-1">
            <p className="text-sm text-white/90 font-medium">
              {isSessionActive 
                ? "🎤 Speak naturally - the AI will respond when you pause"
                : "💬 Start a voice conversation to learn about Lewis's experience and skills"
              }
            </p>
            {isSessionActive && (
              <p className="text-xs text-white/70">
                The AI can hear you and will respond with voice
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}