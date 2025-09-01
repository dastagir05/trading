"use client";
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Star,
  CheckCircle,
  IndianRupee,
  Target,
  Award,
  Smartphone,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Mock stock data for animation
const stockData = [
  { name: "RELIANCE", price: "2,847.65", change: "+2.34%", positive: true },
  { name: "TCS", price: "4,156.80", change: "+1.87%", positive: true },
  { name: "HDFC BANK", price: "1,687.45", change: "-0.65%", positive: false },
  { name: "INFOSYS", price: "1,834.25", change: "+3.21%", positive: true },
];

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Lightning Fast Execution",
    description:
      "Execute trades in milliseconds with our advanced trading infrastructure",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption and multi-factor authentication keep your investments safe",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Advanced Analytics",
    description:
      "Real-time charts, technical indicators, and market insights at your fingertips",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Mobile Trading",
    description:
      "Trade on-the-go with our intuitive mobile app available on iOS and Android",
  },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Day Trader",
    content:
      "Nivesh Now has transformed my trading experience. The platform is incredibly fast and reliable.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Investment Advisor",
    content:
      "Best trading platform I've used. The analytics tools are top-notch and help me make better decisions.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Portfolio Manager",
    content:
      "Outstanding customer service and a platform that never lets you down during crucial market hours.",
    rating: 5,
  },
];

// Animated Chart Component
const TradingChart = () => {
  const [activeBar, setActiveBar] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBar((prev) => (prev + 1) % 12);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const chartData = [65, 78, 82, 71, 89, 95, 88, 92, 76, 85, 91, 97];

  return (
    <div className="relative w-full h-64 bg-gradient-to-br mt-5 from-blue-50 to-green-50 rounded-xl p-6">
      <div className="flex items-end justify-between h-48 space-x-2 mt-5">
        {chartData.map((height, index) => (
          <div
            key={index}
            className={`flex-1 rounded-t-lg transition-all duration-300 ${
              index === activeBar
                ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg"
                : "bg-gradient-to-t from-blue-500 to-blue-400"
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="absolute top-2 left-6">
        <div className="text-2xl font-bold text-green-600">₹2,84,750</div>
        <div className="text-sm text-gray-600">Portfolio Value</div>
      </div>
      <div className="absolute top-2 right-6 ">
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="font-semibold">+12.5%</span>
        </div>
      </div>
    </div>
  );
};

// Stock Ticker Component
const StockTicker = () => {
  return (
    <div className="overflow-hidden bg-gray-900 py-2 mt-28 fixed bottom-0 w-full">
      <div className="animate-marquee whitespace-nowrap flex space-x-8">
        {[...stockData, ...stockData].map((stock, index) => (
          <div
            key={index}
            className="inline-flex items-center space-x-2 text-white"
          >
            <span className="font-medium">{stock.name}</span>
            <span className="text-gray-300">₹{stock.price}</span>
            <span
              className={`font-medium ${
                stock.positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {stock.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-20">
        <section className="pt-28 pb-14 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Award className="w-4 h-4" />
                    <span>India's #1 Trading Platform</span>
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Trade Smarter with
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {" "}
                      Nivesh Now
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Experience lightning-fast trading, advanced analytics, and
                    bank-grade security. Join over 1 million traders who trust
                    Nivesh Now for their investment journey.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center group">
                    Start Trading Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors">
                    Watch Demo
                  </button>
                </div>

                <div className="flex items-center space-x-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">10L+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹50K Cr+
                    </div>
                    <div className="text-sm text-gray-600">Daily Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      99.9%
                    </div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 ">
                <TradingChart />
                <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Gainers Today
                  </h3>
                  {stockData.map((stock, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {stock.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          ₹{stock.price}
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          stock.positive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <StockTicker />
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Nivesh Now?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to help you make smarter investment
                decisions and maximize your returns.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Trusted by Millions
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join India's fastest-growing trading community and experience
                the difference.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">10L+</div>
                <div className="text-blue-100">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  ₹50K Cr+
                </div>
                <div className="text-blue-100">Daily Trading Volume</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">0.01s</div>
                <div className="text-blue-100">Average Order Execution</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100">Customer Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Traders Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real experiences from real traders who've transformed their
                investment journey with Nivesh Now.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Your Trading Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join millions of traders who trust Nivesh Now. Open your account
                in minutes and start trading today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center group">
                  Open Free Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors">
                  Schedule Demo
                </button>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Zero Account Opening Charges
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  SEBI Registered
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Bank Grade Security
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Landing;
