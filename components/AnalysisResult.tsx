
import React, { useState } from 'react';
import { AnalysisResult as AnalysisResultType, Detection, SuitabilityStatus } from '../types';
import { EditIcon, RetryIcon } from './icons';

interface AnalysisResultProps {
  result: AnalysisResultType;
  imageFile: File;
  onReset: () => void;
  onEditProfile: () => void;
}

const SuitabilityCard: React.FC<{ suitability: AnalysisResultType['suitability'], totalKcal: number }> = ({ suitability, totalKcal }) => {
    const getSuitabilityAppearance = () => {
        switch (suitability.status) {
            case SuitabilityStatus.SUITABLE:
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-400',
                    title: 'Looks Good!',
                };
            case SuitabilityStatus.LOW:
                return {
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-400',
                    title: 'A Bit Light',
                };
            case SuitabilityStatus.SLIGHTLY_HIGH:
                return {
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-400',
                    title: 'Slightly High',
                };
            case SuitabilityStatus.HIGH:
            case SuitabilityStatus.VERY_HIGH:
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-400',
                    title: 'On the Higher Side',
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-400',
                    title: 'Meal Summary',
                };
        }
    };
    
    const { bgColor, textColor, borderColor, title } = getSuitabilityAppearance();

    return (
        <div className={`p-6 rounded-xl border ${borderColor} ${bgColor} ${textColor} transition-all duration-300`}>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-5xl font-extrabold mb-4">{totalKcal} <span className="text-2xl font-medium">kcal</span></p>
            <p className="text-base">{suitability.message}</p>
        </div>
    );
};

const DetectionCard: React.FC<{ detection: Detection }> = ({ detection }) => {
    const [showDetails, setShowDetails] = useState(false);
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{detection.label_display}</h3>
                    <p className="text-sm text-gray-500">{detection.estimated_grams}g &bull; {Math.round(detection.confidence * 100)}% confidence</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{detection.estimated_kcal} kcal</p>
                </div>
            </div>
            {detection.top5 && detection.top5.length > 1 && (
                 <button onClick={() => setShowDetails(!showDetails)} className="text-sm text-green-600 hover:text-green-800 mt-2">
                    {showDetails ? 'Hide Alternatives' : 'Show Alternatives'}
                 </button>
            )}
            {showDetails && (
                <div className="mt-3 text-sm text-gray-600">
                    <h4 className="font-semibold mb-1">Other possibilities:</h4>
                    <ul className="list-disc list-inside">
                        {detection.top5.slice(1).map(alt => (
                            <li key={alt.label}>{alt.display} ({Math.round(alt.confidence * 100)}%)</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, imageFile, onReset, onEditProfile }) => {
  const imageUrl = URL.createObjectURL(imageFile);

  return (
    <div className="animate-fade-in space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 text-center">Meal Analysis Complete</h1>
            <p className="text-gray-500 mt-2 text-center">Here's the nutritional breakdown of your meal.</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
           <img src={imageUrl} alt="Analyzed meal" className="w-full h-auto object-cover rounded-xl shadow-lg" />
           <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <h3 className="font-semibold text-gray-700 mb-2">Your Profile</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                    <p><strong>Goal:</strong> <span className="capitalize">{result.user_profile_snapshot.goal}</span></p>
                    <p><strong>TDEE:</strong> {result.user_tdee} kcal</p>
                    <p><strong>Activity:</strong> <span className="capitalize">{result.user_profile_snapshot.activity_level.replace('_', ' ')}</span></p>
                    <p><strong>Meal Target:</strong> {result.meal_target_kcal} kcal</p>
                </div>
                <button onClick={onEditProfile} className="mt-3 text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1">
                    <EditIcon className="h-4 w-4" /> Edit Profile
                </button>
           </div>
        </div>

        <div className="md:col-span-3 space-y-6">
            <SuitabilityCard suitability={result.suitability} totalKcal={result.meal_total_kcal} />
            
            <div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Detected Items</h2>
                 {result.detections.length > 0 ? (
                    <div className="space-y-3">
                    {result.detections.map(d => <DetectionCard key={d.id} detection={d} />)}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center p-4 border border-dashed rounded-lg">No specific food items were detected. The analysis is based on the overall image.</p>
                )}
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 py-3 px-8 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                    <RetryIcon className="h-5 w-5" />
                    Analyze Another Meal
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
