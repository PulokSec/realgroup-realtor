import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactForm } from "@/components/contact-form"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-12">
        <div className="grid md:grid-cols-2 gap-24 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">About Real Group</h1>
            <div className="prose max-w-none">
              <p className="mt-3">
                Hi! I&apos;m Real Group, a dedicated realtor in Surrey with a passion for helping people find their
                perfect home. With years of experience in the local real estate market, I understand that buying or
                selling a property is one of life&apos;s biggest decisions.
              </p>
              <p className="mt-3">
                My approach combines in-depth market knowledge with personalized service. Whether you&apos;re a
                first-time buyer, looking to upgrade, or selling your property, I&apos;m here to guide you through every
                step of the process.
              </p>
              <p className="mt-3">
                As part of the Real Group Realty team, I have access to extensive resources and a network of
                professionals to ensure your real estate journey is smooth and successful. I believe in building lasting
                relationships with my clients through trust, transparency, and dedication to their needs.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/40 blur-lg"></div> */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg h-[400px]">
              <Image
                src="/assets/eric-ardito-wLZCGX6z5lc-unsplash-e1712100020186.jpg"
                alt="Real Estate"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-24 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Have a Question?</h2>
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

