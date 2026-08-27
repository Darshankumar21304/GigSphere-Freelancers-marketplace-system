import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, RefreshCw, Check, Shield, Award, MessageCircle, Share2, Heart, MapPin, Zap } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaved, setIsSaved] = useState(false);

  const gig = {
    title: 'I will create a modern WordPress website for your business',
    freelancer: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      level: 'Top Rated Seller',
      country: 'India',
      memberSince: 'Oct 2021',
      lastDelivery: 'about 2 hours',
      description: 'Hi, I am a professional web developer with 5+ years of experience in creating modern, responsive, and SEO-friendly WordPress websites. I focus on quality and customer satisfaction.'
    },
    rating: 4.9,
    reviews: 124,
    ordersInQueue: 3,
    description: "Welcome to my Gig!\n\nAre you looking for a modern, clean, and responsive WordPress website for your business or personal brand? Look no further! I specialize in creating stunning websites that not only look great but also convert visitors into customers.\n\nWhat you will get:\n- Fully responsive design (mobile, tablet, desktop)\n- SEO optimized structure\n- Fast loading speed\n- Integration with social media\n- Contact forms and lead generation setups\n\nWhy choose me?\n- 100% Client satisfaction\n- Fast communication\n- Post-launch support\n\nLet's discuss your project before placing an order!",
    packages: {
      basic: {
        name: 'Basic Landing Page',
        description: 'A simple, modern 1-page website with a contact form and social links.',
        price: 15000,
        deliveryTime: 3,
        revisions: 2,
        features: ['1 Page Layout', 'Responsive Design', 'Contact Form', 'Social Media Integration']
      },
      standard: {
        name: 'Standard Business Site',
        description: 'Up to 5 pages standard business website, fully optimized and responsive.',
        price: 35000,
        deliveryTime: 7,
        revisions: 5,
        features: ['5 Pages Layout', 'Responsive Design', 'Content Upload', 'Plugins/Extensions', 'Basic SEO Setup']
      },
      premium: {
        name: 'E-commerce Store',
        description: 'Full e-commerce setup with up to 20 products, payment gateway, and premium theme.',
        price: 65000,
        deliveryTime: 14,
        revisions: -1, // Unlimited
        features: ['10 Pages Layout', 'Responsive Design', 'E-commerce Functionality', '20 Products Upload', 'Payment Gateway Integration', 'Advanced SEO']
      }
    }
  };

  const handleOrder = () => {
    navigate('/checkout', { state: { gig, package: gig.packages[activeTab], packageType: activeTab } });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* Breadcrumb & Top Actions */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="hover:text-brand-600 cursor-pointer transition-colors">Programming & Tech</span>
            <span>/</span>
            <span className="hover:text-brand-600 cursor-pointer transition-colors">WordPress</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Full Website Creation</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center hover:text-gray-900 transition-colors">
              <Share2 className="w-4 h-4 mr-1" /> Share
            </button>
            <button 
              className={`flex items-center transition-colors ${isSaved ? 'text-red-500' : 'hover:text-gray-900'}`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className="w-4 h-4 mr-1" fill={isSaved ? 'currentColor' : 'none'} /> 
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column - Gig Details */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Header Section */}
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {gig.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img src={gig.freelancer.avatar} alt={gig.freelancer.name} className="w-12 h-12 rounded-full ring-2 ring-white shadow-md object-cover" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{gig.freelancer.name}</h3>
                    <div className="flex items-center text-sm">
                      <Award className="w-4 h-4 text-brand-600 mr-1" />
                      <span className="text-brand-600 font-medium">{gig.freelancer.level}</span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

                <div className="flex items-center space-x-4 text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 mr-1">{gig.rating}</span>
                    <span className="text-gray-500">({gig.reviews})</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <div className="text-gray-600 font-medium">
                    {gig.ordersInQueue} Orders in Queue
                  </div>
                </div>
              </div>
            </div>

            {/* Main Gig Image */}
            <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-gray-900/5 group relative aspect-video">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Gig preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm">
                    <Zap className="w-3 h-3 mr-1 text-yellow-300" /> Featured Work
                  </span>
                </div>
              </div>
            </div>

            {/* About This Gig */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-brand-100 text-brand-600 p-2 rounded-lg mr-3">
                  <MessageCircle className="w-5 h-5" />
                </span>
                About This Gig
              </h2>
              <div className="prose prose-brand max-w-none text-gray-600">
                {gig.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* About The Seller */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>
              
              <h2 className="text-2xl font-bold mb-8 relative z-10">About The Seller</h2>
              
              <div className="flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-8 relative z-10">
                <div className="flex-shrink-0 text-center">
                  <img src={gig.freelancer.avatar} alt={gig.freelancer.name} className="w-32 h-32 rounded-full ring-4 ring-white/10 object-cover mb-4 shadow-lg mx-auto" />
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors text-white text-sm font-medium py-2 px-6 rounded-full w-full">
                    Contact Me
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{gig.freelancer.name}</h3>
                  <p className="text-brand-300 font-medium mb-6 flex items-center">
                    <Award className="w-4 h-4 mr-1" /> {gig.freelancer.level}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center text-slate-400 mb-1">
                        <MapPin className="w-4 h-4 mr-1" /> From
                      </div>
                      <p className="font-semibold text-white">{gig.freelancer.country}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center text-slate-400 mb-1">
                        <Shield className="w-4 h-4 mr-1" /> Member since
                      </div>
                      <p className="font-semibold text-white">{gig.freelancer.memberSince}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2 flex justify-between items-center">
                      <div className="flex items-center text-slate-400">
                        <Clock className="w-4 h-4 mr-1" /> Last delivery
                      </div>
                      <p className="font-semibold text-white">{gig.freelancer.lastDelivery}</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {gig.freelancer.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                
                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 p-2">
                  {['basic', 'standard', 'premium'].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 py-3 text-sm font-bold capitalize transition-all duration-200 rounded-xl
                        ${activeTab === tab 
                          ? 'bg-white text-brand-600 shadow-sm border border-gray-200/60 transform scale-105 z-10' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                        }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight pr-4">
                      {gig.packages[activeTab].name}
                    </h3>
                    <span className="text-2xl font-light text-gray-900 tracking-tight whitespace-nowrap">
                      {formatINR(gig.packages[activeTab].price)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-8 leading-relaxed min-h-[60px]">
                    {gig.packages[activeTab].description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <Clock className="w-5 h-5 mr-2 text-brand-500" />
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Delivery</div>
                        {gig.packages[activeTab].deliveryTime} Days
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <RefreshCw className="w-5 h-5 mr-2 text-brand-500" />
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Revisions</div>
                        {gig.packages[activeTab].revisions === -1 ? 'Unlimited' : gig.packages[activeTab].revisions}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">What's Included</h4>
                    {gig.packages[activeTab].features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <div className="mt-0.5 mr-3 bg-brand-50 rounded-full p-1">
                          <Check className="w-3 h-3 text-brand-600" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleOrder}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:from-brand-700 hover:to-brand-600 transform transition-all duration-200 active:scale-95 flex justify-center items-center group"
                  >
                    Continue <span className="ml-2 font-normal opacity-90">({formatINR(gig.packages[activeTab].price)})</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button className="w-full mt-4 text-gray-500 font-medium text-sm py-2 hover:text-gray-900 transition-colors">
                    Compare Packages
                  </button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure payments verified by platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure ChevronRight is defined if used
function ChevronRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
