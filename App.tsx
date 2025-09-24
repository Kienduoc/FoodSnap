
import React, { useState, useCallback } from 'react';
import { AppState, UserProfile, AnalysisResult as AnalysisResultType } from './types';
import ProfileForm from './components/ProfileForm';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import { analyzeMeal } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.PROFILE);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState(AppState.UPLOAD);
  };

  const handleImageAnalysis = useCallback(async (file: File) => {
    if (!userProfile) {
      setError("User profile is not set.");
      setAppState(AppState.PROFILE);
      return;
    }
    setImageFile(file);
    setAppState(AppState.ANALYZING);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeMeal(file, userProfile);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
      setAppState(AppState.UPLOAD);
    }
  }, [userProfile]);
  
  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setAnalysisResult(null);
    setError(null);
    setImageFile(null);
  };
  
  const handleEditProfile = () => {
    setAppState(AppState.PROFILE);
    setAnalysisResult(null);
    setError(null);
    setImageFile(null);
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.PROFILE:
        return <ProfileForm onSubmit={handleProfileSubmit} initialProfile={userProfile} />;
      case AppState.UPLOAD:
        return <ImageUploader onAnalyze={handleImageAnalysis} />;
      case AppState.ANALYZING:
        return <LoadingSpinner message="Analyzing your meal..." />;
      case AppState.RESULT:
        return analysisResult && imageFile 
          ? <AnalysisResult result={analysisResult} imageFile={imageFile} onReset={handleReset} onEditProfile={handleEditProfile}/> 
          : <div className="text-center text-red-500">Analysis result is not available.</div>;
      default:
        return <ProfileForm onSubmit={handleProfileSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 transition-all duration-300">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>}
          {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>FoodSnap &copy; 2024. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
