"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  FileText,
  TrendingUp,
  Shield,
  Zap,
  Upload,
  ArrowRight,
  CheckCircle,
  Target,
  Award,
  Sparkles,
  Camera,
} from "lucide-react";
import Navbar from "./Navbar";
import Login from "./Login";

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [activeFeature, setActiveFeature] = useState(0);
  const suggestionFileRef = useRef(null);
  const reportFileRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          // if (type === 'suggestion' && result !== null) {
          //   setAiSuggestionImage(result);
          // } else {
          //   setAiReportImage(result);
          // }
        }
      };
    }
  };

  const aiFeatures = [
    {
      icon: Brain,
      title: "AI Suggestions",
      description:
        "Intelligent trade recommendations powered by machine learning",
      color: "from-blue-500 to-cyan-500",
      image: "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
      uploadRef: suggestionFileRef,
      uploadType: "suggestion",
    },
    {
      icon: FileText,
      title: "AI Reports",
      description: "Comprehensive market analysis with predictive insights",
      color: "from-purple-500 to-pink-500",
      image: "/Monitor.jpeg",
      uploadRef: reportFileRef,
      uploadType: "report",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Execute trades in milliseconds with our advanced infrastructure",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Bank-grade security with 256-bit encryption protection",
    },
    {
      icon: Target,
      title: "Precision Trading",
      description: "AI-powered accuracy for better investment decisions",
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized as India's most innovative trading platform",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
          <Navbar />
        </nav>
        <Login
          openDialog={openDialog}
          closeDialog={() => setOpenDialog(false)}
        />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 h-screen flex items-center justify-center">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div
                className={`transform transition-all duration-1000 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Trading Platform</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-8">
                  Trade with the Power of
                  <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    Artificial Intelligence
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                  Experience next-generation trading with AI suggestions and
                  intelligent reports that help you make smarter investment
                  decisions.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button
                    onClick={() => setOpenDialog(true)}
                    className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    Start Trading with AI
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="border-2 border-slate-300 text-slate-700 px-10 py-4 rounded-full text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                    View Live Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Showcase */}
        <section id="ai-showcase" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Meet Your AI Trading
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Assistant
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Upload screenshots of our AI features in action and see how
                intelligent trading transforms your investment strategy.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {aiFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`group relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 ${
                    activeFeature === index
                      ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-6 transition-transform duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div className="relative">
                    {feature.image ? (
                      <div className="relative group/image">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-64 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <button
                            onClick={() =>
                              (
                                feature.uploadRef
                                  .current as HTMLInputElement | null
                              )?.click()
                            }
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/30 transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Change Image</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group/upload"
                        onClick={() =>
                          (
                            feature.uploadRef.current as HTMLInputElement | null
                          )?.click()
                        }
                      >
                        <Upload className="w-12 h-12 text-slate-400 group-hover/upload:text-blue-500 transition-colors mb-4" />
                        <p className="text-slate-600 font-medium mb-2">
                          Upload {feature.title} Screenshot
                        </p>
                        <p className="text-sm text-slate-500">
                          Click to upload an image showcasing this feature
                        </p>
                      </div>
                    )}

                    <input
                      ref={feature.uploadRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="hidden"
                    />
                  </div>

                  {/* Feature Benefits */}
                  <div className="mt-6 space-y-3">
                    {index === 0 ? (
                      <>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          Real-time market sentiment analysis
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          Personalized risk-adjusted recommendations
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          Machine learning-powered insights
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          Comprehensive market analysis
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          Detailed performance metrics
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          Future trend predictions
                        </div>
                      </>
                    )}
                  </div>

                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500 pointer-events-none`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Why Traders Choose
                <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Nivesh Now
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Experience the perfect blend of cutting-edge technology,
                security, and user-friendly design.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group text-center p-8 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-20 bg-gradient-to-r from-slate-100 to-blue-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  98.7%
                </div>
                <div className="text-slate-600">AI Accuracy Rate</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  50K+
                </div>
                <div className="text-slate-600">Active AI Users</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  ₹5Cr+
                </div>
                <div className="text-slate-600">AI-Guided Trades</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  24/7
                </div>
                <div className="text-slate-600">AI Monitoring</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-600">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Trade with AI?
            </h2>
            <p className="text-xl mb-12 opacity-90">
              Join the future of trading today. Experience the power of AI
              suggestions and intelligent market reports.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button className="group bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center">
                Get Started Free
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-white/30 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Contact Sales
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm opacity-75">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                No Setup Fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                SEBI Registered
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                AI-Powered Trading
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                24/7 Support
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold">Nivesh Now</span>
                </div>
                <p className="text-slate-400">
                  India&apos;s most advanced AI-powered trading platform for
                  smart investors.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <div className="space-y-2 text-slate-400">
                  <div>AI Suggestions</div>
                  <div>AI Reports</div>
                  <div>Real-time Analytics</div>
                  <div>Mobile Trading</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <div className="space-y-2 text-slate-400">
                  <div>About Us</div>
                  <div>Careers</div>
                  <div>Press</div>
                  <div>Blog</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <div className="space-y-2 text-slate-400">
                  <div>Help Center</div>
                  <div>Contact Us</div>
                  <div>API Docs</div>
                  <div>Status</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 mb-4 md:mb-0">
                © 2025 Nivesh Now. All rights reserved.
              </div>
              <div className="flex space-x-6 text-slate-400">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>

        <style jsx>{`
          @keyframes ping {
            75%,
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default Landing;
