import React from 'react';
import { motion } from 'framer-motion';
import { Bell, FileEdit, CheckSquare, Megaphone, CheckCircle2, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useElectionStore } from '../../store/useElectionStore';
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

/**
 * ElectionProcessTimeline Component
 * An interactive, localized educational guide that explains the Indian election 
 * process from notification to results.
 */
const ElectionProcessTimeline = () => {
  const { t } = useTranslation();
  const { language } = useElectionStore();

  const steps = [
    {
      id: 1,
      titleKey: 'step_1_title',
      descKey: 'step_1_desc',
      icon: Bell,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40'
    },
    {
      id: 2,
      titleKey: 'step_2_title',
      descKey: 'step_2_desc',
      icon: FileEdit,
      color: 'text-indigo-500 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/40'
    },
    {
      id: 3,
      titleKey: 'step_3_title',
      descKey: 'step_3_desc',
      icon: CheckSquare,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/40'
    },
    {
      id: 4,
      titleKey: 'step_4_title',
      descKey: 'step_4_desc',
      icon: Megaphone,
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/40'
    },
    {
      id: 5,
      titleKey: 'step_5_title',
      descKey: 'step_5_desc',
      icon: CheckCircle2,
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/40'
    },
    {
      id: 6,
      titleKey: 'step_6_title',
      descKey: 'step_6_desc',
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-governance-900 dark:text-white mb-3">{t('timeline_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('timeline_subtitle')}</p>
      </div>

      <div className="relative">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.4, delay: index * 0.15, scale: { duration: 0.2 }, y: { duration: 0.2 } }}
                className="flex items-start gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
              >
                {/* Icon Node */}
                <div className={cn("shrink-0 w-14 h-14 rounded-full flex items-center justify-center", step.bgColor, step.color)}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content Card */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-sm font-bold", step.color)}>
                      {t('step')} {locNum(step.id, language)}
                    </span>
                    <h3 className="text-xl font-bold text-governance-800 dark:text-slate-100">
                      {t(step.titleKey)}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ElectionProcessTimeline;
