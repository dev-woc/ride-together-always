import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Tab = 'privacy' | 'terms' | 'nondiscrimination';

const tabs: { id: Tab; label: string }[] = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Use' },
  { id: 'nondiscrimination', label: 'Nondiscrimination' },
];

const Legal = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'privacy';
  const [active, setActive] = useState<Tab>(initialTab);

  useEffect(() => {
    const tab = (searchParams.get('tab') as Tab) || 'privacy';
    setActive(tab);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        <h1 className="font-display font-bold uppercase text-4xl md:text-5xl text-foreground mb-4">
          Legal
        </h1>
        <p className="text-muted-foreground mb-10">
          Last updated: April 2026 · Keep Pedaling Foundation · EIN: 99-3038427
        </p>

        {/* Tab Nav */}
        <div role="tablist" aria-label="Legal sections" className="flex gap-1 border-b border-border mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`font-display text-sm uppercase tracking-wider px-5 py-3 border-b-2 transition-colors ${
                active === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Privacy Policy */}
        {active === 'privacy' && (
          <article id="tabpanel-privacy" role="tabpanel" aria-labelledby="tab-privacy" className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Overview</h2>
              <p>
                Keep Pedaling Foundation ("KPF," "we," "us," or "our") is committed to protecting your
                personal information. This Privacy Policy explains what data we collect, how we use it,
                and your rights regarding that data when you use our website at{' '}
                <strong className="text-foreground">ridetogether.always</strong> (the "Site").
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Information We Collect</h2>
              <p>We collect information you voluntarily provide, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-foreground">Ride Signups:</strong> Full name, email address, phone number, Instagram handle, ride group preference, and waiver acknowledgment.</li>
                <li><strong className="text-foreground">Contact Form:</strong> Name, email address, phone number, and message content.</li>
                <li><strong className="text-foreground">Stay Connected:</strong> First name, last name, and email address for community updates.</li>
                <li><strong className="text-foreground">Cycle of Support Applications:</strong> Application details submitted through the COS program.</li>
                <li><strong className="text-foreground">Donations:</strong> Donation transactions are processed by Zeffy and subject to their privacy policy. KPF does not store your payment information.</li>
              </ul>
              <p className="mt-3">
                We may also collect standard technical data such as browser type, IP address, and pages
                visited to help maintain and improve the Site.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To register you for rides and community events</li>
                <li>To respond to contact form submissions and support requests</li>
                <li>To send community updates and newsletters (only if you opt in)</li>
                <li>To process and review Cycle of Support applications</li>
                <li>To improve our programs and website experience</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="mt-3">
                We will never sell, rent, or trade your personal information to third parties for
                marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Data Sharing</h2>
              <p>
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-foreground">Service Providers:</strong> We use Neon (database hosting) and Zeffy (donation processing). These providers are bound by confidentiality and data protection agreements.</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal process.</li>
                <li><strong className="text-foreground">Safety:</strong> We may share information to protect the rights, safety, or property of KPF, our community, or the public.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Cookies</h2>
              <p>
                Our Site uses cookies to maintain your session when logged in to the admin or Cycle of
                Support portal. We do not use advertising or tracking cookies. You can disable cookies
                in your browser settings, though this may affect login functionality.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Data Retention</h2>
              <p>
                We retain ride signup and contact request data for as long as necessary to fulfill the
                purposes described above or as required by law. You may request deletion of your data
                at any time (see Your Rights below).
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Your Rights</h2>
              <p>
                Depending on your location, you may have the following rights under CCPA, GDPR, or
                applicable state law:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to correct inaccurate data</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to opt out of communications at any time</li>
                <li>The right to data portability</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:KeepPedalingFoundation@gmail.com" className="text-primary hover:underline">
                  KeepPedalingFoundation@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Children's Privacy</h2>
              <p>
                Our Site is not directed to children under 13. We do not knowingly collect personal
                information from children under 13. If you believe we have inadvertently collected such
                information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will post the revised policy on
                this page with an updated date. Continued use of the Site after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>
          </article>
        )}

        {/* Terms of Use */}
        {active === 'terms' && (
          <article id="tabpanel-terms" role="tabpanel" aria-labelledby="tab-terms" className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Acceptance of Terms</h2>
              <p>
                By accessing or using the Keep Pedaling Foundation website, you agree to be bound by
                these Terms of Use. If you do not agree, please do not use the Site.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Use of the Site</h2>
              <p>You agree to use this Site only for lawful purposes and in a manner that does not:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Violate any applicable federal, state, or local law or regulation</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or disruptive content</li>
                <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Donations</h2>
              <p>
                Donations made through our Site are processed by Zeffy, a third-party platform. All
                donations to Keep Pedaling Foundation are tax-deductible to the extent permitted by law.
                KPF is a registered 501(c)(3) nonprofit organization (EIN: 99-3038427). Donations are
                non-refundable unless required by law.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Event Participation & Waivers</h2>
              <p>
                Participation in KPF-organized rides and events requires completion of a liability waiver
                at the time of signup. By signing the waiver, you acknowledge the inherent risks of
                cycling activities and agree to release KPF, its officers, volunteers, and partners from
                liability for injuries sustained during participation, except in cases of gross negligence
                or willful misconduct.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Intellectual Property</h2>
              <p>
                All content on this Site — including text, graphics, logos, images, and videos — is the
                property of Keep Pedaling Foundation or its content suppliers and is protected by
                applicable intellectual property laws. You may not reproduce, distribute, or create
                derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Disclaimer of Warranties</h2>
              <p>
                This Site is provided "as is" without warranties of any kind, either express or implied.
                KPF does not warrant that the Site will be uninterrupted, error-free, or free of viruses
                or other harmful components.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, KPF shall not be liable for any indirect,
                incidental, special, or consequential damages arising from your use of the Site or
                participation in our programs.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Governing Law</h2>
              <p>
                These Terms of Use are governed by the laws of the State of Florida, without regard to
                conflict of law principles. Any disputes shall be resolved in the courts located in
                Orange County, Florida.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Contact</h2>
              <p>
                For questions about these Terms, contact us at{' '}
                <a href="mailto:KeepPedalingFoundation@gmail.com" className="text-primary hover:underline">
                  KeepPedalingFoundation@gmail.com
                </a>.
              </p>
            </section>
          </article>
        )}

        {/* Nondiscrimination */}
        {active === 'nondiscrimination' && (
          <article id="tabpanel-nondiscrimination" role="tabpanel" aria-labelledby="tab-nondiscrimination" className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Our Commitment</h2>
              <p>
                Keep Pedaling Foundation is committed to ensuring that no person is excluded from
                participation in, denied the benefits of, or subjected to discrimination in any of our
                programs, services, or activities on the basis of race, color, national origin, sex,
                age, disability, religion, sexual orientation, gender identity, or any other
                characteristic protected by applicable law.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Scope</h2>
              <p>This policy applies to all KPF programs and services, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Community cycling rides and events</li>
                <li>Mental health resources and referrals</li>
                <li>Cycle of Support program and scholarship applications</li>
                <li>Volunteer and partnership opportunities</li>
                <li>Website access and digital communications</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Accessibility</h2>
              <p>
                KPF is committed to making our programs and website accessible to individuals with
                disabilities. We will provide reasonable accommodations upon request, including
                auxiliary aids and services, at no cost to the individual, subject to resource
                availability. We also endeavor to make this Site compliant with WCAG 2.1 Level AA
                accessibility standards.
              </p>
              <p className="mt-3">
                To request an accommodation, contact us at{' '}
                <a href="mailto:KeepPedalingFoundation@gmail.com" className="text-primary hover:underline">
                  KeepPedalingFoundation@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Language Access</h2>
              <p>
                KPF will make reasonable efforts to provide language access services to individuals
                with limited English proficiency so they can meaningfully participate in our programs
                and services.
              </p>
            </section>

            <section>
              <h2 className="font-display uppercase text-foreground text-xl mb-3">Filing a Complaint</h2>
              <p>
                If you believe you have been subjected to discrimination by KPF, you may file a
                complaint within 180 days of the alleged incident. Complaints should include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your name and contact information</li>
                <li>A description of the alleged discrimination</li>
                <li>The date(s) of the incident(s)</li>
                <li>The remedy or relief you are seeking</li>
              </ul>
              <p className="mt-3">
                Submit complaints to:{' '}
                <a href="mailto:KeepPedalingFoundation@gmail.com" className="text-primary hover:underline">
                  KeepPedalingFoundation@gmail.com
                </a>{' '}
                or by mail to: Keep Pedaling Foundation, Orlando, Florida.
              </p>
              <p className="mt-3">
                KPF will acknowledge receipt of your complaint and work toward resolution within 60
                days. Complex cases may require additional time. KPF strictly prohibits retaliation
                against anyone who files a complaint or participates in an investigation.
              </p>
            </section>
          </article>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Legal;
