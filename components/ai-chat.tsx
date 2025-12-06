'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { generateAIResponse, getSuggestedQuestions, Message } from '@/app/actions/chat'
import { MessageCircle, Send, Bot, User, Sparkles, ExternalLink, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'

interface ChatMessage extends Message {
  isLoading?: boolean
  sources?: Array<{
    id: string
    title: string
    type: string
    relevanceScore: number
  }>
  toolCalls?: Array<{
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
  }>
}

interface AIChatProps {
  className?: string
}

export function AIChat({ className }: AIChatProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get user's first name for personalization
  const userName = user?.firstName || undefined

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
      const response = await generateAIResponse(userMessage, messages, undefined, { userName })
      
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
    <section id="ai-chat" className="py-24 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>
        {/* Diagonal elements */}
        <div className="absolute -top-1/4 -right-1/4 w-[70%] h-[120%] bg-gradient-to-bl from-blue-500/8 via-purple-500/5 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[100%] bg-gradient-to-tr from-cyan-500/6 via-blue-500/4 to-transparent -rotate-12 transform-gpu"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.5s' }}></div>
      
      {/* Decorative dots */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-blue-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-6 animate-fade-in-up">
            <Brain className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">AI-Powered Assistant</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-animated">Chat with My AI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Ask me anything about my experience, skills, and projects
          </p>
        </div>

        {/* Chat Card */}
        <Card className={cn(
          "w-full max-w-4xl mx-auto h-[650px] flex flex-col glass dark:glass-dark border-border dark:border-white/10 hover-glow animate-fade-in-up",
          className
        )} style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-4 shrink-0 border-b border-border/50">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center animate-border-glow">
                <MessageCircle className="h-5 w-5 text-cyan-500" />
              </div>
              <span className="gradient-text">Chat with Lewis</span>
              <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/30 text-cyan-700 dark:text-cyan-300">
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
                          "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-medium shrink-0 transition-all duration-300",
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' 
                            : 'bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/25 animate-border-glow'
                        )}>
                          {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                        </div>
                        
                        <div className={cn(
                          "rounded-2xl px-5 py-3 text-sm break-words overflow-wrap-anywhere min-w-0 transition-all duration-300",
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-border/50 dark:border-white/10 shadow-lg'
                        )}>
                          {message.isLoading ? (
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                              </div>
                              <span className="text-muted-foreground">Thinking...</span>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere word-break-break-all leading-relaxed">{message.content}</div>
                          )}
                          
                          {message.toolCalls && message.toolCalls.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <div className="text-xs text-muted-foreground mb-2 font-medium">
                                🛠️ Tools Used:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.toolCalls.map((toolCall, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                                    {toolCall.toolName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <div className="text-xs text-muted-foreground mb-2 font-medium">
                                📚 Sources:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.sources.map((source) => (
                                  <Badge 
                                    key={source.id}
                                    variant="outline" 
                                    className="text-xs cursor-pointer bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
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
              <div className="px-6 py-4 border-t border-border/50 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 shrink-0">
                <div className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  Suggested questions:
                </div>
                {loadingSuggestions ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left h-auto p-4 text-xs leading-relaxed justify-start whitespace-normal bg-white/50 dark:bg-white/5 border-border/50 dark:border-white/10 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02] rounded-xl"
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
            
            <div className="p-6 border-t border-border/50 shrink-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={loadSuggestionsLazy}
                  placeholder="Ask me about my experience, skills, or projects..."
                  disabled={isLoading}
                  className="flex-1 bg-white/50 dark:bg-white/5 border-border/50 dark:border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300 rounded-xl h-12"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Press Enter to send • This AI is trained on Lewis Perez&apos;s professional background
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
