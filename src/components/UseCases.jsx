import React from "react";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Smile, 
  Hand, 
  Brain, 
  Dog, 
  Accessibility, 
  Leaf, 
  Sparkles,
  ArrowLeft 
} from "lucide-react";

const professions = [
  { name: "Doctors", icon: <Stethoscope size={32} />, desc: "General practitioners and specialists." },
  { name: "Dentists", icon: <Smile size={32} />, desc: "Orthodontists and oral hygiene clinics." },
  { name: "Massage Therapists", icon: <Hand size={32} />, desc: "Spa, wellness, and recovery centers." },
  { name: "Therapists & Psychologists", icon: <Brain size={32} />, desc: "Mental health and counseling services." },
  { name: "Veterinarians", icon: <Dog size={32} />, desc: "Animal hospitals and pet care clinics." },
  { name: "Physiotherapists", icon: <Accessibility size={32} />, desc: "Rehabilitation and movement specialists." },
  { name: "Alternative Medicine", icon: <Leaf size={32} />, desc: "Acupuncture, Reiki, and holistic healing." },
  { name: "Dental Hygienists", icon: <Sparkles size={32} />, desc: "Dedicated hygiene and scaling services." },
];

export default function UseCases({ onBack }) {
  return (
    <div className="min-h-screen bg-[#F2EBE3] px-6 py-12 font-sans text-[#1A1A1A]">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#63242B] hover:opacity-70 transition mb-8"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <header className="text-center mb-16">
          <h2 className="text-3xl font-black text-[#63242B] md:text-5xl">
            For Every Medical & Wellness Professional
          </h2>
          <p className="mt-4 text-[#6B635E] font-medium max-w-xl mx-auto">
            Built for professionals across healthcare and wellness industries. 
            Select your field to see how MediBook Pro adapts to your workflow.
          </p>
        </header>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {professions.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-5 p-6 rounded-[24px] bg-[#F8F2EB] border border-[#63242B]/10 shadow-sm hover:shadow-md hover:border-[#63242B]/30 transition-all cursor-pointer group"
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#63242B] text-[#F2EBE3] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">{item.name}</h3>
                <p className="text-sm text-[#6B635E] font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 text-center">
          <button className="rounded-xl bg-[#63242B] px-10 py-4 text-base font-bold text-[#F2EBE3] shadow-lg hover:brightness-110 transition">
            Start Your Free Trial
          </button>
        </footer>
      </div>
    </div>
  );
}
