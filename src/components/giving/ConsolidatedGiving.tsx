import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, History, Calendar, CreditCard } from "lucide-react";
import { GivingForm } from "./GivingForm";
import { GivingHistory } from "./GivingHistory";
import { RecurringGivingManager } from "./RecurringGivingManager";
import { SavedPaymentMethods } from "./SavedPaymentMethods";

export const ConsolidatedGiving = () => {
  const [showGivingForm, setShowGivingForm] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("give-now");
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">Giving</h2>
        <p className="text-muted-foreground">
          Manage your contributions, view history, and set up recurring giving
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="give-now" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Give Now</span>
            <span className="sm:hidden">Give</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Recurring</span>
            <span className="sm:hidden">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment Methods</span>
            <span className="sm:hidden">Cards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="give-now" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Give?</CardTitle>
              <CardDescription>
                Join us in partnership as we advance God's kingdom through your generous giving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Every seed you sow makes an eternal difference. Your faithful giving enables us to fulfill our mission of raising champions for Christ.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8"
                  onClick={() => setShowGivingForm(true)}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  GIVE NOW
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 font-bold px-8"
                  onClick={() => navigate('/giving-history')}
                >
                  VIEW FULL GIVING HISTORY
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <GivingHistory />
        </TabsContent>

        <TabsContent value="recurring" className="mt-6">
          <RecurringGivingManager />
        </TabsContent>

        <TabsContent value="payment-methods" className="mt-6">
          <SavedPaymentMethods />
        </TabsContent>
      </Tabs>

      <GivingForm open={showGivingForm} onOpenChange={setShowGivingForm} />
    </div>
  );
};
