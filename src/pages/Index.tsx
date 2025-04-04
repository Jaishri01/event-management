
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractDominantColor } from '@/utils/colorExtractor';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

const Index = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardColors, setCardColors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setEvents(data);
        } else {
          console.log('No events found, using dummy data');
          // Fallback to dummy data if no events exist yet
          setEvents([
            {
              id: '1',
              name: "Tech Conference 2025",
              date: new Date("2025-05-15T09:00:00").toISOString(),
              location: "San Francisco Convention Center",
              description: "Annual tech conference featuring the latest innovations and industry leaders.",
              max_attendees: 200,
              current_attendees: 120,
              image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXZlbnR8ZW58MHx8MHx8fDA%3D",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null
            },
            {
              id: '2',
              name: "Music Festival",
              date: new Date("2025-06-20T16:00:00").toISOString(),
              location: "Central Park",
              description: "A weekend of amazing music performances from top artists.",
              max_attendees: 500,
              current_attendees: 350,
              image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29uY2VydHxlbnwwfHwwfHx8MA%3D%3D",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null
            }
          ]);
        }
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

  useEffect(() => {
    // Extract colors from event images
    const extractColors = async () => {
      const colorMap: {[key: string]: string} = {};
      
      for (const event of events) {
        try {
          if (event.image_url) {
            const color = await extractDominantColor(event.image_url);
            colorMap[event.id] = color;
          }
        } catch (error) {
          console.error(`Failed to extract color for event ${event.id}:`, error);
        }
      }
      
      setCardColors(colorMap);
    };
    
    extractColors();
  }, [events]);

  const handleRegister = async (eventId: string) => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please login to register for events.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First check if user is already registered
      const { data: existingRegistration } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', session.session.user.id)
        .single();
        
      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event.",
        });
        return;
      }
      
      // Register user for event
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: session.session.user.id
        });
        
      if (error) throw error;
      
      // Update local state (current_attendees will update automatically via database trigger)
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, current_attendees: event.current_attendees + 1 } 
          : event
      ));
      
      toast({
        title: "Success!",
        description: "You have registered for this event.",
      });
    } catch (error: any) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register for event.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 mt-4">Upcoming Events</h1>
        
        {events.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">No events found</h2>
            <p className="text-gray-600">Check back later for upcoming events or login to create your own!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{ 
                  borderColor: cardColors[event.id] || 'transparent',
                  borderWidth: '2px'
                }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://placehold.co/600x400?text=No+Image'} 
                    alt={event.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                  />
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Date & Time:</span> {formatDate(event.date)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Location:</span> {event.location}
                  </div>
                  <p className="text-sm line-clamp-3 mt-2">{event.description}</p>
                  
                  <div className="text-sm mt-4">
                    <span className="font-medium">Available Seats:</span>{' '}
                    <span className={event.max_attendees - event.current_attendees < 20 ? 'text-red-600 font-semibold' : ''}>
                      {event.max_attendees - event.current_attendees} / {event.max_attendees}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <button
                    className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                    onClick={() => handleRegister(event.id)}
                    disabled={event.current_attendees >= event.max_attendees}
                    style={{ 
                      backgroundColor: event.current_attendees >= event.max_attendees 
                        ? 'rgb(156, 163, 175)' // Gray when disabled
                        : (cardColors[event.id] || 'rgb(79, 70, 229)') // Use extracted color or default
                    }}
                  >
                    {event.current_attendees >= event.max_attendees ? 'Sold Out' : 'Register Now'}
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
