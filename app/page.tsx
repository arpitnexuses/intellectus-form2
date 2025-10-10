"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function InternshipPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const formData = new FormData()
      const form = e.currentTarget
      
      // Get form values
      const firstName = (form.querySelector('#firstName') as HTMLInputElement)?.value?.trim()
      const lastName = (form.querySelector('#lastName') as HTMLInputElement)?.value?.trim()
      const email = (form.querySelector('#email') as HTMLInputElement)?.value?.trim()
      const phone = (form.querySelector('#phone') as HTMLInputElement)?.value?.trim()
      const message = (form.querySelector('#message') as HTMLTextAreaElement)?.value?.trim()

      // Client-side validation
      if (!firstName || !lastName || !email || !phone || !message) {
        setSubmitStatus('error')
        setErrorMessage('All fields are required')
        setIsSubmitting(false)
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setSubmitStatus('error')
        setErrorMessage('Please enter a valid email address')
        setIsSubmitting(false)
        return
      }

      // Phone validation (basic)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        setSubmitStatus('error')
        setErrorMessage('Please enter a valid phone number')
        setIsSubmitting(false)
        return
      }

      // File validation
      if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
        setSubmitStatus('error')
        setErrorMessage('File size must be less than 10MB')
        setIsSubmitting(false)
        return
      }

      // Add form data
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('message', message)
      
      // Add file if selected
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        // Reset form
        form.reset()
        setFile(null)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'An error occurred')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:px-12">
        {/* Left Content Section */}
        <div className="space-y-8">
          <div>
            <h1 className="mb-8 text-5xl font-bold text-foreground">Our internship Program</h1>
          </div>

          <div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Our internship opportunities are aimed at high-performing university students and postgraduates
                interested in a career in investment banking. At Intellectus Capital, you will gain direct exposure to
                M&A and corporate advisory through intensive, hands-on work that builds technical and commercial skills.
              </p>
              <p>
                From day one, you will work on live transactions and gain direct experience in financial analysis,
                modelling, and deal execution. Working closely with our Managing Director and senior team, you will
                experience the pace and intensity of real advisory work. We recruit interns on a rolling basis and
                encourage early applications.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-foreground">Purpose</h3>
            <p className="text-muted-foreground">
              The internship gives you the chance to explore the world of corporate finance, understand the work we do,
              and accelerate your career ambitions. It is also our way of getting to know the next generation of
              talented professionals who may go on to become future leaders of the firm. Along the way, you will build
              lasting connections with peers and colleagues.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-foreground">Training and Development</h3>
            <p className="text-muted-foreground">
              You will receive training in financial modelling, valuation and deal execution, combined with one-on-one
              mentoring from senior professionals. Throughout your time with us, you will be supported with feedback,
              guidance and opportunities to develop both technical expertise and professional confidence.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-foreground">What We Look For</h3>
            <p className="text-muted-foreground">
              We welcome applicants from finance, law, technology, humanities and other disciplines. Strong analytical
              skills, curiosity and ambition are essential. Academic excellence is highly valued, alongside critical
              thinking, clear communication and the ability to work well in a team.
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:pt-32">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-xl text-foreground">
              To apply, please complete the form below and attach your CV and Cover Letter.
            </h2>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <p>Application submitted successfully! We'll get back to you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-medium uppercase text-muted-foreground">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="First name" className="border-input bg-background" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-medium uppercase text-muted-foreground">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Last name" className="border-input bg-background" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  className="border-input bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-medium uppercase text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  className="border-input bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-medium uppercase text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Write a cover letter or upload"
                  className="min-h-[200px] resize-none border-input bg-background"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="bg-[#4285f4] text-white hover:bg-[#3367d6]"
                  >
                    Choose a file
                  </Button>
                  {file && <p className="mt-2 text-sm text-muted-foreground">Selected: {file.name}</p>}
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
