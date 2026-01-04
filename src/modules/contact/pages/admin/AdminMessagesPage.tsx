import React, { useEffect, useState } from 'react';
import { contactStorage } from '../../services/contactStorage';
import { siteSettingsStorage } from '../../../../../services/siteSettingsStorage';
import { ContactMessage, MessageStatus, MessageType } from '../../types/ContactMessage';

const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'processing' | 'replied' | 'quote' | 'contact' | 'archived'>('all');
  const [cleanupCount, setCleanupCount] = useState<number | null>(null);
  
  // Workflow state
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replyNote, setReplyNote] = useState('');
  
  // Récupération des paramètres du site pour l'email de contact
  const settings = siteSettingsStorage.getSettings();

  useEffect(() => {
    // 1. Nettoyage automatique au chargement
    const runCleanup = async () => {
      if (settings && settings.messageRetentionDays) {
        // Fix: Await cleanupOldMessages
        const deleted = await contactStorage.cleanupOldMessages(settings.messageRetentionDays);
        if (deleted > 0) setCleanupCount(deleted);
      }
    };

    runCleanup();
    loadMessages();
    // Rafraîchissement périodique
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    // Fix: Await getMessages to get the array
    const all = await contactStorage.getMessages();
    setMessages(all);
  };

  // Logique de filtrage
  const displayMessages = messages.filter(m => {
    if (filter === 'all') return m.status !== 'archived';
    if (filter === 'new') return m.status === 'new';
    if (filter === 'processing') return m.status === 'processing';
    if (filter === 'replied') return m.status === 'replied';
    if (filter === 'archived') return m.status === 'archived';
    
    // Filtre par type
    if (filter === 'quote') return m.type === 'quote' && m.status !== 'archived';
    if (filter === 'contact') return m.type === 'contact' && m.status !== 'archived';
    return true;
  }).sort((a, b) => {
    // Trier par favoris d'abord, puis par date
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Gestionnaire de clic sur la ligne (sécurisé)
  const handleRowClick = async (e: React.MouseEvent, msg: ContactMessage) => {
    // Si on a cliqué sur un bouton ou à l'intérieur d'un bouton, on ne fait rien
    if ((e.target as HTMLElement).closest('button')) {
        return;
    }
    
    setSelectedMessage(msg);
    setIsReplyMode(false);
    setReplyNote('');
    
    if (msg.status === 'new') {
      // Fix: Await markAsRead
      await contactStorage.markAsRead(msg.id);
      // Mise à jour locale pour éviter le scintillement
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
      setSelectedMessage({ ...msg, status: 'read' });
    }
  };

  const handleArchive = async (id: string) => {
    // Fix: Await updateStatus
    await contactStorage.updateStatus(id, 'archived');
    loadMessages();
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    // Arrêt total de la propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }

    if (window.confirm("Voulez-vous vraiment supprimer ce message définitivement ?")) {
      // 1. Suppression dans le stockage
      // Fix: Await deleteMessage
      await contactStorage.deleteMessage(id);
      
      // 2. Mise à jour IMMÉDIATE de l'affichage local (Important)
      setMessages(prevMessages => prevMessages.filter(m => m.id !== id));

      // 3. Si le message supprimé était celui ouvert, on ferme le panneau
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleToggleStar = async (id: string) => {
    // Fix: Await toggleStar
    await contactStorage.toggleStar(id);
    // Update local state immediately
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
    }
  };

  // Workflow Actions
  const handleMarkProcessing = async () => {
    if (selectedMessage) {
        // Fix: Await updateStatus
        await contactStorage.updateStatus(selectedMessage.id, 'processing');
        // Update local
        setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'processing', processedAt: new Date().toISOString() } : m));
        setSelectedMessage({ ...selectedMessage, status: 'processing', processedAt: new Date().toISOString() });
    }
  };

  const handleSubmitReply = async () => {
    if (selectedMessage && replyNote.trim()) {
        // Fix: Await logReply
        await contactStorage.logReply(selectedMessage.id, replyNote);
        const now = new Date().toISOString();
        // Update local
        setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied', repliedAt: now, replyNote: replyNote } : m));
        setSelectedMessage({ 
            ...selectedMessage, 
            status: 'replied', 
            repliedAt: now, 
            replyNote: replyNote 
        });
        setIsReplyMode(false);
    }
  };

  const addQuickNote = (note: string) => {
    setReplyNote(prev => prev ? `${prev}\n${note}` : note);
  };

  // Génération du lien mailto avec template connecté aux paramètres du site
  const getReplyLink = (msg: ContactMessage) => {
    const currentSettings = siteSettingsStorage.getSettings();
    const subject = `Re: ${msg.subject} - ${currentSettings.companyName}`;
    
    let body = `Bonjour ${msg.fullName},\n\n`;
    body += `Nous avons bien reçu votre demande concernant "${msg.subject}".\n\n`;
    
    if (msg.type === 'quote') {
        body += `Nous vous remercions de l'intérêt que vous portez à nos services. Suite à votre demande de devis, ...\n`;
    } else {
        body += `Merci de nous avoir contactés. En réponse à votre message, ...\n`;
    }
    
    // Signature
    body += `\nCordialement,\n\n`;
    body += `L'équipe ${currentSettings.companyName}\n`;
    body += `Email: ${currentSettings.email}\n`;
    body += `Tél: ${currentSettings.phone}\n`;
    body += `${currentSettings.address}`;

    return `mailto:${msg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getTypeBadge = (type: MessageType) => {
    if (type === 'quote') return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Devis</span>;
    return <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Contact</span>;
  };

  const getStatusBadge = (status: MessageStatus) => {
    switch(status) {
        case 'new': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Nouveau</span>;
        case 'processing': return <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">En cours</span>;
        case 'replied': return <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Répondu</span>;
        case 'archived': return <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Archivé</span>;
        default: return null;
    }
  };

  // KPI Temps d'attente
  const getWaitTimeInfo = (createdAt: string, status: MessageStatus) => {
    if (status === 'replied' || status === 'archived') return null;

    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 2) return { text: `${diffDays}j`, color: 'bg-red-100 text-red-700' };
    if (diffDays > 0) return { text: `${diffDays}j`, color: 'bg-orange-100 text-orange-700' };
    if (diffHours > 4) return { text: `${diffHours}h`, color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Nouveau', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 flex flex-col relative">
      
      {/* Cleanup Notification */}
      {cleanupCount !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-base">auto_delete</span>
          <span>Nettoyage auto : {cleanupCount} anciens messages supprimés.</span>
          <button onClick={() => setCleanupCount(null)} className="ml-2 hover:text-slate-300">×</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messagerie</h1>
          <p className="text-slate-500 text-sm">Centralisation des demandes clients.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-slate-50 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Tout' },
            { id: 'new', label: 'Non lus' },
            { id: 'processing', label: 'En cours' },
            { id: 'replied', label: 'Répondus' },
            { id: 'quote', label: 'Devis' },
            { id: 'contact', label: 'Contacts' },
            { id: 'archived', label: 'Archivés' }
          ].map(f => (
            <button 
              key={f.id}
              onClick={() => { setFilter(f.id as any); setSelectedMessage(null); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f.id ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f.label}
              {f.id === 'new' && messages.filter(m => m.status === 'new').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full h-4 inline-flex items-center justify-center">
                  {messages.filter(m => m.status === 'new').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Message List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-slate-200 bg-white overflow-y-auto ${selectedMessage ? 'hidden md:block' : 'block'}`}>
          {displayMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inbox</span>
              <p>Aucun message dans cette vue</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {displayMessages.map(msg => {
                const waitTime = getWaitTimeInfo(msg.createdAt, msg.status);
                return (
                  <li 
                    key={msg.id}
                    onClick={(e) => handleRowClick(e, msg)}
                    className={`group relative p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${selectedMessage?.id === msg.id ? 'bg-blue-50 border-blue-500' : msg.status === 'new' ? 'border-primary bg-white' : msg.status === 'processing' ? 'border-orange-400 bg-orange-50/30' : msg.status === 'replied' ? 'border-green-500 bg-green-50/20' : 'border-transparent bg-slate-50/30'}`}
                  >
                    <div className="flex justify-between items-center mb-2 pr-8">
                      <div className="flex items-center gap-2">
                          {getTypeBadge(msg.type)}
                          {getStatusBadge(msg.status)}
                          {waitTime && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${waitTime.color}`}>
                              {waitTime.text}
                            </span>
                          )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Bouton Star */}
                    <button
                      type="button"
                      onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleStar(msg.id);
                      }}
                      className={`absolute top-3 right-8 p-1.5 rounded-full transition-all z-20 ${msg.isStarred ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300 hover:text-yellow-400 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                      title={msg.isStarred ? "Retirer favori" : "Marquer comme important"}
                    >
                      <span className={`material-symbols-outlined text-lg ${msg.isStarred ? 'fill-current' : ''}`}>star</span>
                    </button>

                    {/* Bouton de suppression rapide */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(msg.id, e)}
                      className="absolute top-3 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all z-50 cursor-pointer"
                      title="Supprimer définitivement"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>

                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm truncate pr-2 ${msg.status === 'new' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.fullName}
                      </h4>
                    </div>
                    <p className={`text-xs mb-1 truncate ${msg.status === 'new' ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {msg.message}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Message Detail */}
        <div className={`flex-1 bg-slate-50 overflow-y-auto p-4 md:p-8 ${selectedMessage ? 'block' : 'hidden md:flex items-center justify-center'}`}>
          {selectedMessage ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto min-h-full flex flex-col">
              
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${selectedMessage.type === 'quote' ? 'bg-blue-500' : 'bg-slate-500'}`}>
                    {getInitials(selectedMessage.fullName)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {selectedMessage.fullName}
                      {getTypeBadge(selectedMessage.type)}
                      {getStatusBadge(selectedMessage.status)}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-slate-500">
                      <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary transition-colors">{selectedMessage.email}</a>
                      {selectedMessage.phone && <span className="hidden sm:inline">•</span>}
                      {selectedMessage.phone && <a href={`tel:${selectedMessage.phone}`} className="hover:text-primary transition-colors">{selectedMessage.phone}</a>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleStar(selectedMessage.id)}
                    className={`p-2 rounded-lg transition-colors ${selectedMessage.isStarred ? 'text-yellow-400 bg-yellow-50' : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-100'}`}
                    title={selectedMessage.isStarred ? "Retirer favori" : "Marquer important"}
                  >
                    <span className={`material-symbols-outlined text-xl ${selectedMessage.isStarred ? 'fill-current' : ''}`}>star</span>
                  </button>
                  {selectedMessage.status !== 'archived' && (
                    <button 
                      onClick={() => handleArchive(selectedMessage.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Archiver"
                    >
                      <span className="material-symbols-outlined text-xl">archive</span>
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleDelete(selectedMessage.id, e)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              {/* Workflow Actions */}
              {(selectedMessage.status === 'new' || selectedMessage.status === 'read' || selectedMessage.status === 'processing') && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-2 items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Workflow</span>
                    <div className="flex gap-2">
                        {(selectedMessage.status === 'new' || selectedMessage.status === 'read') && (
                            <button 
                                onClick={handleMarkProcessing}
                                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">pending</span>
                                Prendre en charge
                            </button>
                        )}
                        <button 
                            onClick={() => setIsReplyMode(!isReplyMode)}
                            className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${isReplyMode ? 'bg-green-600 text-white border-green-600' : 'bg-white border-green-200 text-green-700 hover:bg-green-50'}`}
                        >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Marquer comme répondu
                        </button>
                    </div>
                </div>
              )}

              {/* Reply Note Input with Quick Actions */}
              {isReplyMode && (
                  <div className="p-6 bg-green-50 border-b border-green-100 animate-fade-in">
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        <span className="text-xs font-bold text-green-800 uppercase self-center mr-2">Notes rapides:</span>
                        <button onClick={() => addQuickNote("Devis envoyé par email.")} className="px-2 py-1 bg-white border border-green-200 text-green-700 text-xs rounded hover:bg-green-100 whitespace-nowrap">+ Devis envoyé</button>
                        <button onClick={() => addQuickNote("RDV téléphonique planifié.")} className="px-2 py-1 bg-white border border-green-200 text-green-700 text-xs rounded hover:bg-green-100 whitespace-nowrap">+ RDV planifié</button>
                        <button onClick={() => addQuickNote("Client injoignable, message laissé.")} className="px-2 py-1 bg-white border border-green-200 text-green-700 text-xs rounded hover:bg-green-100 whitespace-nowrap">+ Injoignable</button>
                        <button onClick={() => addQuickNote("Dossier clôturé.")} className="px-2 py-1 bg-white border border-green-200 text-green-700 text-xs rounded hover:bg-green-100 whitespace-nowrap">+ Clôturé</button>
                      </div>
                      
                      <label className="block text-sm font-bold text-green-800 mb-2">Note de réponse interne (résumé) :</label>
                      <textarea 
                        className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none text-sm"
                        rows={3}
                        placeholder="Ex: Devis envoyé par email le 12/05..."
                        value={replyNote}
                        onChange={(e) => setReplyNote(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end gap-2 mt-3">
                          <button onClick={() => setIsReplyMode(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold">Annuler</button>
                          <button onClick={handleSubmitReply} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm">Enregistrer & Clôturer</button>
                      </div>
                  </div>
              )}

              {/* Replied History */}
              {selectedMessage.status === 'replied' && (
                  <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                      <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                          <div>
                              <p className="text-sm font-bold text-green-800">Dossier traité</p>
                              <p className="text-xs text-green-700 mt-1">{selectedMessage.replyNote}</p>
                              <p className="text-[10px] text-green-600/70 mt-1">Le {selectedMessage.repliedAt && new Date(selectedMessage.repliedAt).toLocaleString()}</p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Detail Body */}
              <div className="p-8 flex-1">
                <div className="mb-8 pb-4 border-b border-slate-50">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedMessage.subject}</h3>
                  <p className="text-xs text-slate-400">
                    Reçu le {new Date(selectedMessage.createdAt).toLocaleString()} 
                  </p>
                </div>
                
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Action */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">
                <div className="text-xs text-slate-500 text-right hidden sm:block">
                  Réponse via : <span className="font-bold text-slate-700">{settings.email}</span>
                </div>
                <a 
                  href={getReplyLink(selectedMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 w-full sm:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-lg">reply</span>
                  Répondre par email
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">mark_email_unread</span>
              <p className="text-lg font-medium">Sélectionnez un message pour le lire</p>
              <p className="text-sm opacity-60">Gérez le statut de vos messages pour un meilleur suivi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;