
import React, { useEffect, useState } from 'react';
import { contactStorage } from '../../src/modules/contact/services/contactStorage';
import { ContactMessage, MessageStatus, ChatLogEntry } from '../../src/modules/contact/types/ContactMessage';
import { userService } from '../../src/services/userService';

const CRM_STATUS_FLOW: { id: MessageStatus, label: string, color: string }[] = [
    { id: 'new', label: 'Nouveau', color: 'bg-red-500' },
    { id: 'assigned', label: 'Assigné', color: 'bg-blue-500' },
    { id: 'processing', label: 'En cours', color: 'bg-orange-500' },
    { id: 'replied', label: 'Traité', color: 'bg-green-500' },
    { id: 'converted', label: 'Converti', color: 'bg-purple-600' },
    { id: 'archived', label: 'Archivé', color: 'bg-slate-400' }
];

const AdminCRM: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [experts] = useState(userService.getAllUsers().filter(u => u.role === 'admin' || u.role === 'premium'));

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    const data = await contactStorage.getMessages();
    setMessages(data);
  };

  const updateMsgStatus = async (id: string, status: MessageStatus) => {
    await contactStorage.updateStatus(id, status);
    load();
    if (selectedMsg?.id === id) setSelectedMsg(prev => prev ? {...prev, status} : null);
  };

  const handleAssign = async (msgId: string, expertId: string) => {
    await contactStorage.assignTo(msgId, expertId);
    load();
    if (selectedMsg?.id === msgId) setSelectedMsg(prev => prev ? {...prev, assignedTo: expertId, status: 'assigned'} : null);
  };

  const handleAddTag = async (id: string, tag: string) => {
    if (!selectedMsg) return;
    const newTags = [...(selectedMsg.tags || []), tag];
    await contactStorage.updateTags(id, newTags);
    load();
    setSelectedMsg({...selectedMsg, tags: newTags});
  };

  const removeTag = async (id: string, tagToRemove: string) => {
    if (!selectedMsg) return;
    const newTags = (selectedMsg.tags || []).filter(t => t !== tagToRemove);
    await contactStorage.updateTags(id, newTags);
    load();
    setSelectedMsg({...selectedMsg, tags: newTags});
  };

  const exportCSV = () => {
    const headers = ["ID", "Date", "Nom", "Email", "Tel", "Sujet", "Status", "Tags", "Expert"];
    const rows = messages.map(m => [
        m.id, 
        new Date(m.createdAt).toLocaleDateString(), 
        m.fullName, 
        m.email, 
        m.phone, 
        m.subject, 
        m.status, 
        (m.tags || []).join('|'),
        m.assignedTo || 'Non assigné'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comptalink_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filtered = messages.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? m.status !== 'archived' : m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-[calc(100vh-4rem)] -m-8 flex flex-col bg-slate-50">
      
      {/* TOOLBAR */}
      <div className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">CRM ComptaLink</h1>
            <p className="text-slate-500 text-sm">{messages.length} leads capturés au total</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input type="text" placeholder="Chercher un lead..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <button onClick={exportCSV} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm" title="Exporter CSV">
                <span className="material-symbols-outlined">download</span>
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LISTE DES LEADS */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white overflow-y-auto ${selectedMsg ? 'hidden md:block' : 'block'}`}>
            <div className="flex gap-1 p-2 bg-slate-50/50 overflow-x-auto no-scrollbar border-b border-slate-100">
                {CRM_STATUS_FLOW.map(s => (
                    <button key={s.id} onClick={() => setFilter(s.id)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === s.id ? `${s.color} text-white shadow-md` : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'}`}>
                        {s.label}
                    </button>
                ))}
                {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-[10px] font-bold text-primary px-2">Réinitialiser</button>}
            </div>
            
            <div className="divide-y divide-slate-100">
                {filtered.map(m => (
                    <div key={m.id} onClick={() => { setSelectedMsg(m); contactStorage.markAsRead(m.id); }} className={`p-4 cursor-pointer hover:bg-slate-50 transition-all border-l-4 ${selectedMsg?.id === m.id ? 'bg-primary/5 border-primary' : 'border-transparent'} ${m.status === 'new' ? 'bg-red-50/20' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-slate-900 text-sm truncate">{m.fullName}</h4>
                            <span className="text-[9px] text-slate-400 font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-2">{m.subject}</p>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${CRM_STATUS_FLOW.find(s => s.id === m.status)?.color || 'bg-slate-300'}`}></div>
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{m.status}</span>
                             {m.tags && m.tags.length > 0 && (
                                 <span className="ml-auto text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded">+{m.tags.length} tags</span>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* DETAIL DU LEAD & CONVERSATION */}
        <div className={`flex-1 bg-white overflow-hidden flex flex-col ${selectedMsg ? 'block' : 'hidden md:flex items-center justify-center text-slate-300'}`}>
            {selectedMsg ? (
                <>
                    {/* Header Detail */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                             <button onClick={() => setSelectedMsg(null)} className="md:hidden p-2 -ml-2 text-slate-400"><span className="material-symbols-outlined">arrow_back</span></button>
                             {/* Fixed: Used selectedMsg.fullName instead of undefined 'm' */}
                             <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl">{selectedMsg.fullName?.charAt(0) || 'L'}</div>
                             <div>
                                <h2 className="text-xl font-black text-slate-900">{selectedMsg.fullName}</h2>
                                <p className="text-sm text-slate-500">{selectedMsg.email} • {selectedMsg.phone}</p>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            <select value={selectedMsg.status} onChange={e => updateMsgStatus(selectedMsg.id, e.target.value as MessageStatus)} className="bg-slate-100 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 outline-none">
                                {CRM_STATUS_FLOW.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        
                        {/* Zone Conversation Chat */}
                        <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-100 overflow-hidden">
                            <div className="p-4 bg-white/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b flex justify-between">
                                <span>Journal des échanges IA</span>
                                <span>{selectedMsg.conversationLogs?.length || 0} messages</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-fixed">
                                {selectedMsg.conversationLogs ? (
                                    selectedMsg.conversationLogs.map((log, idx) => (
                                        <div key={idx} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${log.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                                                <p className="text-sm leading-relaxed">{log.text}</p>
                                                <p className="text-[9px] mt-2 opacity-50 text-right">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl text-center">
                                        <span className="material-symbols-outlined text-amber-500 mb-2">history_toggle_off</span>
                                        <p className="text-sm text-amber-700 font-bold">Aucun log de conversation disponible pour ce message (Ancien format ou formulaire direct).</p>
                                    </div>
                                )}
                            </div>

                            {/* Barre d'action rapide sous le chat */}
                            <div className="p-4 bg-white border-t flex gap-3 items-center">
                                <a href={`mailto:${selectedMsg.email}`} className="px-6 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-lg">reply</span> Répondre par Email
                                </a>
                                <button onClick={() => updateMsgStatus(selectedMsg.id, 'converted')} className="px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-lg">verified</span> Convertir en client
                                </button>
                            </div>
                        </div>

                        {/* Barre Latérale Infos Lead */}
                        <div className="w-80 bg-white p-6 space-y-8 overflow-y-auto custom-scrollbar shrink-0">
                            
                            {/* Assignation */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Expert Assigné</h4>
                                <select 
                                    value={selectedMsg.assignedTo || ''} 
                                    onChange={e => handleAssign(selectedMsg.id, e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Non assigné</option>
                                    {experts.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Segmentation & Tags</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedMsg.tags?.map(t => (
                                        <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg flex items-center gap-1">
                                            {t} <button onClick={() => removeTag(selectedMsg.id, t)} className="hover:text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Nouveau tag..." onKeyDown={e => { if(e.key === 'Enter') { handleAddTag(selectedMsg.id, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] outline-none" />
                                </div>
                            </div>

                            {/* Données Structurées */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Détails de la demande</h4>
                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Sujet Principal</p>
                                        <p className="text-xs font-black text-slate-800 leading-relaxed">{selectedMsg.subject}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Message initial</p>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">"{selectedMsg.message}"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Historique Admin */}
                            <div className="pt-8 border-t border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 mb-1">ID Lead: {selectedMsg.id}</p>
                                <p className="text-[9px] font-bold text-slate-400">Capturé le: {new Date(selectedMsg.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                        <span className="material-symbols-outlined text-4xl">move_to_inbox</span>
                    </div>
                    <p className="text-slate-400 font-bold">Sélectionnez une demande pour voir l'historique complet</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AdminCRM;
