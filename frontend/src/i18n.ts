import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Minimal demo dictionary. 
// Any keys not explicitly defined here will seamlessly fall back to English 
// because we use fallbackLng: 'en', satisfying the requirement:
// "If a translation is unavailable: use English fallback rather than showing missing keys."

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.check_in": "Check-in",
      "nav.journey": "My Journey",
      "nav.support": "Support",
      "nav.messages": "Messages",
      "nav.profile": "Profile",
      "nav.appointments": "Appointments",
      "nav.safety_plan": "Safety Plan",
      
      "profile.title": "Profile & Settings",
      "profile.edit": "Edit Profile",
      "profile.save": "Save Changes",
      "profile.cancel": "Cancel",
      "profile.language": "Preferred Language",
      
      "dashboard.greeting": "Good morning, {{name}} ☀️",
      "dashboard.checkin_prompt": "How are you feeling today?",
      "dashboard.start_checkin": "Start Check-in",
      
      "common.saving": "Saving...",
      "common.saved": "Saved successfully",
      "common.error": "Unable to save — Retry"
    }
  },
  hi: {
    translation: {
      "nav.home": "होम",
      "nav.check_in": "चेक-इन",
      "nav.journey": "मेरी यात्रा",
      "nav.support": "सहायता",
      "nav.messages": "संदेश",
      "nav.profile": "प्रोफ़ाइल",
      "nav.appointments": "अपॉइंटमेंट",
      "nav.safety_plan": "सुरक्षा योजना",
      
      "profile.title": "प्रोफ़ाइल और सेटिंग्स",
      "profile.edit": "प्रोफ़ाइल संपादित करें",
      "profile.save": "परिवर्तन सहेजें",
      "profile.cancel": "रद्द करें",
      "profile.language": "पसंदीदा भाषा",
      
      "dashboard.greeting": "सुप्रभात, {{name}} ☀️",
      "dashboard.checkin_prompt": "आज आप कैसा महसूस कर रहे हैं?",
      "dashboard.start_checkin": "चेक-इन शुरू करें",
      
      "common.saving": "सहेजा जा रहा है...",
      "common.saved": "सफलतापूर्वक सहेजा गया",
      "common.error": "सहेजने में असमर्थ — पुनः प्रयास करें"
    }
  },
  bn: {
    translation: {
      "nav.home": "হোম",
      "nav.check_in": "চেক-ইন",
      "nav.journey": "আমার যাত্রা",
      "nav.support": "সমর্থন",
      "nav.messages": "বার্তা",
      "nav.profile": "প্রোফাইল",
      "nav.appointments": "অ্যাপয়েন্টমেন্ট",
      "nav.safety_plan": "নিরাপত্তা পরিকল্পনা",
      
      "profile.title": "প্রোফাইল এবং সেটিংস",
      "profile.edit": "প্রোফাইল সম্পাদনা করুন",
      "profile.save": "পরিবর্তনগুলি সংরক্ষণ করুন",
      "profile.cancel": "বাতিল করুন",
      "profile.language": "পছন্দের ভাষা",
      
      "dashboard.greeting": "সুপ্রভাত, {{name}} ☀️",
      "dashboard.checkin_prompt": "আজ আপনার কেমন লাগছে?",
      "dashboard.start_checkin": "চেক-ইন শুরু করুন",
      
      "common.saving": "সংরক্ষণ করা হচ্ছে...",
      "common.saved": "সফলভাবে সংরক্ষিত হয়েছে",
      "common.error": "সংরক্ষণ করতে অক্ষম — আবার চেষ্টা করুন"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
