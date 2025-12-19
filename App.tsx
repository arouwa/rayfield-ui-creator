import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, RayfieldTab, UIElement, ElementType, RayfieldWindow } from './types';
import { BuilderCanvas } from './components/BuilderCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { generateLuaScript } from './services/luaGenerator';
import { Icons } from './components/Icons';
import { ScriptBloxModal } from './components/ScriptBloxModal';
import { TemplatesModal } from './components/TemplatesModal';

const DEFAULT_WINDOW: RayfieldWindow = {
  name: "Rayfield UI",
  loadingTitle: "Rayfield Interface Suite",
  loadingSubtitle: "by Sirius",
  configurationSaving: {
    enabled: true,
    folderName: "Rayfield Interface Suite",
    fileName: "Big Hub"
  },
  keySystem: false,
  keySettings: {
    title: "Sirius Hub",
    subtitle: "Key System",
    note: "Join the discord (discord.gg/sirius)",
    fileName: "SiriusKey",
    saveKey: true,
    grabbingKey: "Kopied Key",
    key: "Hello"
  }
};

export default function App() {
  const [state, setState] = useState<AppState>({
    window: DEFAULT_WINDOW,
    tabs: []
  });

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ tabId: string, elId: string } | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showScriptBlox, setShowScriptBlox] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actions
  const addTab = () => {
    const newTab: RayfieldTab = {
      id: uuidv4(),
      name: `Tab ${state.tabs.length + 1}`,
      icon: "",
      elements: []
    };
    setState(prev => ({ ...prev, tabs: [...prev.tabs, newTab] }));
    setActiveTabId(newTab.id);
    setSelectedElement(null);
  };

  const deleteTab = (id: string) => {
      setState(prev => ({...prev, tabs: prev.tabs.filter(t => t.id !== id)}));
      if (activeTabId === id) setActiveTabId(null);
      setSelectedElement(null);
  };

  const addElement = (type: ElementType, customProps: Partial<UIElement> = {}) => {
    if (!activeTabId) {
        alert("Please select a tab first!");
        return;
    }

    const base: any = {
      id: uuidv4(),
      type,
      name: `New ${type}`,
    };

    // Defaults per type
    if (type === 'Button') base.callbackLogic = "";
    if (type === 'Toggle') { base.default = false; base.callbackLogic = ""; }
    if (type === 'Slider') { base.min = 0; base.max = 100; base.default = 50; base.suffix = "%"; base.callbackLogic = ""; }
    if (type === 'Input') { base.placeholder = "Type here..."; base.removeTextAfterFocusLost = false; base.callbackLogic = ""; }
    if (type === 'Paragraph') { base.content = "This is a paragraph description."; }
    if (type === 'Label') { base.color = "#FFFFFF"; }
    if (type === 'Keybind') { base.defaultKey = "K"; base.holdToInteract = false; base.callbackLogic = ""; }
    if (type === 'Dropdown') { base.options = ["Option 1", "Option 2"]; base.defaultOption = "Option 1"; base.multiSelection = false; base.callbackLogic = ""; }

    // Merge custom props
    const finalElement = { ...base, ...customProps };

    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => {
        if (tab.id === activeTabId) {
          return { ...tab, elements: [...tab.elements, finalElement as any as UIElement] };
        }
        return tab;
      })
    }));
  };

  const updateElement = (tabId: string, elId: string, updates: Partial<UIElement>) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => {
        if (tab.id === tabId) {
          return {
            ...tab,
            elements: tab.elements.map(el => el.id === elId ? { ...el, ...updates } as UIElement : el)
          };
        }
        return tab;
      })
    }));
  };

  const deleteElement = (tabId: string, elId: string) => {
      setState(prev => ({
          ...prev,
          tabs: prev.tabs.map(tab => {
              if (tab.id === tabId) {
                  return { ...tab, elements: tab.elements.filter(e => e.id !== elId) };
              }
              return tab;
          })
      }));
      setSelectedElement(null);
  };

  const updateWindow = (updates: Partial<RayfieldWindow>) => {
      setState(prev => ({ ...prev, window: { ...prev.window, ...updates } }));
  };

  const updateTab = (tabId: string, updates: Partial<RayfieldTab>) => {
      setState(prev => ({
          ...prev,
          tabs: prev.tabs.map(tab => tab.id === tabId ? { ...tab, ...updates } : tab)
      }));
  };

  const handleGenerate = () => {
    const code = generateLuaScript(state);
    setGeneratedCode(code);
    setShowCodeModal(true);
  };

  const handleAddScriptFromBlox = (name: string, scriptContent: string) => {
      addElement('Button', {
          name: name,
          callbackLogic: scriptContent
      } as any);
  };

  // --- Project Management & Download ---

  const handleDownloadScript = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Rayfield_Script.lua";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveProject = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `Rayfield_Project_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleLoadProjectClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadProjectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const target = e.target;
        if (target && typeof target.result === 'string') {
             try {
                 const importedState = JSON.parse(target.result);
                 // Basic validation check
                 if (importedState.window && importedState.tabs) {
                     setState(importedState);
                     setActiveTabId(importedState.tabs[0]?.id || null);
                     setSelectedElement(null);
                     // alert("Project loaded successfully!"); 
                 } else {
                     alert("Invalid project file.");
                 }
             } catch (err) {
                 alert("Error parsing project file.");
             }
        }
    };
    reader.readAsText(fileObj);
    // Reset input so same file can be loaded again if needed
    event.target.value = ''; 
  };


  return (
    <div className="flex h-screen w-full bg-[#111] text-white overflow-hidden font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLoadProjectFile} 
        className="hidden" 
        accept=".json"
      />

      {/* Left Sidebar - Palette */}
      <div className="w-16 flex flex-col items-center py-4 gap-4 border-r border-[#333] bg-[#1a1a1a] z-10 overflow-y-auto">
         <div title="Rayfield Builder" className="w-10 h-10 bg-[#448336] rounded-lg flex items-center justify-center font-bold text-white mb-4 shadow-lg shadow-green-900/20 flex-shrink-0">
             R
         </div>
         
         <div className="w-full border-t border-[#333] my-2"></div>
         
         <PaletteButton icon={Icons.Add} label="New Tab" onClick={addTab} highlight />
         <div className="w-full border-t border-[#333] my-2"></div>

         <PaletteButton icon={Icons.Button} label="Button" onClick={() => addElement('Button')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Toggle} label="Toggle" onClick={() => addElement('Toggle')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Slider} label="Slider" onClick={() => addElement('Slider')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Input} label="Input" onClick={() => addElement('Input')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Dropdown} label="Dropdown" onClick={() => addElement('Dropdown')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Keybind} label="Keybind" onClick={() => addElement('Keybind')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Paragraph} label="Paragraph" onClick={() => addElement('Paragraph')} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Label} label="Label" onClick={() => addElement('Label')} disabled={!activeTabId} />

         <div className="w-full border-t border-[#333] my-2"></div>
         <PaletteButton icon={Icons.ScriptBlox} label="ScriptBlox" onClick={() => setShowScriptBlox(true)} disabled={!activeTabId} />
         <PaletteButton icon={Icons.Templates} label="Pre-Scripts" onClick={() => setShowTemplates(true)} disabled={!activeTabId} />

         <div className="w-full border-t border-[#333] my-2"></div>
         <PaletteButton icon={Icons.Save} label="Save Project" onClick={handleSaveProject} />
         <PaletteButton icon={Icons.Upload} label="Load Project" onClick={handleLoadProjectClick} />

         <div className="mt-auto flex flex-col gap-2 mb-4 pt-4">
             <PaletteButton icon={Icons.Code} label="Generate" onClick={handleGenerate} highlight />
         </div>
      </div>

      {/* Main Canvas */}
      <BuilderCanvas 
        tabs={state.tabs} 
        activeTabId={activeTabId} 
        onTabSelect={(id) => { setActiveTabId(id); setSelectedElement(null); }}
        onElementSelect={(tId, eId) => setSelectedElement({ tabId: tId, elId: eId })}
        selectedElementId={selectedElement?.elId || null}
      />

      {/* Right Sidebar - Properties */}
      <PropertiesPanel 
        state={state}
        selectedElement={selectedElement}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onUpdateWindow={updateWindow}
        onUpdateTab={updateTab}
        onDeleteTab={deleteTab}
        activeTabId={activeTabId}
      />

      {/* Modals */}
      {showScriptBlox && <ScriptBloxModal onClose={() => setShowScriptBlox(false)} onAddScript={handleAddScriptFromBlox} />}
      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} onAddTemplate={addElement} />}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-10">
          <div className="bg-[#1e1e1e] w-full max-w-4xl h-3/4 rounded-lg flex flex-col border border-[#333] shadow-2xl">
             <div className="flex justify-between items-center p-4 border-b border-[#333]">
               <h2 className="text-xl font-bold text-white">Generated Lua Code</h2>
               <button onClick={() => setShowCodeModal(false)} className="text-gray-400 hover:text-white">Close</button>
             </div>
             <div className="flex-1 p-0 relative overflow-hidden">
                <textarea 
                  className="w-full h-full bg-[#111] text-green-400 font-mono p-4 resize-none focus:outline-none"
                  readOnly 
                  value={generatedCode} 
                />
             </div>
             <div className="p-4 border-t border-[#333] flex justify-end gap-2 bg-[#252525]">
               <button 
                 onClick={handleDownloadScript} 
                 className="bg-[#252525] border border-[#333] hover:bg-[#333] text-white px-6 py-2 rounded font-bold transition-colors flex items-center gap-2"
               >
                 <Icons.Download size={18} />
                 Download .lua
               </button>
               <button 
                 onClick={() => { navigator.clipboard.writeText(generatedCode); alert('Copied to clipboard!'); }} 
                 className="bg-[#448336] hover:bg-[#3a6f2d] text-white px-6 py-2 rounded font-bold transition-colors"
               >
                 Copy to Clipboard
               </