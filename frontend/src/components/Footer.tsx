"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
const Footer = () => {
  return (
    // <footer className="bg-gray-900 text-gray-300">

    // </footer>
    <footer className="bg-gray-900 text-gray-300 text-sm py-10 px-6 md:px-16 leading-relaxed ">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nivesh Now</span>
            </div>
            <p className="text-gray-400">
              India's most trusted trading platform with over 10 lakh satisfied
              customers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Equity Trading
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mutual Funds
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Commodities
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Currency
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trading Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Market Hours
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Risk Disclosure
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5">
        <p className="">
          <strong>NiveshNow Fintech Pvt. Ltd.</strong> | SEBI Registration No.
          INZXXXXXXXX | CIN: UXXXXXXXXXXXXXX | Compliance Officer: Mr. [Your
          Officer Name] | Tel: +91-XXXXXXXXXX | Email:{" "}
          <a
            href="mailto:compliance@niveshnow.com"
            className="text-blue-800 underline"
          >
            compliance@niveshnow.com
          </a>
        </p>

        <p>
          Registered Office: [Your Registered Address] | Correspondence Address:
          [Your Correspondence Address]
        </p>

        <p>
          For complaints, email:{" "}
          <a
            href="mailto:complaints@niveshnow.com"
            className="text-blue-800 underline"
          >
            complaints@niveshnow.com
          </a>
        </p>

        <p>
          To file a complaint on SEBI SCORES, visit
          <a
            href="https://scores.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-800 underline ml-1"
          >
            scores.gov.in
          </a>
          . Please read our
          <a href="/terms" className="text-blue-800 underline mx-1">
            Terms of Use
          </a>{" "}
          and
          <a href="/privacy" className="text-blue-800 underline">
            Privacy Policy
          </a>
          .
        </p>

        <p>
          <strong className="text-grey-300">Disclaimer:</strong> Investments in
          the securities market are subject to market risks. Read all documents
          carefully before investing.
        </p>
        <p>*Brokerage will not exceed SEBI prescribed limits.</p>

        <div>
          <h4 className="text-grey-300 text-base font-semibold mb-2">
            Risk Disclosures on Derivatives
          </h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>9 out of 10 traders in equity derivatives incur net losses.</li>
            <li>Average loss is around ₹50,000 per losing trader annually.</li>
            <li>Loss-makers spend 28% more as transaction costs.</li>
            <li>Profit-makers incur 15–50% of profits in transaction costs.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-grey-300 text-base font-semibold mb-2">
            Investor Guidelines & Cautions
          </h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Do not share login credentials or OTPs.</li>
            <li>
              Avoid trading in leveraged products without full understanding.
            </li>
            <li>Do not act on unverified financial tips or strategies.</li>
            <li>Be cautious with unsolicited messages or social media tips.</li>
          </ul>
        </div>

        <p>
          See:{" "}
          <a
            href="https://www.nseindia.com/invest/content/advisory_for_investors.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-800 underline"
          >
            Investor Advisory Guidelines
          </a>{" "}
          |
          <a
            href="https://www.sebi.gov.in/legal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-800 underline ml-1"
          >
            SEBI KYC Guidelines
          </a>
        </p>

        <p>
          Update your contact details with your broker/depository. Monitor
          transactions through CDSL/NSDL alerts and avoid unauthorized access.
        </p>

        <p>
          No cheque needed for IPOs – use ASBA. Pledge securities via NSDL/CDSL
          using OTP.
        </p>

        <p>
          Review your holdings in the Consolidated Account Statement (CAS) sent
          monthly by NSDL/CDSL.
        </p>

        <div>
          <h4 className="text-grey-300 text-base font-semibold mb-2">
            Dispute Resolution
          </h4>
          <p>
            SEBI’s
            <a
              href="https://smartodr.in/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 underline mx-1"
            >
              Online Dispute Resolution (ODR)
            </a>
            portal allows for online arbitration and conciliation. Read more:
            <a
              href="https://www.sebi.gov.in/legal/circulars/jul-2023/online-resolution-of-disputes-in-the-indian-securities-market_74794.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 underline ml-1"
            >
              SEBI Circular
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
