'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  day: string;
  time: string;
  dish: string;
  image: string;
  multiple?: boolean;
  days?: string[];
}

export default function MenuSelection() {
  const params = useParams();
  const router = useRouter();
  const month = params.month as string;
  
  // Initialize state with localStorage values if they exist
  const [studentId, setStudentId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studentId') || '';
    }
    return '';
  });
  const [studentName, setStudentName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studentName') || '';
    }
    return '';
  });
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studentId') && localStorage.getItem('studentName') ? 1 : 0;
    }
    return 0;
  });
  const [selections, setSelections] = useState<Record<number, boolean | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
  // Modified menu items - simplifying the boiled eggs display
  const menuItems: MenuItem[] = [
    { day: 'Monday', time: 'Night', dish: 'Chicken Curry', image: '/chickencurry.jpg' },
    { day: 'Wednesday', time: 'Night', dish: 'Chicken Curry', image: '/chickencurry.jpg' },
    { day: 'Thursday', time: 'Afternoon', dish: 'Omelette', image: '/omlette.jpg' },
    { day: 'Friday', time: 'Night', dish: 'Mushroom Curry', image: '/mushroomcurry.jpg' },
    { day: 'Saturday', time: 'Afternoon', dish: 'Fish Fry', image: '/fishfry.jpg' },
    { day: 'Sunday', time: 'Morning', dish: 'Bread Omelette', image: '/breadomlette.jpg' },
    { day: 'Sunday', time: 'Afternoon', dish: 'Chicken Curry', image: '/chickencurry.jpg' },
    { 
      day: 'Multiple Days', 
      time: '(M, T, S)', 
      dish: 'Boiled Egg', 
      image: '/boiledeggs.jpg',
      multiple: true,
      days: [
        'M - Afternoon', 
        'T - Night', 
        'S - Night'
      ]
    }
  ];

  // Student info is now loaded directly in the initial state

  // Handle navigation to next menu item
  const goToNext = () => {
    // Only proceed if current item has been answered
    if (selections[currentStep - 1] === undefined) {
      alert('Please select either Yes or No to continue');
      return;
    }
    setDirection('right');
    setCurrentStep(currentStep + 1);
  };

  // Handle navigation to previous menu item
  const goToPrevious = () => {
    if (currentStep > 1) {
      setDirection('left');
      setCurrentStep(currentStep - 1);
    }
  };
  
  const slideVariants = {
    enter: {
      opacity: 0
    },
    center: {
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format the selections for the spreadsheet
      const formattedSelections: Record<string, string> = {};
      
      menuItems.forEach((item, index) => {
        if (item.multiple && item.days) {
          // For multiple days items (boiled eggs)
          item.days.forEach(dayTime => {
            formattedSelections[`${dayTime} - ${item.dish}`] = selections[index] ? 'Yes' : 'No';
          });
        } else {
          formattedSelections[`${item.day} ${item.time} - ${item.dish}`] = selections[index] ? 'Yes' : 'No';
        }
      });
      
      // Submit to the server
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName,
          studentId,
          month: month.charAt(0).toUpperCase() + month.slice(1), // Capitalize first letter
          selections: formattedSelections
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit selections');
      }
      
      // Navigate to confirmation
      router.push('/submission-confirmed');
      
    } catch (err) {
      console.error('Detailed submission error:', err);
      setError((err as Error).message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // First screen for student info
  if (currentStep === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#f6f1e9]/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-[95%] max-w-2xl mx-auto"
        >
          <h1 className="text-4xl text-center font-lobster text-primary mb-3">Extrabite</h1>
          <p className="text-center text-gray-600 mb-6">from the mess representative</p>
          
          <div className="space-y-4">
            <div>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-4 bg-gray-50/80 rounded-xl border-0"
                placeholder="Student Name"
              />
            </div>
            
            <div>
              <input 
                type="text" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-4 bg-gray-50/80 rounded-xl border-0"
                placeholder="Student ID"
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!studentId || !studentName) {
                  setError('Please fill in all fields');
                  return;
                }
                localStorage.setItem('studentId', studentId);
                localStorage.setItem('studentName', studentName);
                setError(null);
                setCurrentStep(1);
              }}
              className="w-full py-4 bg-primary text-white rounded-xl font-medium mt-2"
            >
              Submit
            </motion.button>
            
            <button 
              onClick={() => router.push('/admin')}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium mt-2"
            >
              Admin Login
            </button>
            
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Menu item selection screens
  const currentMenuItem = menuItems[currentStep - 1];
  
  if (currentStep <= menuItems.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { duration: 0.08 }
            }}
            className="bg-[#f6f1e9]/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-[95%] max-w-md mx-auto min-h-[600px] flex flex-col"
          >
            <div>
              <h1 className="text-4xl text-center font-lobster text-primary mb-2">Extrabite</h1>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-orange-500">
                  {currentMenuItem.day} {currentMenuItem.time}
                </h2>
                <span className="text-sm bg-orange-100 px-3 py-1 rounded-full text-orange-600">{currentStep}/{menuItems.length}</span>
              </div>
            </div>
            
            <div className="flex-grow flex flex-col justify-center mb-6">
              <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl">
                <Image
                  src={currentMenuItem.image}
                  alt={currentMenuItem.dish}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-all duration-300 hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-bold text-center text-orange-500 mb-2">{currentMenuItem.dish}</h3>
              
              {currentMenuItem.multiple && currentMenuItem.days && (
                <div className="text-center mb-2">
                  <div className="flex justify-center gap-2">
                    {currentMenuItem.days.map((day, index) => (
                      <span key={index} className="text-sm text-gray-600">{day}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="text-center mb-8">
                <p className="mb-4 text-gray-700 text-lg">
                  {currentMenuItem.multiple 
                    ? `Do you want to have this dish on all listed days?` 
                    : `Do you want to have this dish?`}
                </p>
                
                <div className="space-y-4">
                  <label className={`relative flex items-center p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selections[currentStep - 1] === true ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'}`}>
                    <input
                      type="radio"
                      name={`selection-${currentStep}`}
                      className="absolute opacity-0"
                      checked={selections[currentStep - 1] === true}
                      onChange={() => setSelections({...selections, [currentStep - 1]: true})}
                    />
                    <span className={`w-6 h-6 rounded-full mr-4 flex items-center justify-center ${selections[currentStep - 1] === true ? 'bg-green-500' : 'border-2 border-gray-400'}`}>
                      {selections[currentStep - 1] === true && <span className="w-3 h-3 bg-white rounded-full"></span>}
                    </span>
                    <span className="text-xl">Yes</span>
                  </label>
                  
                  <label className={`relative flex items-center p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selections[currentStep - 1] === false ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'}`}>
                    <input
                      type="radio"
                      name={`selection-${currentStep}`}
                      className="absolute opacity-0"
                      checked={selections[currentStep - 1] === false}
                      onChange={() => setSelections({...selections, [currentStep - 1]: false})}
                    />
                    <span className={`w-6 h-6 rounded-full mr-4 flex items-center justify-center ${selections[currentStep - 1] === false ? 'bg-red-500' : 'border-2 border-gray-400'}`}>
                      {selections[currentStep - 1] === false && <span className="w-3 h-3 bg-white rounded-full"></span>}
                    </span>
                    <span className="text-xl">No</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between gap-4">
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={goToPrevious}
                  className="flex-1 py-4 px-6 bg-gray-100 rounded-xl font-medium text-lg transition-colors hover:bg-gray-200"
                  disabled={currentStep === 1}
                >
                  Previous
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={goToNext}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium text-lg transition-all ${selections[currentStep - 1] !== undefined ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
  
  // Final review screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#f6f1e9]/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-[95%] max-w-md mx-auto min-h-[600px] flex flex-col"
      >
        <div>
          <h1 className="text-4xl text-center font-lobster text-primary mb-2">Extrabite</h1>
          <h2 className="text-xl font-medium text-center mb-6">Review Your Selection</h2>
        </div>
        
        <div className="flex-grow">
          <div className="border border-orange-200 rounded-xl p-4 mb-6 bg-orange-50/50">
            <p><span className="font-medium">Student:</span> {studentName}</p>
            <p><span className="font-medium">ID:</span> {studentId}</p>
            <p><span className="font-medium">Month:</span> {month.charAt(0).toUpperCase() + month.slice(1)}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Selected Items:</h3>
            {Object.entries(selections)
              .filter(([_, selected]) => selected === true)
              .map(([index]) => {
                const item = menuItems[parseInt(index)];
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-green-50"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{item.day} {item.time} - {item.dish}</span>
                  </motion.div>
                );
              })}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentStep(menuItems.length)}
            className="py-4 bg-gray-100 rounded-xl font-medium"
            disabled={isSubmitting}
          >
            Back
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="py-4 bg-primary text-white rounded-xl font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
} 