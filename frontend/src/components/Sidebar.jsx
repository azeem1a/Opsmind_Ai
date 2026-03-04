import React from 'react';
import {  Upload,  FileText, Trash2, Calendar, Loader } from 'lucide-react';

const DocumentList = ({ documents, selectedId, onSelect, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-2 pr-1">
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${
            selectedId === doc.id
              ? "border-purple-500 bg-purple-50 dark:bg-gray-800/80"
              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/80"
          }`}
        >
          <div className="flex items-start gap-3">
            <FileText
              className={`w-4 h-4 mt-1 flex-shrink-0 ${
                selectedId === doc.id ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`truncate text-sm font-medium ${
                  selectedId === doc.id ? "text-purple-700 dark:text-purple-300" : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {doc.name}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(doc.uploadedAt)}
                </span>
                <span>{formatFileSize(doc.size || 0)}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-900/30 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Sidebar = ({
  stats,
  onUpload,
  onClear,
  fileInputRef,
  isProcessing,
  uploadProgress,
  documents,
  selectedId,
  onSelect,
  onDelete,
}) => {

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-glow overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 space-y-4 overflow-y-auto custom-scroll">

        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="sidebar-card">
            <div className="value">{stats.totalDocs}</div>
            <h4>Docs</h4>
          </div>
          <div className="sidebar-card">
            <div className="value text-blue-400">{stats.totalChunks}</div>
            <h4>Pages</h4>
          </div>
          <div className="sidebar-card">
            <div className="value text-green-400">{stats.queries}</div>
            <h4>Queries</h4>
          </div>
        </div>

        {/* Upload Panel Card */}
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 mt-2 text-center cursor-pointer transition-all duration-300 
            ${isProcessing 
              ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/60 cursor-not-allowed" 
              : "border-gray-300 dark:border-gray-700 hover:border-purple-500 hover:bg-gray-100 dark:hover:bg-gray-800/60"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.md,.txt"
            onChange={onUpload}
            style={{ display: "none" }}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg float">
              <Upload className="w-6 h-6 text-white" />
            </div>
          
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {isProcessing ? "Processing file..." : "Upload or drag a PDF file"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported format: TXT, MD, DOC, DOCX, PDF
              </p>

              {/* Description below box */}
              <p className="text-sm text-gray-600 dark:text-slate-500 mt-6 leading-relaxed text-center">
                Upload your documents to start asking questions. The AI will analyze the content
                and provide relevant answers.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && uploadProgress.stage && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {uploadProgress.percentage < 100 ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : null}
                {uploadProgress.stage}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{uploadProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="progress-bar-fill h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Document List */}
        <div className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">My Documents</h3>
          <DocumentList
            documents={documents}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        </div>
        
      </div>
    </div>
  );
};

export default Sidebar;
