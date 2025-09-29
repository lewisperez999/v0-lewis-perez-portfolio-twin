import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff } from "lucide-react"

interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => void
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
}

export function BroadcastButton({ 
  isSessionActive, 
  onClick, 
  className = "",
  size = "default",
  disabled = false
}: BroadcastButtonProps) {
  return (
    <Button
      variant={isSessionActive ? "destructive" : "default"}
      size={size}
      className={`${className} ${
        isSessionActive 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-primary hover:bg-primary/90'
      } transition-all duration-200 flex items-center justify-center gap-2 relative`}
      onClick={onClick}
      disabled={disabled}
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
  )
}

interface MicrophoneButtonProps {
  isListening: boolean
  onClick: () => void
  className?: string
  size?: "default" | "sm" | "lg"
  disabled?: boolean
}

export function MicrophoneButton({ 
  isListening, 
  onClick, 
  className = "",
  size = "lg",
  disabled = false
}: MicrophoneButtonProps) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={size}
        onClick={onClick}
        disabled={disabled}
        className={`${className} ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-primary hover:bg-primary/90'
        } w-20 h-20 rounded-full p-0 transition-all duration-200 hover:scale-105`}
      >
        {isListening ? (
          <MicOff className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </Button>
      
      {isListening && (
        <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping pointer-events-none"></div>
      )}
    </div>
  )
}