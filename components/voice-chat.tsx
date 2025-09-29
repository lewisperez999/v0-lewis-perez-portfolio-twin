"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import useOpenAIRealtime from "@/hooks/use-openai-realtime";
import { Conversation } from "@/lib/types/conversation";

interface VoiceChatProps {
  voice?: string;
  className?: string;
}

export function VoiceChat({ voice = "alloy", className = "" }: VoiceChatProps) {
  const {
    status,
    isSessionActive,
    audioIndicatorRef,
    handleStartStopClick,
    conversation,
    currentVolume,
  } = useOpenAIRealtime(voice);

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
    <div className={`flex flex-col h-full max-h-[600px] ${className}`}>
      {/* Header with Status */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium">
            {isSessionActive ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Volume indicator */}
          {isSessionActive && (
            <div className="flex items-center gap-1">
              {currentVolume > 0.1 ? (
                <Volume2 className="w-4 h-4 text-green-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
              <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${Math.min(currentVolume * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground">{status}</p>
        </div>
      )}

      {/* Conversation Area */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4">
          {conversation.length === 0 && !isSessionActive && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Click the microphone button to start a voice conversation with Lewis's AI assistant.
              </p>
            </div>
          )}
          
          {conversation.map((msg, index) => (
            <div
              key={`${msg.id}-${index}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {msg.role === "user" ? "You" : "Lewis's AI"}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(msg.timestamp)}
                  </span>
                  {!msg.isFinal && (
                    <Badge variant="secondary" className="text-xs">
                      {msg.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed">
                  {msg.text || (msg.status === "speaking" ? "Speaking..." : "Processing...")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Controls */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-center gap-4">
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
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-primary hover:bg-primary/90'
            } transition-all duration-200 flex items-center gap-2 relative px-8`}
            onClick={handleStartStopClick}
          >
            {isSessionActive && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 animate-pulse bg-red-100 text-red-700 text-xs px-1 py-0"
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
              <div className="absolute inset-0 rounded-md border-2 border-red-400 animate-ping pointer-events-none opacity-50"></div>
            )}
          </Button>
        </div>
        
        {/* Instructions */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          {isSessionActive 
            ? "Speak naturally - the AI will respond when you pause"
            : "Start a voice conversation to learn about Lewis's experience and skills"
          }
        </p>
      </div>
    </div>
  );
}