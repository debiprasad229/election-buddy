import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, MapPin, Loader2, AlertTriangle, AlertCircle, Info, Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useElectionStore } from '../../store/useElectionStore';
import { API_BASE_URL } from '../../config';
import incidentsData from '../../data/incidents.json';
import { cn } from '../../lib/utils';

const localDigits = {
  en: ['0','1','2','3','4','5','6','7','8','9'],
  hi: ['०','१','२','३','४','५','६','७','८','९'],
  te: ['౦','౧','౨','౩','౪','౫','౬','౭','౮','౯'],
  ta: ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯'],
  or: ['୦','୧','୨','୩','୪','୫','୬','୭','୮','୯']
};
const locNum = (num, lang) => {
  if (!localDigits[lang]) return num;
  return String(num).split('').map(c => /[0-9]/.test(c) ? localDigits[lang][parseInt(c)] : c).join('');
};

const languageMap = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  or: 'Odia'
};

const indianRegions = {
  States: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal'
  ],
  UnionTerritories: [
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
  ]
};

const SecurityAnalysis = () => {
  const { t } = useTranslation();
  
  const { securityCache, cacheSecurityResult, language } = useElectionStore();

  const [selectedLocation, setSelectedLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIncidentsForLocation = (locationName) => {
    return incidentsData.filter(i => i.location.state === locationName || `${i.location.state} - ${i.location.constituency}` === locationName);
  };

  const analyzeSecurityRisk = async () => {
    if (!selectedLocation) return;
    
    setAnalysisError(null);
    const locationKey = `${selectedLocation.replace(/\s+/g, '-').toLowerCase()}-${language}-v3`;
    
    // Check Cache
    if (securityCache[locationKey]) {
      return; 
    }

    setIsAnalyzing(true);
    
    const relevantIncidents = getIncidentsForLocation(selectedLocation);
    const targetLanguage = languageMap[language] || 'English';
    const languageInstruction = targetLanguage === 'English' 
      ? `CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL recommendations in professional English. Ensure the tone is appropriate for governance and election security.`
      : `CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL recommendations exclusively in ${targetLanguage} native script and proper tone. Do NOT use English words, English numbers, or Roman script anywhere in the recommendations array. Every single word and number in the recommendations array must be in ${targetLanguage} script. This is mandatory and non-negotiable. Avoid transliteration at all costs.`;

    const prompt = `Analyze the election security risk for the region: ${selectedLocation}. Here are some past recorded incidents (if any): ${JSON.stringify(relevantIncidents)}. Rate the risk level from 1-10 and recommend specific security deployments (e.g., CRPF deployment level, CCTV density). Return a JSON object with 'riskLevel' (number 1-10) and 'recommendations' (a string array containing EXACTLY 5 specific recommendations). 
    
    ${languageInstruction}`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, languageCode: language, languageName: targetLanguage })
      });

      if (response.status === 429) {
        throw new Error(t('rate_limit_error'));
      }

      if (!response.ok) {
        let errMsg = `API Error: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Backend now sends the fully parsed JSON object directly
      cacheSecurityResult(locationKey, data);
      
    } catch (error) {
      console.error("Gemini API Error:", error);
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger analysis when location changes
  useEffect(() => {
    if (selectedLocation) {
      analyzeSecurityRisk();
    }
  }, [selectedLocation, language]);

  const locationKey = selectedLocation ? `${selectedLocation.replace(/\s+/g, '-').toLowerCase()}-${language}-v3` : '';
  const currentAnalysis = securityCache[locationKey];
  const isHighRisk = currentAnalysis?.riskLevel > 7;

  // Filter states and UTs based on search
  const filteredStates = indianRegions.States.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUTs = indianRegions.UnionTerritories.filter(u => u.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-governance-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-governance-600 dark:text-governance-400" />
            {t('ai_security_intel')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('predictive_modeling')}</p>
        </div>
        
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <MapPin className="text-slate-400 w-5 h-5" />
          
          <div className="relative w-64">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl p-3 flex justify-between items-center outline-none focus:ring-2 focus:ring-governance-500 transition-colors"
            >
              <span className={cn("truncate", !selectedLocation && "text-slate-400 dark:text-slate-500")}>
                {selectedLocation ? t(selectedLocation) : t('select_option')}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 top-full mt-2 w-72 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder={t('search_regions')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-governance-400 dark:text-white"
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredStates.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('states')}</div>
                        {filteredStates.map(state => (
                          <button
                            key={state}
                            onClick={() => { setSelectedLocation(state); setIsDropdownOpen(false); setSearchQuery(''); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedLocation === state ? 'bg-governance-100 dark:bg-governance-900/50 text-governance-800 dark:text-governance-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            {t(state)}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {filteredUTs.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('union_territories')}</div>
                        {filteredUTs.map(ut => (
                          <button
                            key={ut}
                            onClick={() => { setSelectedLocation(ut); setIsDropdownOpen(false); setSearchQuery(''); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedLocation === ut ? 'bg-governance-100 dark:bg-governance-900/50 text-governance-800 dark:text-governance-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            {t(ut)}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {filteredStates.length === 0 && filteredUTs.length === 0 && (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">{t('no_regions_found')}</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {analysisError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{t('analysis_failed')}</p>
            <p className="text-sm mt-1">{analysisError}</p>
            <p className="text-sm mt-2 font-mono text-rose-600 bg-rose-100 p-2 rounded">
              Ensure the backend server is running and GEMINI_API_KEY is in .env
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!selectedLocation ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center transition-colors">
          <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('no_region_selected')}</h3>
          <p className="text-slate-500 dark:text-slate-400">{t('please_select_region')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Safety Index Card */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 h-full flex flex-col items-center justify-center min-h-[300px]"
              >
                <Loader2 className="w-12 h-12 text-governance-500 animate-spin mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">{t('gemini_analyzing')}</p>
              </motion.div>
            ) : currentAnalysis ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden p-8 flex flex-col items-center justify-center min-h-[300px] transition-all duration-500 ${isHighRisk ? 'border-rose-300 dark:border-rose-900/50' : 'border-emerald-200 dark:border-emerald-900/50'}`}
              >
                {/* Background Glow Effect */}
                {isHighRisk && (
                  <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
                )}
                
                <h3 className="text-slate-500 font-medium tracking-wide uppercase text-sm mb-4">{t('safety_index')}</h3>
                
                <div className={cn(
                  "relative flex items-center justify-center w-32 h-32 rounded-full mb-6",
                  isHighRisk ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                )}>
                  {isHighRisk && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full border-4 border-rose-500"
                    />
                  )}
                  <span className="text-5xl font-black">{locNum(currentAnalysis.riskLevel, language)}</span>
                  <span className="text-xl font-bold mt-3 text-opacity-50">/{locNum(10, language)}</span>
                </div>

                <div className="text-center">
                  <h4 className={cn(
                    "text-xl font-bold mb-1",
                    isHighRisk ? "text-rose-700" : "text-emerald-700"
                  )}>
                    {isHighRisk ? t('high_risk_zone') : t('secure_zone')}
                  </h4>
                  <p className="text-slate-500 text-sm">
                    {t('based_on_incidents', { count: locNum(getIncidentsForLocation(selectedLocation).length, language) })}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 h-full transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-governance-500 dark:text-governance-400" />
              {t('deployment_recommendations')}
            </h3>
            
            {isAnalyzing ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : currentAnalysis ? (
              <ul className="space-y-4">
                {currentAnalysis.recommendations.map((rec, index) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors"
                  >
                    <div className={`mt-0.5 p-1 rounded-full ${isHighRisk ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-governance-100 dark:bg-governance-900/40 text-governance-600 dark:text-governance-400'}`}>
                      {isHighRisk ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">{t('select_location_for_ai')}</p>
            )}
          </div>
        </div>

      </div>
      )}
    </div>
  );
};

export default SecurityAnalysis;
