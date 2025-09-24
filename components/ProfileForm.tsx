
import React, { useState, FormEvent } from 'react';
import { UserProfile, Sex, ActivityLevel, Goal } from '../types';
import { UserIcon } from './icons';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, initialProfile }) => {
  const [profile, setProfile] = useState<Omit<UserProfile, 'user_id'>>({
    sex: initialProfile?.sex || Sex.MALE,
    age: initialProfile?.age || 30,
    height_cm: initialProfile?.height_cm || 175,
    weight_kg: initialProfile?.weight_kg || 70,
    activity_level: initialProfile?.activity_level || ActivityLevel.MODERATE,
    goal: initialProfile?.goal || Goal.MAINTAIN,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'height_cm' || name === 'weight_kg' ? Number(value) : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, user_id would come from auth.
    const completeProfile: UserProfile = { ...profile, user_id: 'user_123' };
    onSubmit(completeProfile);
  };

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Your Health Profile</h1>
            <p className="text-gray-500 mt-2">This helps us personalize your nutrition advice.</p>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input type="number" name="age" id="age" value={profile.age} onChange={handleChange} required min="1" max="120" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
                <select name="sex" id="sex" value={profile.sex} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    {Object.values(Sex).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input type="number" name="height_cm" id="height_cm" value={profile.height_cm} onChange={handleChange} required min="50" max="300" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
                <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input type="number" name="weight_kg" id="weight_kg" value={profile.weight_kg} onChange={handleChange} required min="20" max="500" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700">Activity Level</label>
                <select name="activity_level" id="activity_level" value={profile.activity_level} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    {Object.values(ActivityLevel).map(level => <option key={level} value={level} className="capitalize">{level.replace('_', ' ')}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Primary Goal</label>
                <select name="goal" id="goal" value={profile.goal} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                     {Object.values(Goal).map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                </select>
            </div>
        </div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
          Save & Continue
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
