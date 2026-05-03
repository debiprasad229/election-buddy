import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, LayoutDashboard, UserPlus, Settings, BookOpen, Menu, X, FileText, Sun, Moon } from 'lucide-react';
import LanguageFab from './LanguageFab';
import Chatbot from '../education/Chatbot';
import { useElectionStore } from '../../store/useElectionStore';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  const { activeView, setActiveView, isDarkMode, toggleDarkMode } = useElectionStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewChange = (view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen flex font-sans relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar / Navigation */}
      <aside className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 w-72 flex flex-col shadow-2xl md:shadow-xl z-[60] transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${isDarkMode ? 'bg-governance-950 text-white' : 'bg-white text-slate-900 border-r border-slate-200'}`}>
        <div className={`p-6 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-governance-900 shadow-md' : 'bg-slate-50 border-b border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-governance-500' : 'bg-governance-600'}`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-xl font-bold tracking-wide leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-governance-900'}`}>Matdan Mitra</h1>
          </div>
          <button 
            className={`md:hidden transition-colors ${isDarkMode ? 'text-governance-200 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {[
            { id: 'process', icon: BookOpen, label: t('election_process') },
            { id: 'registration', icon: UserPlus, label: t('registration') },
            { id: 'security', icon: Shield, label: t('security') },
            { id: 'applications', icon: FileText, label: t('users_applications') },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button 
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 group ${
                  isActive 
                    ? (isDarkMode 
                        ? 'bg-governance-800 text-governance-50 border-governance-400 shadow-lg shadow-black/20' 
                        : 'bg-governance-50 text-governance-700 border-governance-600 shadow-sm')
                    : (isDarkMode
                        ? 'text-governance-200 border-transparent hover:bg-governance-800 hover:text-white hover:border-governance-500'
                        : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-governance-800 hover:border-governance-300')
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive 
                    ? (isDarkMode ? 'text-governance-400' : 'text-governance-600')
                    : (isDarkMode ? 'text-governance-400/70 group-hover:text-white' : 'text-slate-400 group-hover:text-governance-600')
                }`} />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Google Cloud Badge */}
        <div className={`p-6 border-t transition-colors ${isDarkMode ? 'border-governance-800 bg-governance-900/30' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <img 
              src="https://www.gstatic.com/images/branding/product/2x/google_cloud_64dp.png" 
              alt="Google Cloud" 
              className="w-5 h-5 grayscale"
            />
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-governance-300' : 'text-slate-500'}`}>
              Powered by Google Cloud
            </span>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className={`border-b h-16 flex items-center px-4 md:px-8 shadow-sm justify-between shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button 
              className={`md:hidden p-2 -ml-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className={`text-lg md:text-xl font-semibold truncate max-w-[200px] sm:max-w-none transition-colors ${isDarkMode ? 'text-white' : 'text-governance-950'}`}>{t('app_name')}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 ring-1 ring-slate-200'}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className={`flex-1 overflow-auto p-4 md:p-8 relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          {/* Subtle Governance Blue Background Glow */}
          <div className={`absolute top-0 left-0 w-full h-96 pointer-events-none -z-10 transition-opacity duration-500 ${isDarkMode ? 'opacity-20 bg-gradient-to-b from-governance-900 to-transparent' : 'bg-gradient-to-b from-governance-100/50 to-transparent'}`} />
          
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <LanguageFab />
      <Chatbot />
    </div>
  );
};

export default Layout;
