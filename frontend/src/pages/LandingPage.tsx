import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8 text-center">
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="SWARA Logo" className="h-28 w-auto object-contain drop-shadow-sm" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">SWARA</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Survivor Wellness, Assessment & Rehabilitation from Atrocities
          </p>
        </div>
        
        <div className="pt-4 space-y-4">
          <h2 className="text-lg font-medium text-slate-700">How would you like to continue?</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/auth/survivor"
              className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-accent-blue hover:text-accent-blue transition-colors flex items-center justify-center"
            >
              SURVIVOR
            </Link>
            <Link
              to="/auth/professional"
              className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-accent-blue hover:text-accent-blue transition-colors flex items-center justify-center"
            >
              PROFESSIONAL
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          "From continuous signals to meaningful human attention — without replacing the human touch."
        </p>
      </div>
    </div>
  );
}
