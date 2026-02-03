import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, Clock, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function B2BConsultationConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-green-900">
            Consultation Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your consultation is scheduled. We've sent a confirmation email with all the details and a video call link.
          </p>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-2xl">Your Scheduled Meeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <Calendar className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-lg font-bold">
                      {bookingData?.preferredDate && formatDate(bookingData.preferredDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-lg font-bold">
                      {bookingData?.preferredTime && formatTime(bookingData.preferredTime)} GMT
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-bold">{bookingData?.callDuration || 30} minutes</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="text-lg font-bold">{bookingData?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <h3 className="font-bold text-blue-900">What You Should Know</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>A video call link has been sent to your email - no need to download anything</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Join 5 minutes early to test your audio and camera</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Have any photos or documents ready to share if relevant</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>We'll send a summary of discussion points after the call</span>
              </li>
            </ul>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">We'll Discuss During Your Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Your project scope, locations, and specific requirements</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Timeline and budget expectations</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Our process and how we manage commercial projects</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Escrow protection and milestone-based payment structure</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Introduction to your dedicated project manager</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reschedule Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8"
        >
          <p className="text-sm text-amber-900">
            <span className="font-bold">Need to reschedule?</span> Just reply to your confirmation email or call us directly. We're flexible and happy to find a better time.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="flex-1 rounded-full"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => navigate('/b2b/find-painter')}
            size="lg"
            className="flex-1 rounded-full bg-secondary hover:bg-secondary/90"
          >
            Explore Find Painter
          </Button>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12"
        >
          <h3 className="text-xl font-bold mb-6">After Your Consultation</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Within 1-2 Business Days</h4>
                <p className="text-sm text-muted-foreground">
                  We'll send you a customized proposal with detailed breakdown, timeline, team information, and next steps.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Review & Questions</h4>
                <p className="text-sm text-muted-foreground">
                  Take time to review. Schedule a follow-up if you have questions. We're here to help.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Ready to Proceed</h4>
                <p className="text-sm text-muted-foreground">
                  Once you approve, we execute the agreement and set up escrow. Your project manager takes over from there.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
