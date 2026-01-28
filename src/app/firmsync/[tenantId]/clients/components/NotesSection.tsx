// src/app/firmsync/tenant/[tenantId]/clients/components/NotesSection.tsx
// Client notes with AI summarization and auto-tagging

'use client';

import { useState } from 'react';

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  note_type: 'general' | 'meeting' | 'call' | 'email' | 'task';
  tags: string[];
  ai_summary?: string;
  is_pinned: boolean;
  attachments?: { name: string; url: string }[];
}

interface NotesSectionProps {
  clientId: string;
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'created_at' | 'created_by'>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  aiSummarizationEnabled?: boolean;
  autoTaggingEnabled?: boolean;
}

export function NotesSection({
  clientId,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  aiSummarizationEnabled = false,
  autoTaggingEnabled = false
}: NotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    note_type: 'general' as Note['note_type'],
    tags: [] as string[],
    is_pinned: false
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmitNote = async () => {
    if (!newNote.content.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI processing
    let aiGeneratedTags: string[] = [];
    let aiSummary: string | undefined;

    if (autoTaggingEnabled || aiSummarizationEnabled) {
      // TODO: Replace with actual AI service calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (autoTaggingEnabled) {
        aiGeneratedTags = ['client-communication', 'follow-up', 'important'];
      }
      
      if (aiSummarizationEnabled && newNote.content.length > 200) {
        aiSummary = 'AI Summary: This note discusses client communication regarding case progress and next steps.';
      }
    }

    onAddNote({
      content: newNote.content,
      note_type: newNote.note_type,
      tags: [...newNote.tags, ...aiGeneratedTags],
      ai_summary: aiSummary,
      is_pinned: newNote.is_pinned
    });

    // Reset form
    setNewNote({
      content: '',
      note_type: 'general',
      tags: [],
      is_pinned: false
    });
    setIsAddingNote(false);
    setIsAnalyzing(false);
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case 'call':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const filteredNotes = notes.filter(note => {
    if (filterType === 'all') return true;
    if (filterType === 'pinned') return note.is_pinned;
    return note.note_type === filterType;
  }).sort((a, b) => {
    // Sort pinned notes first, then by date
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6" data-client-id={clientId}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Client Notes</h3>
          <p className="text-sm text-gray-600 mt-1">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} recorded
          </p>
        </div>

        <button
          onClick={() => setIsAddingNote(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          + Add Note
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-gray-200">
          {[
            { key: 'all', label: 'All Notes' },
            { key: 'pinned', label: 'Pinned' },
            { key: 'meeting', label: 'Meetings' },
            { key: 'call', label: 'Calls' },
            { key: 'email', label: 'Emails' },
            { key: 'task', label: 'Tasks' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                filterType === filter.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Note</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                <select
                  value={newNote.note_type}
                  onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value as Note['note_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="task">Task</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newNote.is_pinned}
                    onChange={(e) => setNewNote({ ...newNote, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pin this note</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {(aiSummarizationEnabled || autoTaggingEnabled) && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  {isAnalyzing ? (
                    <>
                      <span className="inline-block animate-pulse">🤖</span> AI is analyzing your note...
                    </>
                  ) : (
                    <>
                      🤖 AI will {autoTaggingEnabled ? 'suggest tags' : ''} 
                      {autoTaggingEnabled && aiSummarizationEnabled ? ' and ' : ''}
                      {aiSummarizationEnabled ? 'generate a summary' : ''} when you save this note.
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNote}
                disabled={!newNote.content.trim() || isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Processing...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">
            {filterType === 'all' ? 'No notes yet' : `No ${filterType} notes`}
          </p>
          <button
            onClick={() => setIsAddingNote(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Add the first note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 border rounded-lg ${
                note.is_pinned 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } transition-colors`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-gray-500">
                    {getNoteTypeIcon(note.note_type)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {note.note_type}
                  </span>
                  {note.is_pinned && (
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString()} by {note.created_by}
                  </span>
                  <button
                    onClick={() => onUpdateNote(note.id, { is_pinned: !note.is_pinned })}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Toggle pin"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
              </div>

              {note.ai_summary && (
                <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h5 className="text-xs font-medium text-blue-900 mb-1">AI Summary</h5>
                  <p className="text-sm text-blue-800">{note.ai_summary}</p>
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {note.attachments && note.attachments.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-xs font-medium text-gray-700 mb-1">Attachments</h5>
                  <div className="flex flex-wrap gap-2">
                    {note.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
