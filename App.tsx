import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Ruler, Weight, Info, RefreshCw, Heart, ChevronDown } from 'lucide-react';
import { WeightUnit, HeightUnit, BmiResult, BmiCategory, BMI_CATEGORIES, HealthTipsResponse } from './types';
import BmiGauge from './components/BmiGauge';
import { getHealthTips } from './services/geminiService';

const App: React.FC = () => {
  // Unit State
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  
  // Inputs
  const [weightMetric, setWeightMetric] = useState<string>('70'); // kg
  const [weightImperial, setWeightImperial] = useState<string>('154'); // lbs
  
  const [heightMetric, setHeightMetric] = useState<string>('170'); // cm
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('7');

  const [result, setResult] = useState<BmiResult | null>(null);
  const [tips, setTips] = useState<HealthTipsResponse | null>(null);
  const [loadingTips, setLoadingTips] = useState<boolean>(false);

  // Handlers for Unit Switching with Conversion
  const handleWeightUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    setResult(null);
    setTips(null);

    if (newUnit === 'lbs') {
      // kg to lbs
      const kg = parseFloat(weightMetric) || 0;
      if (kg > 0) setWeightImperial((kg * 2.20462).toFixed(1));
    } else {
      // lbs to kg
      const lbs = parseFloat(weightImperial) || 0;
      if (lbs > 0) setWeightMetric((lbs / 2.20462).toFixed(1));
    }
  };

  const handleHeightUnitChange = (newUnit: HeightUnit) => {
    if (newUnit === heightUnit) return;
    setHeightUnit(newUnit);
    setResult(null);
    setTips(null);

    if (newUnit === 'ft') {
      // cm to ft/in
      const cm = parseFloat(heightMetric) || 0;
      if (cm > 0) {
        const totalInches = cm / 2.54;
        setHeightFt(Math.floor(totalInches / 12).toString());
        setHeightIn(Math.round(totalInches % 12).toString());
      }
    } else {
      // ft/in to cm
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      if (ft > 0 || inch > 0) {
        const totalInches = (ft * 12) + inch;
        setHeightMetric((totalInches * 2.54).toFixed(1));
      }
    }
  };

  const calculateBMI = useCallback(() => {
    let weightKg = 0;
    let heightM = 0;

    // Weight Conversion
    if (weightUnit === 'kg') {
      weightKg = parseFloat(weightMetric);
    } else {
      const lbs = parseFloat(weightImperial);
      weightKg = lbs * 0.453592;
    }

    // Height Conversion
    if (heightUnit === 'cm') {
      heightM = parseFloat(heightMetric) / 100;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      heightM = ((ft * 12) + inch) * 0.0254;
    }

    if (weightKg > 0 && heightM > 0) {
      const bmiValue = weightKg / (heightM * heightM);
      let category = BmiCategory.Normal;
      let color = BMI_CATEGORIES[1].color;

      if (bmiValue < 18.5) {
        category = BmiCategory.Underweight;
        color = BMI_CATEGORIES[0].color;
      } else if (bmiValue < 25) {
        category = BmiCategory.Normal;
        color = BMI_CATEGORIES[1].color;
      } else if (bmiValue < 30) {
        category = BmiCategory.Overweight;
        color = BMI_CATEGORIES[2].color;
      } else {
        category = BmiCategory.Obese;
        color = BMI_CATEGORIES[3].color;
      }

      setResult({
        bmi: parseFloat(bmiValue.toFixed(1)),
        category,
        color
      });
    } else {
      setResult(null);
    }
  }, [weightUnit, heightUnit, weightMetric, heightMetric, weightImperial, heightFt, heightIn]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateBMI();
    }, 500);
    return () => clearTimeout(timer);
  }, [calculateBMI]);

  // Reset tips only if BMI category changes significantly, not just on minor value tweaks to prevent flickering
  useEffect(() => {
    if (!result) setTips(null);
  }, [result]);

  const fetchInsights = async () => {
    if (!result) return;
    setLoadingTips(true);
    const data = await getHealthTips(result.bmi, result.category);
    setTips(data);
    setLoadingTips(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <Activity className="text-white w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">VitalMetric Pro</h1>
        <p className="mt-2 text-lg text-gray-600 max-w-lg mx-auto">
          Professional grade body mass index calculator with AI-powered health insights.
        </p>
      </header>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Calculator */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
          <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-indigo-600" /> 
              Measurements
            </h2>
          </div>

          <div className="p-8 space-y-8 flex-grow">
            {/* Height Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="block text-sm font-semibold text-gray-700">Height</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => handleHeightUnitChange('cm')}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${heightUnit === 'cm' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                  >
                    CM
                  </button>
                  <button 
                    onClick={() => handleHeightUnitChange('ft')}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${heightUnit === 'ft' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                  >
                    FT
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                   <Ruler className="w-6 h-6" />
                </div>
                {heightUnit === 'cm' ? (
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      value={heightMetric}
                      onChange={(e) => setHeightMetric(e.target.value)}
                      className="block w-full rounded-xl border-gray-300 bg-gray-50 border focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 text-lg font-medium transition-colors outline-none ring-0"
                      placeholder="175"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-medium">cm</span>
                  </div>
                ) : (
                  <div className="flex gap-4 w-full">
                    <div className="relative flex-grow">
                      <input
                        type="number"
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                        className="block w-full rounded-xl border-gray-300 bg-gray-50 border focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 text-lg font-medium outline-none"
                        placeholder="5"
                      />
                      <span className="absolute right-4 top-3.5 text-gray-400 font-medium">ft</span>
                    </div>
                    <div className="relative flex-grow">
                       <input
                        type="number"
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                        className="block w-full rounded-xl border-gray-300 bg-gray-50 border focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 text-lg font-medium outline-none"
                        placeholder="9"
                      />
                      <span className="absolute right-4 top-3.5 text-gray-400 font-medium">in</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weight Input */}
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                <label className="block text-sm font-semibold text-gray-700">Weight</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => handleWeightUnitChange('kg')}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${weightUnit === 'kg' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                  >
                    KG
                  </button>
                  <button 
                    onClick={() => handleWeightUnitChange('lbs')}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${weightUnit === 'lbs' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                  >
                    LBS
                  </button>
                </div>
              </div>

               <div className="flex gap-4 items-center">
                 <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <Weight className="w-6 h-6" />
                 </div>
                 <div className="relative flex-grow">
                    <input
                      type="number"
                      value={weightUnit === 'kg' ? weightMetric : weightImperial}
                      onChange={(e) => weightUnit === 'kg' ? setWeightMetric(e.target.value) : setWeightImperial(e.target.value)}
                      className="block w-full rounded-xl border-gray-300 bg-gray-50 border focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 text-lg font-medium transition-colors outline-none"
                      placeholder={weightUnit === 'kg' ? "70" : "154"}
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-medium uppercase">
                      {weightUnit}
                    </span>
                  </div>
               </div>
            </div>

            {/* Reference Table */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Standard BMI Categories</h3>
              <div className="space-y-2">
                {BMI_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-gray-600 font-medium">{cat.label}</span>
                    </div>
                    <span className="text-gray-400 font-mono">
                      {cat.label === BmiCategory.Obese ? '> 30.0' : `< ${cat.max}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Insights */}
        <div className="flex flex-col gap-6">
          {/* Result Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500"></div>
             
             {result ? (
               <div className="p-8 text-center animate-fade-in-up">
                 <h2 className="text-lg font-semibold text-gray-500 mb-2">Your BMI Score</h2>
                 <div className="flex justify-center items-end gap-2 mb-4">
                   <span className="text-6xl font-bold text-gray-900 tracking-tight">{result.bmi}</span>
                 </div>
                 <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-8" style={{ backgroundColor: `${result.color}20`, color: result.color }}>
                   {result.category}
                 </div>
                 
                 {/* Adjusted container size for new SVG gauge */}
                 <div className="w-full max-w-[300px] mx-auto h-40 mb-2">
                    <BmiGauge bmi={result.bmi} />
                 </div>

                 {/* Action Button for AI */}
                 {!tips && (
                   <button
                    onClick={fetchInsights}
                    disabled={loadingTips}
                    className="mt-6 w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {loadingTips ? (
                       <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analyzing Health Data...
                       </>
                     ) : (
                       <>
                        <Heart className="w-5 h-5" />
                        Get AI Health Insights
                       </>
                     )}
                   </button>
                 )}
               </div>
             ) : (
               <div className="p-12 flex flex-col items-center justify-center h-full text-center text-gray-400 min-h-[400px]">
                 <div className="p-4 bg-gray-50 rounded-full mb-4">
                   <Info className="w-8 h-8 text-gray-300" />
                 </div>
                 <p className="text-lg font-medium">Enter your height and weight to see your result.</p>
               </div>
             )}
          </div>

          {/* AI Insights Card */}
          {tips && (
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl overflow-hidden text-white animate-fade-in-up">
                <div className="p-8">
                  <h3 className="text-2xl font-bold flex items-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-pink-300 fill-pink-300" />
                    Health Insights
                  </h3>
                  
                  <div className="mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <p className="text-indigo-50 leading-relaxed font-medium">
                      {tips.summary}
                    </p>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4">Recommended Actions</h4>
                  <ul className="space-y-3">
                    {tips.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="mt-1 min-w-[20px]">
                          <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-indigo-900 text-xs font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        <span className="text-sm text-indigo-50 leading-snug">{tip}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-4 border-t border-white/10 text-xs text-indigo-200 text-center">
                    AI-generated advice. Consult a doctor for medical decisions.
                  </div>
                  
                  {/* Option to regenerate */}
                  <button 
                    onClick={fetchInsights}
                    className="mt-4 w-full py-2 text-sm text-indigo-200 hover:text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh Insights
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;