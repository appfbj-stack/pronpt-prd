import React, { useState, useEffect, useCallback } from 'react';
import { Project, AppView } from './types';
import { generateAppProject } from './services/geminiService';
import { PlusIcon, SparklesIcon, CopyIcon, ArrowLeftIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from './components/Icons';
import { ProjectCard } from './components/ProjectCard';

const App: React.FC = () => {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Form State
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Load projects from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('promptmaster_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Save projects to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('promptmaster_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = useCallback(async () => {
    if (!appName.trim() || !appDescription.trim()) {
      setErrorMsg("Por favor, preencha o nome e a descrição.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const result = await generateAppProject(appName, appDescription);
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: appName,
        description: appDescription,
        fullPrd: result.prd,
        imageUrl: result.imageUrl,
        createdAt: Date.now(),
        modelUsed: 'Gemini 2.5 Flash'
      };

      setProjects(prev => [newProject, ...prev]);
      setAppName('');
      setAppDescription('');
      setIsGenerating(false);
      setSelectedProjectId(newProject.id);
      setView(AppView.DETAILS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao gerar o projeto. Tente novamente.");
      setIsGenerating(false);
    }
  }, [appName, appDescription]);

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setView(AppView.DASHBOARD);
      setSelectedProjectId(null);
      setIsEditing(false);
    }
  };

  const handleStartEdit = (project: Project) => {
    setEditName(project.name);
    setEditDescription(project.description);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
    setEditDescription('');
  };

  const handleSaveEdit = () => {
    if (!selectedProjectId) return;
    if (!editName.trim() || !editDescription.trim()) {
      alert("Nome e descrição não podem ficar vazios.");
      return;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return { ...p, name: editName, description: editDescription };
      }
      return p;
    }));
    setIsEditing(false);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Prompt copiado para a área de transferência!');
  };

  const renderHeader = () => (
    <header className="w-full p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => {
            setView(AppView.DASHBOARD);
            setIsEditing(false);
          }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            PromptMaster AI
          </h1>
        </div>
        {view === AppView.DASHBOARD && (
          <button
            onClick={() => setView(AppView.CREATE)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Projeto
          </button>
        )}
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-bold text-white">Seus Projetos</h2>
        <p className="text-slate-400">Gerencie seus prompts de criação e PRDs.</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <p className="text-slate-500 mb-4">Nenhum projeto criado ainda.</p>
          <button
            onClick={() => setView(AppView.CREATE)}
            className="text-brand-500 hover:text-brand-400 font-medium"
          >
            Criar meu primeiro app
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => {
                setSelectedProjectId(project.id);
                setView(AppView.DETAILS);
                setIsEditing(false);
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCreate = () => (
    <div className="max-w-3xl mx-auto p-6">
      <button 
        onClick={() => setView(AppView.DASHBOARD)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Criar Novo Prompt de App</h2>
        <p className="text-slate-400 mb-8">A IA irá gerar um documento completo (PRD) e um ícone para sua ideia.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nome do App</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Ex: FitTracker, CookMaster..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descreva sua ideia</label>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Ex: Um aplicativo para rastrear exercícios de calistenia, com gráficos de progresso e integração social..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {errorMsg && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleCreateProject}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-bold text-lg transition-all ${
              isGenerating 
                ? 'bg-slate-700 cursor-wait' 
                : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 shadow-lg shadow-brand-900/20'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando PRD e Design...
              </>
            ) : (
              <>
                <SparklesIcon />
                Gerar Magia
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return null;

    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => {
              setView(AppView.DASHBOARD);
              setIsEditing(false);
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Voltar ao Dashboard
          </button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                 <button
                  onClick={() => handleStartEdit(project)}
                  className="flex items-center gap-2 text-brand-400 hover:text-brand-300 p-2 hover:bg-brand-900/20 rounded-lg transition-colors"
                  title="Editar Projeto"
                >
                  <PencilIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir Projeto"
                >
                  <TrashIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Excluir</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Info */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="aspect-square w-full bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-700">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    Sem Imagem
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nome</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none h-32 resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckIcon className="w-4 h-4" /> Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white mb-2">{project.name}</h1>
                  <p className="text-slate-400 text-sm mb-4 break-words">{project.description}</p>
                  <div className="text-xs text-slate-500">
                    Gerado em: {new Date(project.createdAt).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content / PRD */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-150px)]">
              <div className="bg-slate-900/50 border-b border-slate-700 p-4 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  PRD & Prompt Gerado
                </h3>
                <button
                  onClick={() => handleCopyToClipboard(project.fullPrd)}
                  className="flex items-center gap-2 text-xs bg-brand-600/20 text-brand-400 border border-brand-600/50 hover:bg-brand-600/30 px-3 py-1.5 rounded-full transition-colors"
                >
                  <CopyIcon className="w-3 h-3" />
                  Copiar Prompt
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="prose prose-invert prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-300 font-mono text-sm leading-relaxed">
                    {project.fullPrd}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {renderHeader()}
      <main>
        {view === AppView.DASHBOARD && renderDashboard()}
        {view === AppView.CREATE && renderCreate()}
        {view === AppView.DETAILS && renderDetails()}
      </main>
    </div>
  );
};

export default App;