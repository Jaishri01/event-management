
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractDominantColor } from '@/utils/colorExtractor';

// Placeholder data until we connect to Supabase
const dummyEvents = [
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
];

const Index = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState(dummyEvents);
  const [cardColors, setCardColors] = useState<{[key: number]: string}>({});

  useEffect(() => {
    // Extract colors from event images
    const extractColors = async () => {
      const colorMap: {[key: number]: string} = {};
      
      for (const event of events) {
        try {
          const color = await extractDominantColor(event.imageUrl);
          colorMap[event.id] = color;
        } catch (error) {
          console.error(`Failed to extract color for event ${event.id}:`, error);
        }
      }
      
      setCardColors(colorMap);
    };
    
    extractColors();
  }, [events]);

  const handleRegister = (eventId: number) => {
    // In a real app, this would call a Supabase function
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, currentAttendees: event.currentAttendees + 1 } 
        : event
    ));
    
    toast({
      title: "Success!",
      description: "You have registered for this event.",
    });
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 mt-4">Upcoming Events</h1>
        
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
                  src={event.imageUrl} 
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
                  <span className={event.maxAttendees - event.currentAttendees < 20 ? 'text-red-600 font-semibold' : ''}>
                    {event.maxAttendees - event.currentAttendees} / {event.maxAttendees}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter>
                <button
                  className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                  onClick={() => handleRegister(event.id)}
                  disabled={event.currentAttendees >= event.maxAttendees}
                  style={{ 
                    backgroundColor: event.currentAttendees >= event.maxAttendees 
                      ? 'rgb(156, 163, 175)' // Gray when disabled
                      : (cardColors[event.id] || 'rgb(79, 70, 229)') // Use extracted color or default
                  }}
                >
                  {event.currentAttendees >= event.maxAttendees ? 'Sold Out' : 'Register Now'}
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
