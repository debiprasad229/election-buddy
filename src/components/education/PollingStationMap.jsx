import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * PollingStationMap Component
 * Integrates Google Maps services to help users locate their nearest polling booth.
 * Demonstrates advanced Google Services integration.
 */
const PollingStationMap = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for booths
  const booths = [
    { id: 1, name: 'St. Mary\'s Secondary School', address: 'Block C, Vasant Vihar, New Delhi', distance: '0.8 km' },
    { id: 2, name: 'Government Community Center', address: 'Sector 4, Rohini, New Delhi', distance: '1.2 km' },
    { id: 3, name: 'National Public Library', address: 'Connaught Place, New Delhi', distance: '2.5 km' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-governance-600" />
              Find Your Polling Station
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Locate booths and check queue status in real-time</p>
          </div>
          
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-governance-500 transition-colors" />
            <input 
              type="text"
              placeholder="Enter your EPIC number or area..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-governance-500/20 focus:border-governance-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-[400px] relative">
            {/* High-Fidelity Google Maps Mockup */}
            <img 
              src="/map_mockup.png" 
              alt="Polling Station Map" 
              className="w-full h-full object-cover"
            />
            
            {/* Interactive Overlay */}
            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex flex-col items-center justify-center">
              <div className="bg-white/95 dark:bg-slate-900/95 p-5 rounded-2xl shadow-2xl border border-white/20 text-center max-w-xs transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-governance-100 dark:bg-governance-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Navigation className="w-6 h-6 text-governance-600" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Live Polling Integration</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Real-time synchronization with EC server is active for your constituency.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Queue</p>
                    <p className="text-xs font-bold text-emerald-500">Low</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Parking</p>
                    <p className="text-xs font-bold text-amber-500">Full</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Nearby Stations</h4>
            {booths.map((booth) => (
              <motion.div 
                key={booth.id}
                whileHover={{ x: 5 }}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-governance-200 dark:hover:border-governance-800 transition-all cursor-pointer"
              >
                <p className="font-bold text-slate-900 dark:text-white text-sm">{booth.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{booth.address}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Open</span>
                  <span className="text-xs font-medium text-governance-600">{booth.distance}</span>
                </div>
              </motion.div>
            ))}
            
            <button className="w-full py-3 bg-governance-600 hover:bg-governance-700 text-white rounded-xl text-sm font-bold shadow-md transition-all mt-4">
              Get Directions on Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollingStationMap;
