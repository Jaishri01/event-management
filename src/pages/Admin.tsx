import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'current_attendees'>>({
    name: '',
    date: '',
    location: '',
    description: '',
    max_attendees: 0,
    image_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication Required",
          description: "Please login to access the admin panel.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      setUser(data.session.user);
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_attendees' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      description: event.description,
      max_attendees: event.max_attendees,
      image_url: event.image_url || ''
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      max_attendees: 0,
      image_url: ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedEvent(null);
    setImageFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        setUploadProgress(10);
        
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `event-images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('event-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        setUploadProgress(70);
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
        
        setUploadProgress(100);
      }

      const formattedDate = new Date(formData.date).toISOString();
      
      if (selectedEvent?.id) {
        const { error } = await supabase
          .from('events')
          .update({
            name: formData.name,
            date: formattedDate,
            location: formData.location,
            description: formData.description,
            max_attendees: formData.max_attendees,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedEvent.id);
          
        if (error) throw error;
        
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { 
                ...event, 
                name: formData.name,
                date: formattedDate,
                location: formData.location,
                description: formData.description,
                max_attendees: formData.max_attendees,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
              } 
            : event
        ));
        
        toast({
          title: "Success!",
          description: "Event updated successfully.",
        });
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert({
            name: formData.name,
            date: formattedDate,
            location: formData.location,
            description: formData.description,
            max_attendees: formData.max_attendees,
            image_url: imageUrl,
            created_by: user.id,
            current_attendees: 0
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          setEvents([data[0], ...events]);
        }
        
        toast({
          title: "Success!",
          description: "Event created successfully.",
        });
      }

      handleCancel();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save event.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== id));
      
      toast({
        title: "Success!",
        description: "Event deleted successfully.",
      });
      
      if (selectedEvent?.id === id) {
        handleCancel();
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 mt-4">Event Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Events</CardTitle>
                <button
                  onClick={handleCreateNew}
                  className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  Create New
                </button>
              </CardHeader>
              <CardContent>
                {loading && !isEditing ? (
                  <div className="text-center py-4">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-4">No events found. Create your first event!</div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div 
                        key={event.id} 
                        className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedEvent?.id === event.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleSelectEvent(event)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{event.name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString()} • {event.location}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing 
                    ? selectedEvent?.id 
                      ? `Edit: ${selectedEvent.name}` 
                      : 'Create New Event' 
                    : 'Select an event to edit or create a new one'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Event Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-medium">
                        Date & Time *
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="datetime-local"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        Location *
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md min-h-24"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="max_attendees" className="text-sm font-medium">
                        Maximum Attendee Limit *
                      </label>
                      <input
                        id="max_attendees"
                        name="max_attendees"
                        type="number"
                        required
                        min="1"
                        value={formData.max_attendees}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="imageUpload" className="text-sm font-medium">
                        Event Image {selectedEvent?.id && '(Leave empty to keep current image)'}
                      </label>
                      <input
                        id="imageUpload"
                        name="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 border rounded-md"
                      />
                      
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {(imageFile || formData.image_url) && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Preview:</p>
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                            alt="Event preview" 
                            className="w-full max-h-40 object-cover rounded-md" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors disabled:opacity-70"
                      >
                        {loading ? 'Saving...' : selectedEvent?.id ? 'Update Event' : 'Create Event'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Select an event from the list to edit, or click "Create New" to add a new event.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
