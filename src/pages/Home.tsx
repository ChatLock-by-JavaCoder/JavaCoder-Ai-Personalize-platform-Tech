import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Trophy, Clock, Shield, Award } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
              Compete. Code. <span className="text-accent">Conquer.</span>
            </h1>
            <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              Join JavaCoder's competitive programming platform. Test your skills, climb the leaderboard, and prove your expertise.
            </p>
            <div className="flex gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <Link to="/exams">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                  Browse Exams
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose JavaCoder?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Trophy className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Competitive Edge</CardTitle>
                <CardDescription>
                  Challenge yourself against peers and climb the rankings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Clock className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Timed Challenges</CardTitle>
                <CardDescription>
                  Real-world simulation with time-bound assessments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Shield className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Advanced anti-cheating measures ensure fair competition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <Award className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Recognized Results</CardTitle>
                <CardDescription>
                  Get certified results and performance analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">About JavaCoder</h2>
            <p className="text-lg text-muted-foreground">
              JavaCoder is a leading technology consulting and training company dedicated to 
              empowering developers through competitive programming challenges. Our platform 
              provides a secure, professional environment for developers to showcase their 
              skills and companies to identify top talent.
            </p>
            <div className="pt-6">
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">JavaCoder</h3>
              <p className="text-primary-foreground/80">
                Professional - AI Learning platform
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><Link to="/exams" className="hover:text-accent transition-colors">Exams</Link></li>
            
                <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-primary-foreground/80">
                Email: codewithirfan@gmail.com<br />
                {/* Phone: +1 (555) 123-4567 */}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/80">
            <p>&copy; 2025 JavaCoder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
