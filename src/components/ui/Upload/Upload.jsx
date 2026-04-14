import React, { useState, useRef } from 'react';
import { getUploadClasses } from './upload.style';
import { cn } from '@/lib/utils';

const Upload = ({
  color,
  radius,
  padding,
  margin,
  className,
  onFileDrop,
  accept = 'image/*',
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (files.length > 0) {
      setFileName(files[0].name);
      if (onFileDrop) onFileDrop(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  return (
    <div
      className={cn(
        getUploadClasses(color, radius, padding, margin),
        isDragging && 'border-blue-500 bg-blue-50',
        'cursor-pointer',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      <p className="text-gray-500">
        {fileName ? fileName : 'Drag & drop your file here, or click to select'}
      </p>
    </div>
  );
};

export default Upload;
