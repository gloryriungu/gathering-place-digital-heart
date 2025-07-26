import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Baby, 
  Shield, 
  Heart,
  Calendar,
  Clock,
  MapPin,
  User
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Ministries = () => {
  const ministries = [
    {
      id: "youth",
      name: "Youth Ministry (Y-Church)",
      icon: Users,
      description: "Empowering the next generation to live boldly for Christ through engaging worship, relevant teaching, and meaningful relationships.",
      ageGroup: "13-18 years",
      schedule: "Sundays 10:00 AM & Fridays 7:00 PM",
      location: "Youth Center",
      leader: "Pastor Mike Johnson",
      highlights: [
        "Weekly youth services with contemporary worship",
        "Small group Bible studies",
        "Community service projects",
        "Annual youth camp and missions trips",
        "Mentorship programs",
        "Life skills workshops"
      ],
      upcomingEvents: [
        "Youth Night - January 15th",
        "Community Service Day - January 22nd",
        "Winter Retreat - February 5-7th"
      ]
    },
    {
      id: "kids",
      name: "Kids Ministry",
      icon: Baby,
      description: "Creating a fun, safe environment where children learn about God's love through age-appropriate activities, games, and Bible stories.",
      ageGroup: "2-12 years",
      schedule: "Sundays 10:00 AM",
      location: "Children's Wing",
      leader: "Pastor Sarah Williams",
      highlights: [
        "Age-appropriate Bible lessons",
        "Interactive worship and songs",
        "Creative arts and crafts",
        "Character building activities",
        "Special holiday programs",
        "Family ministry events"
      ],
      upcomingEvents: [
        "Kids Carnival - January 20th",
        "Parent's Night Out - January 27th",
        "Easter Program Auditions - February 3rd"
      ]
    },
    {
      id: "deliverance",
      name: "Deliverance Ministry",
      icon: Shield,
      description: "Providing spiritual freedom and healing through prayer, counseling, and biblical guidance for those seeking deliverance from spiritual bondage.",
      ageGroup: "Adults",
      schedule: "By appointment & Monthly sessions",
      location: "Prayer Room",
      leader: "Pastor David Thompson",
      highlights: [
        "One-on-one deliverance sessions",
        "Group prayer and healing services",
        "Spiritual warfare training",
        "Inner healing ministry",
        "Biblical counseling",
        "Follow-up care and discipleship"
      ],
      upcomingEvents: [
        "Deliverance Service - January 18th",
        "Inner Healing Workshop - January 25th",
        "Spiritual Warfare Seminar - February 8th"
      ]
    },
    {
      id: "intercession",
      name: "Intercession Ministry",
      icon: Heart,
      description: "Standing in the gap through powerful, focused prayer for our church, community, and nation, believing in the transformative power of prayer.",
      ageGroup: "All ages",
      schedule: "Wednesdays 6:00 AM & Saturdays 6:00 PM",
      location: "Prayer Chapel",
      leader: "Elder Mary Anderson",
      highlights: [
        "Early morning prayer sessions",
        "24/7 prayer chain",
        "Prayer walking in the community",
        "Special prayer events",
        "Prayer partner program",
        "Fasting and prayer retreats"
      ],
      upcomingEvents: [
        "21 Days of Prayer - January 1-21st",
        "Prayer Walk - January 28th",
        "Night of Intercession - February 10th"
      ]
    }
  ];

  const handleJoinMinistry = (ministryId: string) => {
    console.log("Joining ministry:", ministryId);
    // This will be connected to Supabase later
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            MINISTRIES
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover your purpose and grow in faith through our specialized ministries. 
            Each ministry is designed to meet you where you are and help you take the next step in your spiritual journey.
          </p>
        </div>

        {/* Ministries */}
        <div className="space-y-8">
          {ministries.map((ministry) => {
            const IconComponent = ministry.icon;
            
            return (
              <Card key={ministry.id} className="bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 p-3 rounded-lg">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{ministry.name}</CardTitle>
                        <CardDescription className="text-lg mt-1">
                          {ministry.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleJoinMinistry(ministry.id)}
                      className="bg-primary hover:bg-primary/90 shrink-0"
                    >
                      JOIN MINISTRY
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Ministry Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Age Group:</span>
                      <Badge variant="secondary">{ministry.ageGroup}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Schedule:</span>
                      <span className="text-sm text-gray-600">{ministry.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm text-gray-600">{ministry.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Leader:</span>
                      <span className="text-sm text-gray-600">{ministry.leader}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Highlights */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Ministry Highlights
                      </h4>
                      <ul className="space-y-2">
                        {ministry.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></div>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Upcoming Events */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Upcoming Events
                      </h4>
                      <div className="space-y-2">
                        {ministry.upcomingEvents.map((event, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-800">{event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Get Involved?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't see a ministry that fits your calling? We're always open to starting new ministries 
              based on the gifts and passions of our congregation. Contact us to discuss opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                CONTACT MINISTRY LEADER
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                SUGGEST NEW MINISTRY
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Ministries;