
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import supabase from '@/lib/supabase';

interface Event {
  id?: number;
  name: string;
  date: string;
  location: string;
  description: string;
  maxAttendees: number;
  currentAttendees: number;
  imageUrl: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Event>({
    name: '',
    date: '',
    location: '',
    description: '',
    maxAttendees: 0,
    currentAttendees: 0,
    imageUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Placeholder fetch events function - will be replaced with Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // In a real app, this would fetch from Supabase
        // const { data, error } = await supabase.from('events').select('*');
        
        // Placeholder data until Supabase is fully connected
        setEvents([
          {
            id: 1,
            name: "Tech Conference 2025",
            date: "2025-05-15T09:00:00",
            location: "San Francisco Convention Center",
            description: "Annual tech conference featuring the latest innovations and industry leaders.",
            maxAttendees: 200,
            currentAttendees: 120,
            imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXZlbnR8ZW58MHx8MHx8fDA%3D"
          },
          {
            id: 2,
            name: "Music Festival",
            date: "2025-06-20T16:00:00",
            location: "Central Park",
            description: "A weekend of amazing music performances from top artists.",
            maxAttendees: 500,
            currentAttendees: 350,
            imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29uY2VydHxlbnwwfHwwfHx8MA%3D%3D"
          }
        ]);
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

    fetchEvents();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData(event);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      maxAttendees: 0,
      currentAttendees: 0,
      imageUrl: ''
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
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Handle image upload if a new file is selected
      if (imageFile) {
        // In a real app, this would upload to Supabase Storage
        // For now, let's use a placeholder URL
        imageUrl = URL.createObjectURL(imageFile);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 300);
      }

      // Create or update event
      const updatedEvent = {
        ...formData,
        imageUrl,
      };

      if (selectedEvent?.id) {
        // Update existing event
        // In a real app: await supabase.from('events').update(updatedEvent).eq('id', selectedEvent.id);
        
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? { ...updatedEvent, id: selectedEvent.id } : event
        ));
        
        toast({
          title: "Success!",
          description: "Event updated successfully.",
        });
      } else {
        // Create new event
        // In a real app: const { data } = await supabase.from('events').insert(updatedEvent).select();
        
        const newEvent = {
          ...updatedEvent,
          id: Math.max(0, ...events.map(e => e.id || 0)) + 1,
        };
        
        setEvents([...events, newEvent]);
        
        toast({
          title: "Success!",
          description: "Event created successfully.",
        });
      }

      // Reset form
      handleCancel();
    } catch (error: any) {
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

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setLoading(true);
    
    try {
      // In a real app: await supabase.from('events').delete().eq('id', id);
      
      setEvents(events.filter(event => event.id !== id));
      
      toast({
        title: "Success!",
        description: "Event deleted successfully.",
      });
      
      if (selectedEvent?.id === id) {
        handleCancel();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 mt-4">Event Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Event List */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Events</CardTitle>
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
          
          {/* Event Form */}
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
                      <label htmlFor="maxAttendees" className="text-sm font-medium">
                        Maximum Attendee Limit *
                      </label>
                      <input
                        id="maxAttendees"
                        name="maxAttendees"
                        type="number"
                        required
                        min="1"
                        value={formData.maxAttendees}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="currentAttendees" className="text-sm font-medium">
                        Current Attendees Count
                      </label>
                      <input
                        id="currentAttendees"
                        name="currentAttendees"
                        type="number"
                        min="0"
                        value={formData.currentAttendees}
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
                      
                      {(imageFile || formData.imageUrl) && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Preview:</p>
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl} 
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
