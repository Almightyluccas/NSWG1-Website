import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | Naval Special Warfare Group One",
  description: "Privacy policy and data protection information for NSWG1 Arma 3 milsim unit website.",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Privacy <span className="text-accent">Policy</span>
              </h1>
              <p className="text-zinc-400 text-lg">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <p className="text-zinc-500 text-sm mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Personal Information</h3>
                    <p className="text-zinc-300">When you join our unit or use our services, we may collect:</p>
                    <ul className="list-disc list-inside text-zinc-300 mt-2 space-y-1">
                      <li>Discord username and ID</li>
                      <li>Steam profile information</li>
                      <li>Email address (for communications)</li>
                      <li>In-game callsign and preferences</li>
                    </ul>
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div>
                    <h3 className="font-semibold text-white mb-2">Automatically Collected Information</h3>
                    <ul className="list-disc list-inside text-zinc-300 space-y-1">
                      <li>IP address and location data</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent</li>
                      <li>Device information</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-zinc-300 space-y-2">
                    <li>Manage unit membership and operations</li>
                    <li>Communicate about training events and missions</li>
                    <li>Improve our website and services</li>
                    <li>Ensure security and prevent abuse</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Essential Cookies</h3>
                    <p className="text-zinc-300">
                      Required for basic website functionality, including authentication and security.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Analytics Cookies</h3>
                    <p className="text-zinc-300">
                      Help us understand how visitors use our site to improve user experience. We use Vercel Analytics for
                      this purpose.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Managing Cookies</h3>
                    <p className="text-zinc-300">
                      You can control cookies through your browser settings or our cookie consent banner.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Data Sharing and Third Parties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">We do not sell your personal information. We may share data with:</p>
                  <ul className="list-disc list-inside text-zinc-300 space-y-2">
                    <li>
                      <strong>Discord:</strong> For authentication and communication
                    </li>
                    <li>
                      <strong>Steam:</strong> For game integration and verification
                    </li>
                    <li>
                      <strong>Vercel:</strong> For hosting and analytics
                    </li>
                    <li>
                      <strong>PERSCOM:</strong> For military simulation management
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Your Rights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-zinc-300 space-y-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Withdraw consent at any time</li>
                    <li>Data portability</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Data Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300">
                    We implement appropriate security measures to protect your information, including:
                  </p>
                  <ul className="list-disc list-inside text-zinc-300 mt-2 space-y-1">
                    <li>Encrypted data transmission (HTTPS)</li>
                    <li>Secure database storage</li>
                    <li>Regular security updates</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Contact Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">
                    If you have questions about this privacy policy or your data, contact us:
                  </p>
                  <div className="space-y-2 text-zinc-300">
                    <p>
                      <strong>Discord:</strong> Join our server for immediate assistance
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      <Link href="/join" className="text-accent hover:underline">
                        Visit our join page
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-accent">Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300">
                    We may update this privacy policy from time to time. We will notify you of any significant changes by
                    posting the new policy on this page and updating the "last updated" date.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/" className="inline-flex items-center text-accent hover:text-accent/80 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}
