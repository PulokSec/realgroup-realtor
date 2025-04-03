import Link from "next/link"
import { Phone, Mail, Facebook, Instagram, Linkedin, Github } from "lucide-react"
import Image from "next/image"

interface SiteFooterProps {
  darkMode?: boolean
}

export function SiteFooter({ darkMode = false }: SiteFooterProps) {
  const bgColor = darkMode ? "bg-gray-900" : "bg-black"
  const textColor = "text-gray-100"
  const mutedTextColor = darkMode ? "text-gray-400" : "text-gray-400"
  const borderColor = darkMode ? "border-gray-800" : "border-gray-800"

  return (
    <footer className={`${bgColor} ${textColor} py-12`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/favicon.ico" width={30} height={30} alt="Logo" className="h-10 w-10" />
              <div>
                <div className="text-xs">REAL GROUP</div>
                <div className="text-xs">REALTY INC.</div>
              </div>
            </div>
            <p className={`text-sm ${mutedTextColor}`}>© {new Date().getFullYear()} Real Estate Project by <a href="mailto:riopulok@gmail.com" className="font-bold text-md">Pulok Chowdhury</a></p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/pulok.chowdhury.priyo/" className={`${mutedTextColor} hover:text-white`}>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className={`${mutedTextColor} hover:text-white`}>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/pulokc/" className={`${mutedTextColor} hover:text-white`}>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className={`${mutedTextColor} hover:text-white`}>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0177-288-3296</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>realestate13@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:underline">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Locations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/aspen-ridge-real-estate" className="hover:underline">
                  Aspen Ridge Real Estate
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Evergreen Real Estate
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Montgomery Place Real Estate
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Nutana Real Estate
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Riversdale Real Estate
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Silverspring Real Estate
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Stonebridge Real Estate
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-xs mt-10 text-gray-400">
          The REALTOR® trademark is owned and regulated by The Canadian Real Estate Association (CREA) and signifies real estate professionals who are CREA members. The MLS®, Multiple Listing Service® trademarks, and associated logos denote services provided by REALTOR® members of CREA to facilitate real estate transactions through a collaborative system.0.34 index This text mirrors the structure of the original while aligning with Real Group branding. Adjust affiliate names or services as needed to reflect your organization’s specifics.
          </p>
      </div>
    </footer>
  )
}

