"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "./auth-context"
import { X } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = "email" | "verification" | "profile"

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const { sendVerificationCode, verifyCode } = useAuth()
  const { toast } = useToast()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/auth/check-user?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      setIsNewUser(!data.exists)

      if (!data.exists) {
        setStep("profile")
      } else {
        await sendVerificationCode(email)
        setStep("verification")
        toast({
          title: "Verification code sent",
          description: "Please check your email for the verification code",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendVerificationCode(email, fullName, phoneNumber)
      setStep("verification")
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await verifyCode(email, code)
      toast({
        title: isNewUser ? "Account created" : "Welcome back!",
        description: isNewUser ? "Your account has been created successfully" : "You have been logged in successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Register or Sign In</h2>
        <p className="text-base text-muted-foreground mt-2">
          Join 10 million+ Canadians searching for homes on Real Group each month.
        </p>
      </div>

      <ul className="space-y-2 text-sm">
        <li>• Faster listings than REALTOR.ca®</li>
        <li>• See 27% more homes & sold history</li>
        <li>• Instant access to photos & features</li>
        <li>• Save searches & homes across devices</li>
      </ul>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Learn more by viewing our{" "}
            <a href="#" className="underline">
              privacy policy
            </a>{" "}
            or{" "}
            <a href="#" className="underline">
              contact us
            </a>
            .
          </p>
        </div>
        <Button type="submit" className="w-full bg-black" disabled={isLoading}>
          {isLoading ? "Processing..." : "Show me the photos!"}
        </Button>
      </form>
    </div>
  )

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-base text-muted-foreground mt-2">Please provide your details to complete registration.</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <Button type="submit" className="w-full bg-black" disabled={isLoading}>
          {isLoading ? "Sending code..." : "Continue"}
        </Button>
      </form>
    </div>
  )

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enter Verification Code</h2>
        <p className="text-base text-muted-foreground mt-2">We sent a verification code to {email}</p>
      </div>

      <form onSubmit={handleVerificationSubmit} className="space-y-4">
        <Input placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <Button variant="link" className="w-full bg-black" onClick={() => setStep("email")} disabled={isLoading}>
        Use a different email
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {step === "email" && renderEmailStep()}
        {step === "profile" && renderProfileStep()}
        {step === "verification" && renderVerificationStep()}
      </DialogContent>
    </Dialog>
  )
}

