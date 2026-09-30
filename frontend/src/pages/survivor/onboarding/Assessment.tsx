import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import api from '../../../api';

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sleep, setSleep] = useState('');
  const [distress, setDistress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const casesRes = await api.get('/api/cases/');
      if (casesRes.data && casesRes.data.length > 0) {
        const case_id = casesRes.data[0].id;
        
        const distressMap: Record<string, number> = { 'Constantly': 10, 'Often': 8, 'Sometimes': 5, 'Rarely': 3, 'Never': 1 };
        const sleepMap: Record<string, number> = { 'Very Poor': 2, 'Poor': 4, 'Fair': 6, 'Good': 8, 'Excellent': 10 };
        
        await api.post(`/baselines/?case_id=${case_id}`, { 
          avg_distress: distressMap[distress] || 5, 
          avg_sleep: sleepMap[sleep] || 6, 
          activity_level: "Moderate" 
        });
      }
      navigate('/survivor/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-12" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <img src="/logo.png" alt="SWARA Logo" className="h-10 w-auto rounded shadow-sm" />
          <div className="text-sm font-medium text-slate-500">Step {step} of {totalSteps}</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Initial Wellbeing Baseline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-medium text-slate-800">How would you describe your overall sleep quality over the past week?</h3>
                <div className="grid gap-3">
                  {['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'].map(option => (
                    <label key={option} className="flex items-center p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="radio" name="sleep" value={option} checked={sleep === option} onChange={e => setSleep(e.target.value)} className="w-4 h-4 text-primary" />
                      <span className="ml-3">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-medium text-slate-800">How often have you felt overwhelmed or highly distressed recently?</h3>
                <div className="grid gap-3">
                  {['Constantly', 'Often', 'Sometimes', 'Rarely', 'Never'].map(option => (
                    <label key={option} className="flex items-center p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="radio" name="distress" value={option} checked={distress === option} onChange={e => setDistress(e.target.value)} className="w-4 h-4 text-primary" />
                      <span className="ml-3">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-medium text-slate-800">What are your primary goals for this program? (Optional)</h3>
                <textarea 
                  className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="E.g., Better sleep, managing anxiety..."
                />
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button 
                variant="outline" 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                Back
              </Button>
              <Button 
                disabled={isSubmitting}
                onClick={() => {
                  if (step < totalSteps) setStep(s => s + 1);
                  else handleSubmit();
                }}
              >
                {step === totalSteps ? (isSubmitting ? 'Saving...' : 'Complete Profile') : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
