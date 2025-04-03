import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SectionHeading } from "@/components/section-heading"

export default function AspenRidgePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight">
                Navigate the Aspen Ridge Real Estate Market with Real Group
              </h1>
              <Button className="group bg-black">
                Book a Consultation{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <div>
              <p className="text-muted-foreground">
                Buying a home in Aspen Ridge can be challenging, especially if you're unfamiliar with the area. As the
                Aspen Ridge real estate market and a realtor who's navigating this community of Surrey, I can provide
                you with personalized advice so you can confidently access the best properties in this neighborhood.
                Contact me today and let's make your dream home in Aspen Ridge a reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-8">
        <div className="container">
          <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            <Image
              src="/assets/surrey-condos.jpg"
              alt="Modern living room in Aspen Ridge"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Aspen Ridge Housing Options */}
      <section className="py-16 bg-black text-white">
        <div className="container">
          <SectionHeading label="OPTIONS" title="Aspen Ridge Housing Options" darkMode={true} />

          <div className="mb-12">
            <p className="text-gray-300 mb-6">
              Aspen Ridge offers a variety of housing options, including single-family homes, townhouses, and condos.
              All properties feature modern designs with high-quality finishes and spacious layouts. Approximately 80%
              of residences are single-family homes, with the rest being a mix of townhouses and condos. The
              neighborhood continues to grow with new developments.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Aspen Ridge Real Estate</h3>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h4 className="text-gray-400 mb-2">Average Price</h4>
                <p className="text-2xl font-bold">$899,000</p>
              </div>
              <div>
                <h4 className="text-gray-400 mb-2">Lowest Price</h4>
                <p className="text-2xl font-bold">$437,000</p>
              </div>
              <div>
                <h4 className="text-gray-400 mb-2">Highest Price</h4>
                <p className="text-2xl font-bold">$1,380,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Listings */}
      <section className="py-16">
        <div className="container">
          <SectionHeading label="LISTINGS" title="Available Listings" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="group overflow-hidden rounded-lg border shadow-sm">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={`/assets/call-image.jpg?height=400&width=600&text=Property ${item}`}
                    alt={`Property ${item}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">123 Aspen Ridge Drive</h3>
                  <p className="text-sm text-muted-foreground">4 bed · 3 bath · 2,400 sqft</p>
                  <p className="font-bold mt-2">$749,000</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="group">
              View All Listings <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Aspen Ridge */}
      <section className="py-16">
        <div className="container">
          <SectionHeading
            label="WHY CHOOSE ASPEN RIDGE"
            title="Why Aspen Ridge, Surrey, Is an Ideal Place to Buy a Home"
          />

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-muted-foreground mb-8">
                Aspen Ridge offers a blend of convenience, natural beauty, and modern amenities, making it an excellent
                choice for families, professionals, and retirees alike. It's quiet and safe with easy access to
                everything you need.
              </p>
              <Button variant="outline" className="group">
                Get More Details <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="relative h-[400px] overflow-hidden rounded-lg">
              <Image
                src="/assets/campaign-creators-e6n7uoEnYbA-unsplash.jpg?height=800&width=600"
                alt="Modern home in Aspen Ridge"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-12">
            <div className="relative h-[400px] overflow-hidden rounded-lg">
              <Image
                src="/assets/dylan-gillis-KdeqA3aTnBY-unsplash.jpg?height=800&width=600"
                alt="Modern architecture in Aspen Ridge"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <button className="w-full flex items-center justify-between">
                  <h3 className="text-lg font-bold">Transportation</h3>
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <div className="border-b pb-4">
                <button className="w-full flex items-center justify-between">
                  <h3 className="text-lg font-bold">Services and Facilities</h3>
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <div className="border-b pb-4">
                <button className="w-full flex items-center justify-between">
                  <h3 className="text-lg font-bold">Parks and Recreation</h3>
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <div className="border-b pb-4">
                <button className="w-full flex items-center justify-between">
                  <h3 className="text-lg font-bold">Educational Institutions</h3>
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container">
          <SectionHeading label="CONTACT" title="Get Your Dream Home in Aspen Ridge with Real Group" darkMode={true} />

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-300 mb-6">
                Find your dream home in Aspen Ridge with confidence. With extensive knowledge of the Aspen Ridge real
                estate market and years of experience, I will help find the perfect home for you and your family.
                Whether you're looking to buy, sell, or invest in Aspen Ridge, I'm committed to providing a seamless
                experience. Contact me today to schedule a consultation and take the first step toward your dream home
                in Aspen Ridge.
              </p>
              <Button className="group bg-white text-black hover:bg-white/90">
                Contact Real Group Today{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="relative h-[300px] overflow-hidden rounded-lg">
              <Image
                src="/assets/properties.jpg?height=600&width=800"
                alt="Aspen Ridge home exterior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter darkMode={false} />
    </div>
  )
}

