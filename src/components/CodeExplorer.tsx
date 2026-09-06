import React, { useState } from 'react';
import { ALL_ASPNET_FILES } from '../data/aspnet';
import { CodeFile } from '../types';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(ALL_ASPNET_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredFiles = ALL_ASPNET_FILES.filter((f) => {
    if (filterType === 'all') return true;
    if (filterType === 'aspx') return f.type === 'aspx';
    if (filterType === 'csharp') return f.type === 'csharp';
    if (filterType === 'sql') return f.type === 'sql';
    if (filterType === 'config') return f.type === 'config';
    return true;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto my-6 p-6 hub-panel">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/15 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-white">
            ASP.NET WEB FORMS & SQL CODE STUDIO
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Production-ready ASP.NET Web Forms, C# Code-Behind (.cs), SQL Server scripts, and Web.config
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="hub-input text-xs py-1.5 px-3"
          >
            <option value="all">All Files ({ALL_ASPNET_FILES.length})</option>
            <option value="aspx">ASPX Web Forms</option>
            <option value="csharp">C# Code-Behind (.cs)</option>
            <option value="sql">SQL Server Scripts (.sql)</option>
            <option value="config">Web.config</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: File Tree List */}
        <div className="md:col-span-4 space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.name === file.name;
            const badgeColor =
              file.type === 'aspx'
                ? 'bg-amber-500/30 text-amber-200 border-amber-400/40'
                : file.type === 'csharp'
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                : file.type === 'sql'
                ? 'bg-purple-500/30 text-purple-200 border-purple-400/40'
                : 'bg-blue-500/30 text-blue-200 border-blue-400/40';

            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-blue-600/40 border-blue-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-blue-100 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold truncate">{file.name}</span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                    {file.type}
                  </span>
                </div>
                <span className="text-[11px] text-blue-200/70 line-clamp-1">
                  {file.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Code Viewer */}
        <div className="md:col-span-8 bg-black/40 border border-white/15 rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
            <div>
              <div className="font-mono text-sm font-bold text-white">{selectedFile.path}</div>
              <div className="text-xs text-blue-300">{selectedFile.description}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white border border-white/20 transition"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition"
              >
                Download
              </button>
            </div>
          </div>

          <div className="flex-1 max-h-[460px] overflow-auto bg-black/50 p-4 rounded-lg border border-white/10 font-mono text-xs text-blue-100 leading-relaxed">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
