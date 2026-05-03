import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import VoterJourneyWizard from './components/registration/VoterJourneyWizard';
import SecurityAnalysis from './components/security/SecurityAnalysis';
import ElectionProcessTimeline from './components/education/ElectionProcessTimeline';
import PollingStationMap from './components/education/PollingStationMap';
import UserApplications from './components/admin/UserApplications';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LayoutDashboard, UserPlus, ShieldAlert, MapPin } from 'lucide-react';
import { useElectionStore } from './store/useElectionStore';

function App() {
  const { t, i18n } = useTranslation();
  const { activeView, language } = useElectionStore();

  // Ensure i18n is in sync with store language on mount/refresh
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <Layout>

      {activeView === 'dashboard' && (
        <motion.div 
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
        >
          <h1 className="text-3xl font-bold text-governance-900 mb-4">{t('dashboard')}</h1>
          <p className="text-slate-600 text-lg">
            {t('dashboard_welcome')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-governance-50 rounded-xl p-6 border border-governance-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-governance-800 font-semibold mb-2">{t('registration_status')}</h3>
              <div className="text-3xl font-bold text-governance-600">{t('completion_percent')}</div>
              <p className="text-sm text-governance-500 mt-1">{t('completion_rate')}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-emerald-800 font-semibold mb-2">{t('network_health')}</h3>
              <div className="text-3xl font-bold text-emerald-600">{t('optimal')}</div>
              <p className="text-sm text-emerald-500 mt-1">{t('all_nodes_operational')}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-rose-50 rounded-xl p-6 border border-rose-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-rose-800 font-semibold mb-2">{t('security_alerts')}</h3>
              <div className="text-3xl font-bold text-rose-600">{t('zero_alerts')}</div>
              <p className="text-sm text-rose-500 mt-1">{t('no_incidents_detected')}</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {activeView === 'registration' && (
        <motion.div
          key="registration"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VoterJourneyWizard />
        </motion.div>
      )}

      {activeView === 'security' && (
        <motion.div
          key="security"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SecurityAnalysis />
        </motion.div>
      )}

      {activeView === 'process' && (
        <motion.div
          key="process"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ElectionProcessTimeline />
        </motion.div>
      )}

      {activeView === 'booth' && (
        <motion.div
          key="booth"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PollingStationMap />
        </motion.div>
      )}
      
      {activeView === 'applications' && (
        <motion.div
          key="applications"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserApplications />
        </motion.div>
      )}
    </Layout>
  );
}

export default App;
