import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronDown, ChevronUp } from 'lucide-react';


// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface NoeticEntry {
  id: number;
  name: string;
  overview: string;
  how_it_works: string;
  how_to_use: string;
  troubleshooting_tips: string;
  created_at: string;
}

interface NoeticEdge {
  id: number;
  entry_id: number;
  edge_name: string;
  color: string;
  about: string;
}

interface EntryWithEdges extends NoeticEntry {
  edges: NoeticEdge[];
  expanded: boolean;
}

const AllList: React.FC = () => {
  const [entries, setEntries] = useState<EntryWithEdges[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
  const fetchEntries = async () => {
    try {
      setLoading(true);
      
      const { data: entriesData, error: entriesError } = await supabase
        .from('noetic_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (entriesError) throw entriesError;
      
      if (!entriesData || entriesData.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const entriesWithEdges: EntryWithEdges[] = await Promise.all(
        entriesData.map(async (entry: NoeticEntry) => {
          const { data: edgesData, error: edgesError } = await supabase
            .from('noetic_edges')
            .select('*')
            .eq('entry_id', entry.id);
          
          if (edgesError) throw edgesError;
          
          return {
            ...entry,
            edges: edgesData || [],
            expanded: false
          };
        })
      );
      
      setEntries(entriesWithEdges);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
    fetchEntries();
  }, []);


  const toggleExpand = (id: number) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, expanded: !entry.expanded } 
        : entry
    ));
  };



  if (loading && entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-40 text-gray-500">
          <p>Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
     
      
      {error && <div className="text-red-600 mt-2">{error}</div>}
      
      <div>
      
        
        {entries.length === 0 ? (
          <div className="text-gray-500 italic">
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(entry.id)}
              >
                <h3 className="text-lg font-medium text-gray-800">{entry.name}</h3>
                <span className="text-gray-500">{entry.expanded ? <ChevronUp/> : <ChevronDown />}</span>
              </div>
              
              {entry.expanded && (
                <div className="p-4 border-t border-gray-200">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-1">Overview:</h4>
                    <p>{entry.overview}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-1">Edges:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse mb-2">
                        <thead>
                          <tr>
                            <th className="bg-gray-100 p-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                              Name
                            </th>
                            <th className="bg-gray-100 p-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                              Color
                            </th>
                            <th className="bg-gray-100 p-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                              About
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.edges.map(edge => (
                            <tr key={edge.id}>
                              <td className="p-2 text-sm text-gray-800 border border-gray-300">
                                {edge.edge_name}
                              </td>
                              <td className="p-2 text-sm text-gray-800 border border-gray-300">
                                <span 
                                  className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: edge.color.toLowerCase() }}
                                ></span>
                                {edge.color}
                              </td>
                              <td className="p-2 text-sm text-gray-800 border border-gray-300">
                                {edge.about}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-1">How It Works:</h4>
                    <p>{entry.how_it_works}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-1">How to Use:</h4>
                    <p>{entry.how_to_use}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-1">Troubleshooting Tips:</h4>
                    <p>{entry.troubleshooting_tips}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllList;