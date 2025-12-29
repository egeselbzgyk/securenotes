import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ 
  className = '', 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#111821] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-lg shadow-primary/20",
    secondary: "bg-[#232a34] text-gray-200 hover:bg-[#2c3542] border border-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-600/20",
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-4 py-2.5 bg-[#232a34] border border-[#323b47] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`} 
    {...props} 
  />
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ 
  isOpen, onClose, title, children 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#182029] border border-[#323b47] rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-[#323b47] flex justify-between items-center bg-[#131920]">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  let strength = 0;
  if (password.length > 6) strength++;
  if (password.length > 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const colors = ['bg-gray-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
  const labels = ['Sehr schwach', 'Schwach', 'Mittel', 'Gut', 'Sehr gut', 'Hervorragend'];
  const textColors = ['text-gray-500', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-green-400'];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 h-1.5 mb-2 w-full">
         {[1,2,3,4,5].map((level) => (
             <div 
               key={level}
               className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? colors[strength] : 'bg-gray-700'}`}
             ></div>
         ))}
      </div>
      <p className={`text-xs mt-1 text-right font-medium ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  );
};