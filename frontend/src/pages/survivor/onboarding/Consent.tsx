import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Lock, Eye, AlertCircle } from 'lucide-react';
import api from '../../../api';

export default function Consent() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsent = async () => {
    setIsSubmitting(true);
    try {
      const casesRes = await api.get('/cases/');
      if (casesRes.data && casesRes.data.length > 0) {
        const case_id = casesRes.data[0].id;
        await api.post(`/consents/?case_id=${case_id}`, { consent_type: "DATA_PROCESSING", status: "GRANTED" });
      }
      navigate('/survivor/assessment');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <div className="max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="SWARA Logo" className="h-16 w-auto rounded-lg shadow-sm" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">Your Privacy & Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600 text-center">
              SWARA is designed to support you. Before we begin, please review how we protect and use your information.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <Lock className="w-6 h-6 text-accent-blue shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Secure & Private</h4>
                  <p className="text-sm text-slate-600">Your daily check-ins and wellbeing data are encrypted. We never share your data with unauthorized third parties.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <Eye className="w-6 h-6 text-accent-blue shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Professional Review Only</h4>
                  <p className="text-sm text-slate-600">Only your assigned professional can view your detailed wellbeing trends to provide you better support.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800">Not for Emergencies</h4>
                  <p className="text-sm text-amber-700">SWARA is not an emergency service. If you are in immediate danger, please contact local emergency services.</p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 mt-8 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input id="input_6b157eeb" name="input_6b157eeb" 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-sm text-slate-700">
                I understand and consent to sharing my daily check-in signals with my assigned professional for the purpose of receiving tailored support. I acknowledge this is not an emergency response system.
              </span>
            </label>

            <div className="pt-4 flex gap-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/demo')}>Decline</Button>
              <Button 
                className="w-full" 
                disabled={!agreed || isSubmitting}
                onClick={handleConsent}
              >
                {isSubmitting ? 'Saving...' : 'I Agree, Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
