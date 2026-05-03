import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, AlertCircle, FileText, Upload, ShieldCheck } from 'lucide-react';
import { useElectionStore } from '../../store/useElectionStore';
import { cn } from '../../lib/utils';
import { checkEligibility } from '../../utils/eligibility';

const VoterJourneyWizard = () => {
  const { t } = useTranslation();
  const { userType, setUserType, submissions, addSubmission } = useElectionStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState('');
  const fileInputRef = useRef(null);
  
  // Eligibility state
  const [age, setAge] = useState('');
  const [isCitizen, setIsCitizen] = useState(true);
  const [residency, setResidency] = useState('resident'); // 'resident' | 'nri'
  const [eligibilityError, setEligibilityError] = useState('');

  const handleEligibilitySubmit = () => {
    const { isValid, error } = checkEligibility(age, isCitizen);
    
    if (!isValid) {
      setEligibilityError(error);
      return;
    }
    
    setEligibilityError('');
    setUserType(residency);
    setCurrentStep(2);
  };

  const steps = [
    { id: 1, title: t('eligibility_check'), icon: ShieldCheck },
    { id: 2, title: t('form_requirements'), icon: FileText },
    { id: 3, title: t('document_upload'), icon: Upload },
    { id: 4, title: t('verification_epic'), icon: CheckCircle2 }
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert(t('please_upload_docs'));
      return;
    }
    
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const refId = `MM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedRefId(refId); // Save so step 4 displays the same ID
      addSubmission({
        id: refId,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        files: selectedFiles.map(f => f.name),
        status: 'Under AI Review'
      });
      setIsUploading(false);
      setCurrentStep(4);
      setSelectedFiles([]); // Reset
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-2xl font-bold text-governance-900 dark:text-white">{t('voter_registration_journey')}</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{t('complete_registration')}</p>
      </div>

      <div className="flex flex-col md:flex-row p-8">
        {/* Vertical Stepper Timeline */}
        <div className="w-full md:w-1/3 border-r border-slate-100 dark:border-slate-800 pr-8 mb-8 md:mb-0 relative">
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
          <ul className="space-y-8">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;
              const StepIcon = step.icon;
              
              return (
                <li key={step.id} className="flex items-start">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white dark:bg-slate-900 transition-all",
                    isActive ? "border-governance-500 text-governance-600 ring-4 ring-governance-50 dark:ring-governance-900/30" : 
                    isPast ? "border-emerald-500 text-emerald-500" : 
                    "border-slate-300 dark:border-slate-700 text-slate-400"
                  )}>
                    {isPast ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <div className="ml-4 mt-2">
                    <span className={cn(
                      "block text-sm font-medium transition-colors",
                      isActive ? "text-governance-900 dark:text-white" : 
                      isPast ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
                    )}>
                      {t(`step_${step.id}`)}
                    </span>
                    <span className={cn(
                      "block text-base transition-colors",
                      isActive ? "font-bold text-governance-800 dark:text-governance-400" : "text-slate-500"
                    )}>
                      {step.title}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Step Content Area */}
        <div className="w-full md:w-2/3 md:pl-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-governance-800 dark:text-white">{t('eligibility_checker')}</h3>
                
                {eligibilityError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{t(eligibilityError)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('age')}</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-governance-500 outline-none transition-shadow"
                    placeholder={t('enter_age')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('are_you_citizen')}</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsCitizen(true)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border font-medium transition-all",
                        isCitizen ? "bg-governance-50 dark:bg-white border-governance-500 dark:border-white text-governance-700 dark:text-governance-900 shadow-sm" : 
                        "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {t('yes')}
                    </button>
                    <button 
                      onClick={() => setIsCitizen(false)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border font-medium transition-all",
                        !isCitizen ? "bg-governance-50 dark:bg-white border-governance-500 dark:border-white text-governance-700 dark:text-governance-900 shadow-sm" : 
                        "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {t('no')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('residency_status')}</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setResidency('resident')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border font-medium transition-all",
                        residency === 'resident' ? "bg-governance-50 dark:bg-white border-governance-500 dark:border-white text-governance-700 dark:text-governance-900 shadow-sm" : 
                        "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {t('resident')}
                    </button>
                    <button 
                      onClick={() => setResidency('nri')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border font-medium transition-all",
                        residency === 'nri' ? "bg-governance-50 dark:bg-white border-governance-500 dark:border-white text-governance-700 dark:text-governance-900 shadow-sm" : 
                        "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {t('nri')}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleEligibilitySubmit}
                  className="w-full mt-6 py-3.5 bg-governance-600 hover:bg-governance-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                >
                  {t('verify_eligibility')}
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-governance-800 dark:text-governance-400">
                  {userType === 'nri' ? `${t('nri')} ${t('registration')} ${t('form_6a')}` : `${t('resident')} ${t('registration')} ${t('form_6')}`}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300">
                  {t('based_on_eligibility')}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white">{t('required_documents')}</h4>
                  <ul className="space-y-3">
                    {userType === 'nri' ? (
                      <>
                        <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-governance-500" />
                          {t('indian_passport')}
                        </li>
                        <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-governance-500" />
                          {t('visa_status')}
                        </li>
                        <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-governance-500" />
                          {t('overseas_address')}
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-governance-500" />
                          {t('aadhaar_card')}
                        </li>
                        <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-governance-500" />
                          {t('pan_or_age')}
                        </li>
                        <li className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-5 h-5 text-governance-500" />
                          {t('local_address')}
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
                  >
                    {t('back')}
                  </button>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-3.5 bg-governance-600 hover:bg-governance-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                  >
                    {t('proceed_to_upload')}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-governance-800 dark:text-white">{t('upload_documents')}</h3>
                <p className="text-slate-600 dark:text-slate-400">{t('upload_desc')}</p>

                <div 
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={handleUploadClick}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    multiple 
                    accept=".svg,.png,.jpg,.jpeg,.pdf" 
                  />
                  <Upload className="w-10 h-10 text-governance-400 mx-auto mb-4" />
                  <p className="text-governance-800 font-medium">{t('click_to_upload')}</p>
                  <p className="text-sm text-slate-500 mt-2">{t('upload_formats')}</p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('selected_files')}:</p>
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <FileText className="w-5 h-5 text-governance-500 shrink-0" />
                        <span className="truncate font-medium flex-1">{f.name}</span>
                        <span className="text-xs text-slate-400 shrink-0">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
                  >
                    {t('back')}
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="flex-1 py-3.5 bg-governance-600 hover:bg-governance-700 text-white rounded-xl font-semibold shadow-md transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('uploading')}
                      </>
                    ) : t('submit_for_verification')}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 py-4"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-governance-900">{t('application_submitted')}</h3>
                  <p className="text-slate-600 max-w-md mx-auto mt-2">
                    {t('application_under_review')}
                  </p>
                </div>
                
                <div className="bg-governance-50 border border-governance-100 rounded-xl p-4 mt-8 max-w-sm mx-auto text-center">
                  <p className="text-sm text-governance-800 font-medium">{t('app_ref_id')}</p>
                  <p className="text-xl font-bold tracking-wider text-governance-900 mt-1">{submittedRefId}</p>
                </div>

                <div className="text-center pt-8">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="py-3.5 px-8 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
                  >
                    {t('return_to_dashboard')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VoterJourneyWizard;
