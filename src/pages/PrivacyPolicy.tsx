import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: "Data Collection",
      content: "This Privacy Policy explains how we collect, use, and protect your information. We collect basic user details such as name, email, and address only to process orders and improve your experience."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "Your data is securely stored and never shared with third parties without consent. We use industry-standard encryption to protect your sensitive information."
    },
    {
      icon: ShieldCheck,
      title: "Terms of Service",
      content: "By using this app, you agree to our privacy practices and terms of service. We aim to ensure a smooth and secure shopping experience for all users."
    }
  ];

  return (
    <div className="min-h-full bg-neutral-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-30 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="bg-neutral-100 p-2 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black tracking-tight">Privacy Policy</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="bg-orange-gradient w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-orange mx-auto">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Your Privacy Matters</h2>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl shadow-premium border border-neutral-100 space-y-3">
              <div className="flex items-center gap-3 text-orange-600">
                <section.icon size={24} />
                <h3 className="font-black text-lg">{section.title}</h3>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed font-medium">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p className="text-orange-800 text-xs text-center font-bold leading-relaxed">
            Last updated: April 2024. For any questions regarding your data, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
