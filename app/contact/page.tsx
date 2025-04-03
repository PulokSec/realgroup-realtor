import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactForm } from "@/components/contact-form"

export default function ConatctPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-12">
        <div className="mt-24 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Conatct Us</h2>
            <p className="text-muted-foreground mt-2">
              I&apos;m here to help! Fill out the form below and I&apos;ll get back to you as soon as possible.
            </p>
          </div>
          <ContactForm />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

