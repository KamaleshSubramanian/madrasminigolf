import { ArrowLeft, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

export default function TermsAndConditions() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/registration");
  };

  const termsContent = {
    title: "MADRAS MINI GOLF – TERMS, CONDITIONS, RULES, AND PARTICIPATION AGREEMENT",
    introduction: `This document ("Agreement") governs the use of the Madras Mini Golf facility, equipment, and services, located at:

Shop No. T-53/B, 4th, Besant Ave Rd, Tiruvalluvar Nagar, Adyar, Chennai, Tamil Nadu 600020

By purchasing an entry ticket, participating in any game, remaining on the premises, or otherwise engaging with Madras Mini Golf, you ("the Participant") confirm that you have read, understood, and accepted all terms, conditions, disclaimers, notices, and policies stated herein.

If you do not agree, you must not enter the premises or participate in the game.`,
    sections: [
      {
        number: "1",
        title: "DEFINITIONS",
        content: `For the purposes of this Agreement:
1.1 "Facility" means the Madras Mini Golf venue, including indoor/outdoor areas, waiting zones, restrooms, and any space where activities or related services take place.
1.2 "Game" means the miniature golf activity, inclusive of all obstacles, ramps, putting greens, balls, clubs, and accessories provided by the Operator.
1.3 "Operator" refers to Madras Mini Golf and its owners, managers, employees, representatives, and agents.`
      },
      {
        number: "2",
        title: "GENERAL CONDUCT AND BEHAVIOUR",
        content: `2.1 Participants must follow all instructions provided verbally, in writing, or via signage by the Operator's staff.
2.2 The Operator reserves the right to refuse entry, suspend participation, or remove any individual from the Facility without refund if they:
        •       Engage in behavior that is unsafe, disrespectful, or disruptive.
        •       Damage property intentionally or through negligence.
        •       Fail to comply with these Terms.
2.3 Alcohol, smoking, vaping, illegal substances, or dangerous objects are strictly prohibited.`
      },
      {
        number: "3",
        title: "PARTICIPATION REQUIREMENTS",
        content: `3.1 All Participants acknowledge that miniature golf involves walking, bending, swinging a club, and being in proximity to moving balls, and accept the associated risks.
3.2 Children under 12 years old must be supervised by a responsible adult at all times.
3.3 The game is not recommended for individuals with medical conditions that may be aggravated by mild physical activity.`
      },
      {
        number: "4",
        title: "EQUIPMENT USAGE",
        content: `4.1 All equipment remains the property of the Operator.
4.2 Clubs must be held securely and swung below knee height unless otherwise instructed.
4.3 Lost or damaged equipment may incur a replacement fee at the Operator's discretion.`
      },
      {
        number: "5",
        title: "GAME RULES",
        content: `5.1 The game consists of a set number of holes, each with its own par score and layout.
5.2 Only one Participant may take a shot at a time.
5.3 Maximum six (6) strokes per hole.
5.4 If the ball leaves the playing area, it must be replaced at the start point with a one-stroke penalty.`
      },
      {
        number: "6",
        title: "SAFETY WAIVER AND LIABILITY RELEASE",
        content: `6.1 Participation is entirely at the Participant's own risk.
6.2 The Operator is not liable for:
        •       Any injury, accident, illness, or death occurring during or after participation, except where directly caused by proven negligence.
        •       Loss or theft of personal property.
6.3 By accepting these Terms, the Participant waives the right to bring legal action against the Operator for any injury, damage, or loss incurred during participation, except as required under Indian law.`
      },
      {
        number: "7",
        title: "PHOTOGRAPHY AND MEDIA CONSENT",
        content: `7.1 The Operator may take photographs, videos, or other recordings of Participants for promotional use.
7.2 If you do not consent, you must notify staff before entering the game area.`
      },
      {
        number: "8",
        title: "REFUND POLICY",
        content: `8.1 All sales are final. No refunds will be issued for non-use of tickets, early departure, or dissatisfaction with the game.
8.2 If the game is canceled by the Operator due to safety, maintenance, or events beyond control, Participants may be offered a rescheduled session at no additional cost.`
      },
      {
        number: "9",
        title: "FORCE MAJEURE",
        content: `The Operator is not responsible for interruptions caused by events beyond its control, including but not limited to natural disasters, power failures, governmental restrictions, or strikes.`
      },
      {
        number: "10",
        title: "GOVERNING LAW AND DISPUTES",
        content: `10.1 These Terms are governed by the laws of India.
10.2 Any dispute shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.`
      },
      {
        number: "11",
        title: "ACCEPTANCE OF TERMS",
        content: `By entering, you acknowledge that:
        •       You have read and understood these Terms in full.
        •       You voluntarily accept all risks associated with participation.
        •       You release Madras Mini Golf from liability to the fullest extent permitted by law.`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-green-50"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registration
          </Button>
        </div>

        {/* Main Content */}
        <Card className="border-green-200 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 via-green-700 to-green-600 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 border-2 border-white rounded-full"></div>
              <div className="absolute top-4 right-8 w-12 h-12 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-2 left-16 w-8 h-8 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <Gavel className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Terms, Conditions & Rules</CardTitle>
              </div>
              <p className="text-green-100 text-sm mt-3 font-medium">
                📍 Madras Mini Golf | Please read carefully before participating
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Introduction */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                {termsContent.introduction}
              </div>
            </div>

            <Separator />

            {/* Terms Sections */}
            <div className="space-y-6">
              {termsContent.sections.map((section, index) => (
                <div key={index} className="border-l-4 border-l-green-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">
                    {section.number}. {section.title}
                  </h3>
                  <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed bg-white p-4 rounded border border-gray-200">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2"
                data-testid="button-back-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration
              </Button>
              <Button
                onClick={handleBack}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                data-testid="button-back-bottom"
              >
                I Understand - Continue Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}