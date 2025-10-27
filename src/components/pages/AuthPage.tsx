"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Loader2
} from "lucide-react";

// Reusable Badge Component (matching landing page)
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-[rgba(2,6,23,0.08)] shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });
  const [brandName, setBrandName] = useState("");
  const [query, setQuery] = useState("");
  const [redirectPage, setRedirectPage] = useState("active");

  useEffect(() => {
    const brand = searchParams.get('brand');
    const queryParam = searchParams.get('query');
    const redirect = searchParams.get('redirect');
    if (brand) setBrandName(brand);
    if (queryParam) setQuery(queryParam);
    if (redirect) setRedirectPage(redirect);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          alert("Account created successfully! Please check your email to verify your account.");
          setIsSignUp(false);
        } else {
          alert(data.error || "Signup failed");
        }
      } else {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          // Store session data
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('session', JSON.stringify(data.session));
          
          // Redirect to specified page with brand and query parameters
          const redirectUrl = brandName && query 
            ? `/dashboard?page=${redirectPage}&brand=${encodeURIComponent(brandName)}&query=${encodeURIComponent(query)}`
            : `/dashboard?page=${redirectPage}`;
          router.push(redirectUrl);
        } else {
          alert(data.error || "Login failed");
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        {/* Main container with proper margins */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          {/* Left vertical line */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          {/* Right vertical line */}
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            {/* Navigation */}
            <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

              <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
                <div className="flex justify-center items-center">
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
                      Brand Tracker
                    </div>
                  </div>
                </div>
                <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                  <div 
                    onClick={() => router.push('/')}
                    className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                      Back
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[500px] lg:w-[500px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full max-w-[400px] lg:w-[400px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[60px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-20 font-serif px-2 sm:px-4 md:px-0">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </div>
                  <div className="w-full max-w-[400px] lg:w-[400px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                    {isSignUp 
                      ? 'Start tracking your brand\'s AI visibility today' 
                      : 'Sign in to continue tracking your brand'
                    }
                  </div>
                </div>
              </div>

              {/* Brand Tracking Info */}
              {(brandName || query) && (
                <div className="w-full max-w-[500px] mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                  <div className="bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] p-4 sm:p-6">
                    <div className="flex items-center mb-3">
                      <Search className="w-4 h-4 text-[#37322F] mr-2" />
                      <span className="text-sm font-medium text-[#37322F]">Ready to track:</span>
                    </div>
                    <div className="text-sm text-[#605A57]">
                      <div><strong>Brand:</strong> {brandName}</div>
                      <div><strong>Query:</strong> {query}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Auth Form */}
              <div className="w-full max-w-[500px] mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium text-[#37322F] mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#605A57] w-4 h-4" />
                          <Input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="pl-10 bg-[#F7F5F3] border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[#605A57] focus:border-[#37322F] focus:ring-[#37322F]"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#37322F] mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#605A57] w-4 h-4" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="pl-10 bg-[#F7F5F3] border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[#605A57] focus:border-[#37322F] focus:ring-[#37322F]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#37322F] mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#605A57] w-4 h-4" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 bg-[#F7F5F3] border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[#605A57] focus:border-[#37322F] focus:ring-[#37322F]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#605A57] hover:text-[#37322F]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium text-[#37322F] mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#605A57] w-4 h-4" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            className="pl-10 bg-[#F7F5F3] border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[#605A57] focus:border-[#37322F] focus:ring-[#37322F]"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2a2523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                      <div className="flex items-center justify-center text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isSignUp ? 'Creating Account...' : 'Signing In...'}
                          </>
                        ) : (
                          isSignUp ? 'Create Account' : 'Sign In'
                        )}
                      </div>
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[#37322F] hover:text-[#2a2523] font-medium transition-colors"
                    >
                      {isSignUp 
                        ? 'Already have an account? Sign in' 
                        : 'Don\'t have an account? Sign up'
                      }
                    </button>
                  </div>

                  {!isSignUp && (
                    <div className="mt-4 text-center">
                      <button className="text-sm text-[#605A57] hover:text-[#37322F] transition-colors">
                        Forgot your password?
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="w-full max-w-[500px] mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-6 text-sm text-[#605A57]">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Free 14-day trial
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      No credit card required
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Setup in 2 minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
