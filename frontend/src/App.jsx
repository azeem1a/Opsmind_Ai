import React, { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatUI from "./components/ChatUI";
import api from "./api/apiClient";

const App = () => {
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem("opsmindStats");
    return savedStats
      ? JSON.parse(savedStats)
      : { totalDocs: 0, totalChunks: 0, queries: 0 };
  });

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    stage: "",
    percentage: 0,
  });
  const [uploadNotification, setUploadNotification] = useState(0);
  const [systemMessage, setSystemMessage] = useState(null);
  const fileInputRef = useRef();

  // Persist stats
  useEffect(() => {
    localStorage.setItem("opsmindStats", JSON.stringify(stats));
  }, [stats]);

  // ✅ Upload handler (fixed)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file already exists
    const isDuplicate = documents.some(doc => doc.name === file.name);
    if (isDuplicate) {
      setSystemMessage({
        type: 'error',
        content: `⚠️ "${file.name}" is already uploaded. Please choose a different file.`
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsProcessing(true);
    const stages = [
      { stage: "Uploading file...", percentage: 15 },
      { stage: "Parsing PDF...", percentage: 30 },
      { stage: "Generating embeddings...", percentage: 55 },
      { stage: "Storing chunks...", percentage: 80 },
      { stage: "Finalizing...", percentage: 95 },
    ];

    let stageTimeouts = [];
    let currentStageIndex = 0;

    const advanceStage = () => {
      if (currentStageIndex < stages.length) {
        setUploadProgress(stages[currentStageIndex]);
        currentStageIndex++;
        if (currentStageIndex < stages.length) {
          const timeout = setTimeout(advanceStage, 1000);
          stageTimeouts.push(timeout);
        }
      }
    };

    setUploadProgress(stages[0]);
    currentStageIndex = 1;
    const initialTimeout = setTimeout(advanceStage, 1000);
    stageTimeouts.push(initialTimeout);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Stop staged progress updates
      stageTimeouts.forEach(clearTimeout);
      setUploadProgress({ stage: "Complete!", percentage: 100 });

      setTimeout(() => {
        // ✅ Update stats
        setStats((prev) => ({
          ...prev,
          totalDocs: prev.totalDocs + 1,
          totalChunks:
            prev.totalChunks + (res.data.totalPages || res.data.totalChunks || 0),
        }));

        // ✅ Add to document list
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };
        setDocuments((prev) => [...prev, newDoc]);

        setUploadNotification((prev) => prev + 1);
        setUploadProgress({ stage: "", percentage: 0 });
      }, 500);
    } catch (err) {
      stageTimeouts.forEach(clearTimeout);
      setUploadProgress({ stage: "", percentage: 0 });
      alert("❌ Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsProcessing(false);
    }
  };

  // ✅ Clear all data
  const handleClear = () => {
    const emptyStats = { totalDocs: 0, totalChunks: 0, queries: 0 };
    setStats(emptyStats);
    setDocuments([]);
    localStorage.setItem("opsmindStats", JSON.stringify(emptyStats));
  };

  // ✅ Delete one document
  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setStats((prev) => ({
      ...prev,
      totalDocs: Math.max(0, prev.totalDocs - 1),
    }));
    if (selectedDocId === id) setSelectedDocId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <Sidebar
          stats={stats}
          onUpload={handleFileUpload} // ✅ fixed name
          onClear={handleClear}
          fileInputRef={fileInputRef}
          isProcessing={isProcessing}
          uploadProgress={uploadProgress}
          documents={documents}
          selectedId={selectedDocId}
          onSelect={setSelectedDocId}
          onDelete={handleDeleteDocument}
        />

        <ChatUI
          stats={stats}
          setStats={setStats}
          uploadNotification={uploadNotification}
          selectedDocId={selectedDocId}
          documents={documents}
          systemMessage={systemMessage}
          setSystemMessage={setSystemMessage}
        />
      </div>
    </div>
  );
};

export default App;
