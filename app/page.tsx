import Link from "next/link";
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green via-brand-green to-brand-green-dark flex flex-col">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 safe-top">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-brand-green font-bold text-lg">CD</span>
          </div>
          <span className="text-white font-semibold text-xl">CreditDesk</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Track Your
            <br />
            Debts &amp; Credits
            <br />
            <span className="text-white/80">Effortlessly</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg mb-10 max-w-sm leading-relaxed">
            Replace your notebook with a digital ledger. Know who owes you, who you owe, and your net position at a glance.
          </p>
        </div>

        <div className="space-y-3 animate-slide-up">
          <Link href="/signup" className="block">
            <Button size="lg" className="w-full bg-white text-brand-green hover:bg-gray-50 font-semibold text-base h-14 rounded-2xl shadow-lg">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-center text-white/60 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline underline-offset-2 font-medium">
              Login
            </Link>
          </p>
        </div>
      </main>

      {/* Features */}
      <div className="bg-white rounded-t-3xl px-6 py-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-green-light flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-brand-green" />
            </div>
            <span className="text-xs font-medium text-gray-600">Track Balances</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-green-light flex items-center justify-center">
              <Users className="h-5 w-5 text-brand-green" />
            </div>
            <span className="text-xs font-medium text-gray-600">Manage Contacts</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-green-light flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand-green" />
            </div>
            <span className="text-xs font-medium text-gray-600">Secure &amp; Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
