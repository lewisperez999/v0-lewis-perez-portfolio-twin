'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { generateAIResponse, getSuggestedQuestions, Message } from '@/app/actions/chat'
import { MessageCircle, Send, Bot, User, Sparkles, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage extends Message {
  isLoading?: boolean
  sources?: Array<{
    id: string
    title: string
    type: string
    relevanceScore: number
  }>
}

interface AIChatProps {
  className?: string
}

export function AIChat({ className }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    // Only scroll if we have messages and the chat has been interacted with
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Lazy load suggested questions when user interacts
  const loadSuggestionsLazy = async () => {
    if (suggestionsLoaded || loadingSuggestions) return
    
    setLoadingSuggestions(true)
    try {
      const questions = await getSuggestedQuestions()
      setSuggestedQuestions(questions)
      setSuggestionsLoaded(true)
    } catch (error) {
      console.error('Failed to load suggested questions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm Lewis Perez, Senior Software Engineer. Feel free to ask me about my experience, skills, projects, or anything related to my professional background. What would you like to know?",
        timestamp: new Date()
      }])
    }
  }, [messages.length])

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim()
    if (!userMessage || isLoading) return

    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessageObj])
    setInput('')
    setIsLoading(true)
    setShowSuggestions(false)

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Thinking...',
      isLoading: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await generateAIResponse(userMessage, messages)
      
      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.isLoading 
          ? {
              ...msg,
              content: response.response,
              isLoading: false,
              sources: response.sources
            }
          : msg
      ))
    } catch (error) {
      console.error('Failed to generate response:', error)
      
      // Replace loading message with error
      setMessages(prev => prev.map(msg => 
        msg.isLoading 
          ? {
              ...msg,
              content: "I apologize, but I'm having trouble responding right now. Please try asking your question again.",
              isLoading: false
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Lewis
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto px-6">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <div className={cn(
                    "flex gap-3 max-w-[80%]",
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0",
                      message.role === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-green-600'
                    )}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    
                    <div className={cn(
                      "rounded-lg px-4 py-2 text-sm break-words overflow-wrap-anywhere min-w-0",
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    )}>
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-muted-foreground">Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere word-break-break-all">{message.content}</div>
                      )}
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="text-xs text-muted-foreground mb-2 font-medium">
                            Sources:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source) => (
                              <Badge 
                                key={source.id}
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted/50"
                                title={`Relevance: ${(source.relevanceScore * 100).toFixed(1)}%`}
                              >
                                <ExternalLink className="h-2 w-2 mr-1" />
                                {source.type}: {source.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
        
        {showSuggestions && (suggestedQuestions.length > 0 || loadingSuggestions) && (
          <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
            <div className="text-sm text-muted-foreground mb-3 font-medium">
              Suggested questions:
            </div>
            {loadingSuggestions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto p-3 text-xs leading-relaxed justify-start whitespace-normal hover:text-foreground"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="p-6 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={loadSuggestionsLazy}
              placeholder="Ask me about my experience, skills, or projects..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send • This AI is trained on Lewis Perez&apos;s professional background
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
