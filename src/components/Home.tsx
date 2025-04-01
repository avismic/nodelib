import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Initialize Supabase client
const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL|| '';
const supabaseKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY|| '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface EdgeRow {
  id: number;
  name: string;
  color: string;
  about: string;
}

// Color options for the dropdown
const colorOptions = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple"
];

function Home() {
  const [name, setName] = useState<string>('');
  const [overview, setOverview] = useState<string>('');
  const [howItWorks, setHowItWorks] = useState<string>('');
  const [howToUse, setHowToUse] = useState<string>('');
  const [troubleshootingTips, setTroubleshootingTips] = useState<string>('');
  const [numRows, setNumRows] = useState<string>('');
  const [edgeRows, setEdgeRows] = useState<EdgeRow[]>([]);
  const [showEdgeForm, setShowEdgeForm] = useState<boolean>(true);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/admin/signin"); 
    }
    const initializeDatabase = async () => {
      try {
        const { error: entriesError } = await supabase.rpc('create_noetic_entries_if_not_exists');
        if (entriesError) throw entriesError;
        
        const { error: edgesError } = await supabase.rpc('create_noetic_edges_if_not_exists');
        if (edgesError) throw edgesError;
        
        console.log('Database tables initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, []);

  const handleNumRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumRows(e.target.value);
  };

  const generateEdgeRows = () => {
    const num = parseInt(numRows);
    if (!isNaN(num) && num > 0 && num <= 20) {
      const newEdgeRows: EdgeRow[] = [];
      for (let i = 0; i < num; i++) {
        newEdgeRows.push({
          id: i,
          name: '',
          color: colorOptions[0],
          about: ''
        });
      }
      setEdgeRows(newEdgeRows);
      setShowEdgeForm(false);
    } else {
      alert('Please enter a valid number between 1 and 20');
    }
  };

  const handleEdgeRowChange = (id: number, field: keyof EdgeRow, value: string) => {
    const updatedRows = edgeRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setEdgeRows(updatedRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus('');
    navigate('/all-list')
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
  
    if (!session) {
      alert("You must be logged in to add a new entry.");
      setIsLoading(false);
      return;
    }
  
    try {
      const { data: entryData, error: entryError } = await supabase
        .from('noetic_entries')
        .insert([
          { 
            name,
            overview,
            how_it_works: howItWorks,
            how_to_use: howToUse,
            troubleshooting_tips: troubleshootingTips
          }
        ])
        .select();
  
      if (entryError) throw entryError;
  
      const entryId = entryData[0].id;
      
      const edgeInserts = edgeRows.map(edge => ({
        entry_id: entryId,
        edge_name: edge.name,
        color: edge.color,
        about: edge.about
      }));
  
      const { error: edgesError } = await supabase
        .from('noetic_edges')
        .insert(edgeInserts);
  
      if (edgesError) throw edgesError;
  
      console.log('Data saved successfully with ID:', entryId);
      setFormSubmitted(true);
      setSubmitStatus('success');
    } catch (error) {
      console.error('Database error:', error);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  

  const resetForm = () => {
    setName('');
    setOverview('');
    setHowItWorks('');
    setHowToUse('');
    setTroubleshootingTips('');
    setNumRows('');
    setEdgeRows([]);
    setShowEdgeForm(true);
    setFormSubmitted(false);
    setSubmitStatus('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
    {!formSubmitted ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700">name:</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="overview" className="block mb-2 font-medium text-gray-700">overview:</label>
            <textarea 
              id="overview" 
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
              rows={3}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">edges:</label>
            
            {showEdgeForm && (
              <div className="flex items-center mb-4">
                <input 
                  type="number" 
                  placeholder="Number of rows needed" 
                  min="1"
                  max="20"
                  value={numRows}
                  onChange={handleNumRowsChange}
                  className="w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-3"
                />
                <button 
                  type="button" 
                  onClick={generateEdgeRows}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Generate Rows
                </button>
              </div>
            )}

            {!showEdgeForm && (
              <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
                <div className="grid grid-cols-3 gap-2 border-b border-gray-200 bg-gray-100 font-medium">
                  <div className="p-3">name</div>
                  <div className="p-3">color</div>
                  <div className="p-3">about</div>
                </div>
                
                {edgeRows.map((row) => (
                  <div className="grid grid-cols-3 gap-2 border-b border-gray-200 last:border-b-0" key={row.id}>
                    <div className="p-3">
                      <input 
                        type="text" 
                        value={row.name}
                        onChange={(e) => handleEdgeRowChange(row.id, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="p-3">
                      <select
                        value={row.color}
                        onChange={(e) => handleEdgeRowChange(row.id, 'color', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3">
                      <input 
                        type="text" 
                        value={row.about}
                        onChange={(e) => handleEdgeRowChange(row.id, 'about', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                ))}
                
                <div className="p-3">
                  <button 
                    type="button" 
                    onClick={() => setShowEdgeForm(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Reset Rows
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="howItWorks" className="block mb-2 font-medium text-gray-700">how it works:</label>
            <textarea 
              id="howItWorks" 
              value={howItWorks}
              onChange={(e) => setHowItWorks(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
              rows={3}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="howToUse" className="block mb-2 font-medium text-gray-700">how to use:</label>
            <textarea 
              id="howToUse" 
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
              rows={3}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="troubleshootingTips" className="block mb-2 font-medium text-gray-700">troubleshooting tips:</label>
            <textarea 
              id="troubleshootingTips" 
              value={troubleshootingTips}
              onChange={(e) => setTroubleshootingTips(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
              rows={3}
              required
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
            
            {submitStatus === 'error' && (
              <div className="text-red-600 mt-2">
                Error saving data. Please try again.
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Form Submitted Successfully!</h2>
          <p className="text-green-600 mb-6">Data has been saved to the database.</p>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Name:</h3>
            <p>{name}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Overview:</h3>
            <p>{overview}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Edges:</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 p-2 text-left">Name</th>
                  <th className="border border-gray-300 bg-gray-100 p-2 text-left">Color</th>
                  <th className="border border-gray-300 bg-gray-100 p-2 text-left">About</th>
                </tr>
              </thead>
              <tbody>
                {edgeRows.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-gray-300 p-2">{row.name}</td>
                    <td className="border border-gray-300 p-2">{row.color}</td>
                    <td className="border border-gray-300 p-2">{row.about}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">How It Works:</h3>
            <p>{howItWorks}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">How to Use:</h3>
            <p>{howToUse}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Troubleshooting Tips:</h3>
            <p>{troubleshootingTips}</p>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="button" 
              onClick={resetForm}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add Another Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;