"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Github, Linkedin, Send, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load Calendly widget script
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="calendly.com"]')
    if (existingScript) {
      console.log('Calendly script already loaded')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.onload = () => {
      console.log('Calendly script loaded successfully')
    }
    script.onerror = () => {
      console.error('Failed to load Calendly script')
    }
    document.head.appendChild(script)

    // Also add Calendly CSS
    const link = document.createElement('link')
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const openCalendly = () => {
    console.log('Button clicked, checking for Calendly...')
    // Type assertion for Calendly
    const calendly = (window as any).Calendly
    
    console.log('Calendly object:', calendly)
    
    if (calendly && typeof calendly.initPopupWidget === 'function') {
      console.log('Opening Calendly popup...')
      calendly.initPopupWidget({
        url: 'https://calendly.com/lewisperez12152017/30min'
      })
      return true
    } else {
      console.error('Calendly script not loaded yet or initPopupWidget not available')
      toast.error('Calendly is loading', {
        description: 'Please try again in a moment.',
        duration: 3000,
      })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Show loading toast
    const loadingToast = toast.loading('Sending your message...', {
      description: 'Please wait while we process your request.',
    })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success('Message sent successfully!', {
          description: 'Thank you for your message. I will get back to you soon.',
          duration: 5000,
        })
        // Reset form on success
        setFormData({ name: '', email: '', message: '' })
      } else {
        toast.error('Failed to send message', {
          description: result.message || 'Please try again or contact me directly.',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "lewisperez12152017@gmail.com",
      href: "mailto:lewisperez12152017@gmail.com",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Melbourne, VIC, Australia",
      href: null,
    },
  ]

  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/lewisperez999",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/in/lewisperez",
    },
    
  ]

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-blue-500/10"></div>
        {/* Diagonal elements */}
        <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[100%] bg-gradient-to-bl from-pink-500/6 via-purple-500/4 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[50%] h-[80%] bg-gradient-to-tr from-blue-500/6 via-cyan-500/4 to-transparent -rotate-12 transform-gpu"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Decorative dots */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-pink-400/60 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-purple-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6 animate-fade-in-up">
            <MessageSquare className="w-4 h-4 text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Let&apos;s Connect</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-animated">Get In Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Ready to work together? Let&apos;s discuss your next project
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="glass dark:glass-dark border-border dark:border-white/10 hover-glow animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-xl gradient-text">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input 
                    name="name" 
                    placeholder="Your Name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    disabled={isSubmitting}
                    required 
                    className="bg-white/50 dark:bg-white/5 border-border dark:border-white/10 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="bg-white/50 dark:bg-white/5 border-border dark:border-white/10 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                    className="bg-white/50 dark:bg-white/5 border-border dark:border-white/10 focus:border-blue-500 transition-colors"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full glow-primary hover-glow bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 text-white font-semibold transition-all duration-300 hover:scale-[1.02]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="text-xl gradient-text">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 group-hover:scale-110">
                      <info.icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} className="font-medium hover:gradient-text transition-all duration-300">
                          {info.value}
                        </a>
                      ) : (
                        <p className="font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-xl gradient-text">Follow Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group hover:scale-110 animate-border-glow"
                    >
                      <social.icon className="h-6 w-6 text-blue-500 dark:text-blue-400 group-hover:text-purple-500 transition-colors duration-300" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass dark:glass-dark border-border dark:border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 hover-glow transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2 gradient-text">Ready to collaborate?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I&apos;m always open to discussing new opportunities and interesting projects.
                </p>
                <Button 
                  variant="outline" 
                  className="group bg-transparent border-blue-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 hover:scale-105"
                  onClick={(e) => {
                    e.preventDefault()
                    const success = openCalendly()
                    // Fallback to direct link if popup fails
                    if (!success) {
                      setTimeout(() => {
                        window.open('https://calendly.com/lewisperez12152017', '_blank')
                      }, 1000)
                    }
                  }}
                >
                  <Mail className="mr-2 h-4 w-4 group-hover:text-purple-500 transition-colors" />
                  Schedule a Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
