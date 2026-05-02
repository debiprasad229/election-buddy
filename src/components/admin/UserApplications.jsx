import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useElectionStore } from '../../store/useElectionStore';

const UserApplications = () => {
  const { t } = useTranslation();
  const { submissions } = useElectionStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="w-12 h-12 bg-governance-100 dark:bg-governance-900/50 text-governance-600 dark:text-governance-400 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-governance-900 dark:text-white">{t('users_applications')}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t('manage_submissions')}</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t('no_applications_yet')}</h3>
            <p className="text-slate-500 dark:text-slate-500">{t('once_users_submit')}</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">{t('reference_id')}</th>
                    <th className="px-6 py-4">{t('date_submitted')}</th>
                    <th className="px-6 py-4">{t('documents')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-governance-700 dark:text-governance-400">{sub.id}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{sub.date}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col gap-1">
                          {sub.files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <FileText className="w-3 h-3 text-governance-400 dark:text-governance-500" />
                              <span className="truncate max-w-[200px]" title={f}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserApplications;
