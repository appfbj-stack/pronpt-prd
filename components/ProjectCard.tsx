import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-brand-500 transition-all duration-300 hover:shadow-lg hover:shadow-brand-900/20"
    >
      <div className="aspect-square w-full bg-slate-900 relative overflow-hidden">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <span className="text-4xl font-bold opacity-20">{project.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-80" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-lg truncate">{project.name}</h3>
        <p className="text-slate-400 text-sm truncate">{new Date(project.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};