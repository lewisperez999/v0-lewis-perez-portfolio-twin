"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-blue-500/10"></div>
      <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to work together? Let&apos;s discuss your next project
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="glass dark:glass-dark border-border dark:border-white/10 hover-glow animate-fade-in">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
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
                  />
                </div>
                <Button type="submit" className="w-full glow-primary hover-glow bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 text-white font-semibold" disabled={isSubmitting}>
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
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} className="font-medium hover:text-primary transition-colors">
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

            <Card>
              <CardHeader>
                <CardTitle>Follow Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors group"
                    >
                      <social.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Ready to collaborate?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I&apos;m always open to discussing new opportunities and interesting projects.
                </p>
                <Button variant="outline" className="group bg-transparent">
                  <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
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
