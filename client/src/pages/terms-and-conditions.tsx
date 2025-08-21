import { ArrowLeft, CheckCircle, AlertTriangle, Users, Gavel, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

export default function TermsAndConditions() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/registration");
  };

  const termsSection = [
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      title: "General Conduct & Behavior",
      content: [
        "Follow all instructions provided by Madras Mini Golf staff",
        "Maintain respectful and safe behavior at all times",
        "No alcohol, smoking, vaping, or illegal substances",
        "Children under 12 must be supervised by an adult"
      ]
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      title: "Safety & Equipment",
      content: [
        "Hold clubs securely and swing below knee height",
        "Equipment remains property of Madras Mini Golf",
        "Lost or damaged equipment may incur replacement fees",
        "Not recommended for individuals with medical conditions"
      ]
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-amber-600" />,
      title: "Game Rules",
      content: [
        "Maximum 6 strokes per hole",
        "Only one participant may take a shot at a time",
        "Ball leaving playing area: replace at start with penalty",
        "Game consists of set number of holes with par scores"
      ]
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      title: "Liability & Waiver",
      content: [
        "Participation is entirely at your own risk",
        "Madras Mini Golf is not liable for injuries or property loss",
        "All sales are final - no refunds for non-use or dissatisfaction",
        "Photography/video may be taken for promotional use"
      ]
    }
  ];

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
            {/* Facility Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                Facility Location
              </h3>
              <p className="text-amber-700 text-sm">
                Shop No. T-53/B, 4th, Besant Ave Rd, Tiruvalluvar Nagar, Adyar, Chennai, Tamil Nadu 600020
              </p>
            </div>

            {/* Key Terms Sections */}
            <div className="grid gap-6 md:grid-cols-2">
              {termsSection.map((section, index) => (
                <Card key={index} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Legal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Gavel className="h-5 w-5 text-gray-600" />
                Legal & Compliance
              </h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Governing Law</h4>
                  <p className="text-blue-700 text-sm">
                    These terms are governed by the laws of India and subject to Chennai, Tamil Nadu courts.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Force Majeure</h4>
                  <p className="text-purple-700 text-sm">
                    Not responsible for interruptions due to natural disasters, power failures, or government restrictions.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Acceptance</h4>
                  <p className="text-red-700 text-sm">
                    By entering, you acknowledge reading these terms and voluntarily accept all risks.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Important Notice</h4>
                  <p className="text-red-700 text-sm leading-relaxed">
                    By purchasing an entry ticket, participating in any game, or remaining on the premises, 
                    you confirm that you have read, understood, and accepted all terms stated herein. 
                    If you do not agree, you must not enter the premises or participate in the game.
                  </p>
                </div>
              </div>
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