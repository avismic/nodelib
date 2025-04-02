import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trash } from 'lucide-react';


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

const deleteNode = () => {

}

function Admin() {
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
   <>
    {error && <div className="text-red-600 mt-2">{error}</div>}
    {
      entries.length === 0 ? (<div className='w-full h-8 bg-zinc-800 animate-pulse'></div>) : entries.map(entry => {
        return (
          <div key={entry.id} className='bg-white rounded-lg shadow-md mb-4 overflowe-hidden py-3 px-4 flex items-center justify-between'>
            <span>{entry.name}</span>
            <button onClick={deleteNode} type='button' className='cursor-pointer'>
              <Trash/>
            </button>
          </div>
        )
      })
    }
   
   </>
  )
}

export default Admin