import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/Home-about.png"
            alt="Modern building in Surrey"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent mix-blend-overlay"></div>
        </div>
        <div className="container relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Real Group- Your Trusted Realtor in Surrey
            </h1>
            <p className="text-lg text-white max-w-md">
              Buying a house in Surrey might seem hard and complicated, but you don't have to worry about this
              anymore because I am here to help.
            </p>
            <p className="text-lg text-gray-800">
              Reach out to me today and I will help you navigate the Surrey real estate market to buy or sell your
              home at the best price!
            </p>
            <Button className="group text-md px-6 py-6 bg-black">
              Schedule a Call <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/40 blur-md"></div>
            <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
              <Image
                src="/assets/eric-ardito-wLZCGX6z5lc-unsplash-e1712100020186.jpg"
                alt="Real Estate"
                width={400}
                height={600}
                className="w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="font-bold text-center">Your Real Group Real Estate Agent</h3>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-phone"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span className="text-sm">0177-288-3296</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-mail"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    <span className="text-xs">REALESTATE@GMAIL.COM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              I'm Real Estate, an experienced executive realtor in Surrey
            </h2>
            <p className="text-lg text-muted-foreground">
              Partnering with Real Group Realty, I provide tailored real estate solutions designed to meet your unique
              needs. Whether you're buying your first home, upgrading, or selling, I'm here to simplify the process and
              guide you every step of the way.
            </p>
            <p className="text-lg text-muted-foreground">
              With in-depth market knowledge and a commitment to exceptional service, I aim to make your real estate
              journey as smooth and rewarding as possible. Let's work together to find your perfect home in Surrey!
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">SERVICES</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight">My Surrey Real Estate Services</h3>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
              Buying or selling a home can be a tricky task, but I'm here to help you every step of the way. As an
              accredited Surrey realtor, I can assist you in the process of buying or selling your house.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <h3 className="text-xl font-bold">Buying A House In Surrey</h3>
                <p className="mt-2 text-muted-foreground">
                  I'll guide you through the entire home buying process, from search to closing.
                </p>
                <div className="mt-4 flex items-center text-primary">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <h3 className="text-xl font-bold">Selling Your Property</h3>
                <p className="mt-2 text-muted-foreground">
                  Maximize your home's value with strategic pricing, marketing, and negotiation.
                </p>
                <div className="mt-4 flex items-center text-primary">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <h3 className="text-xl font-bold">Market Analysis</h3>
                <p className="mt-2 text-muted-foreground">
                  Get detailed insights into Surrey's real estate market trends and property values.
                </p>
                <div className="mt-4 flex items-center text-primary">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me Section */}
      <section className="py-16 bg-black text-primary-foreground">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider">WHY CHOOSE ME</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight">Why Partner With Me & Real Group Realty?</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold">Honesty</h4>
                  <ChevronDown className="h-5 w-5" />
                </div>
                <p>
                  Working with me is like having a guide by your side who has all the resources of Real Group Realty
                  Surrey available for you.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold">Guidance on Financing Options</h4>
                  <ChevronDown className="h-5 w-5" />
                </div>
                <p>
                  I can connect you with trusted professionals and give you advice on mortgage and financing as well.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold">Professional Network of Experts</h4>
                  <ChevronDown className="h-5 w-5" />
                </div>
                <p>
                  I know the ins and outs of the Surrey real estate market and I have a vast array of partners to
                  help me.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold">Strong Negotiation Skills</h4>
                  <ChevronDown className="h-5 w-5" />
                </div>
                <p>I'll work tirelessly to get you the best possible deal, whether buying or selling.</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button className="group text-lg px-8 py-6 bg-white text-black hover:bg-white/90">
                Book A Consultation{" "}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">NEIGHBORHOODS</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight">Surrey's Real Estate Market</h3>
            <p className="mt-4 mx-auto max-w-3xl text-lg text-muted-foreground">
              Navigate the Surrey real estate market and uncover diverse neighborhoods, each with its own appeal and
              personality. From lively arts hubs to family-friendly amenities there's a place for everyone. Let's find
              together where you will want to buy your home in Surrey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                name: "Nutana",
                description: "A lively neighborhood blending old charm with modern family-friendly amenities.",
              },
              {
                name: "Sutherland",
                description: "A quiet, connected neighborhood with easy access to schools and parks.",
              },
              {
                name: "Stonebridge",
                description: "Modern living with new homes and convenient shopping options.",
              },
              {
                name: "Riversdale",
                description: "A vibrant community known for its creative arts and cultural energy.",
              },
              {
                name: "Willowgrove",
                description: "Family-friendly area with great schools and peaceful park spaces.",
              },
              {
                name: "Lawson Heights",
                description: "Scenic neighborhood with beautiful river views and lots of recreational spots.",
              },
              {
                name: "Evergreen",
                description: "Nature-focused community with new homes and plenty of green spaces.",
              },
              {
                name: "Silverspring",
                description: "Quiet, family-oriented neighborhood with excellent schools and easy access to amenities.",
              },
            ].map((neighborhood, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold">{neighborhood.name}</h3>
                  <p className="mt-2 text-muted-foreground">{neighborhood.description}</p>
                  <div className="mt-4 flex items-center text-primary">
                    <span className="text-sm font-medium">View listings</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Contact Me To Sell Or Buy Your House Easily</h2>
            <p className="text-lg text-muted-foreground">
              If you need to find the best realtor in Surrey, you should choose one who cares about you and your
              needs.
            </p>
            <p className="text-lg">
              Give me a call, I'm your caring real estate agent in Surrey and I will make your home buying or selling
              experience easy and stress-free. Get in touch now and let's make your real estate dreams come true!
            </p>
            <Button className="group text-md px-6 py-6 bg-black">
              Partner With Me <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

