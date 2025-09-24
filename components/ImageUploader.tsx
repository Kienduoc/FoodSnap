
import React, { useState, ChangeEvent, DragEvent } from 'react';
import { CameraIcon, UploadIcon } from './icons';

interface ImageUploaderProps {
  onAnalyze: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyze }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };
  
  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       processFile(e.dataTransfer.files[0]);
    }
  };


  const handleAnalyzeClick = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };
  
  const handleClear = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
  }

  return (
    <div className="text-center animate-fade-in">
       <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
         <CameraIcon className="h-8 w-8 text-green-600" />
       </div>
       <h1 className="text-3xl font-bold text-gray-800">Analyze Your Meal</h1>
       <p className="text-gray-500 mt-2 mb-8">Upload a photo to get a detailed nutritional breakdown.</p>
      
      {!previewUrl ? (
        <div 
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative block w-full border-2 ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'} border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300`}>
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Drag & drop a photo, or
          </span>
           <label htmlFor="file-upload" className="font-medium text-green-600 hover:text-green-500 cursor-pointer">
              click to upload
            </label>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <img src={previewUrl} alt="Meal preview" className="max-h-80 w-auto mx-auto rounded-lg shadow-md" />
          <div className="flex justify-center space-x-4">
            <button
                onClick={handleClear}
                className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                Change Photo
            </button>
            <button
              onClick={handleAnalyzeClick}
              disabled={!selectedFile}
              className="py-3 px-8 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition-colors duration-300"
            >
              Analyze Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
