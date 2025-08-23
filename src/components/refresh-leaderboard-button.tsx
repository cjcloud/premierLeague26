'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function RefreshLeaderboardButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Add timestamp to avoid any caching issues
      const timestamp = Date.now();
      
      // Show initial loading toast
      toast({
        title: "Checking data freshness",
        description: "Checking if an update is needed...",
      });
      
      // Use the API endpoint to check if data needs updating
      const checkResponse = await fetch(`/api/v1/teams/check-update?t=${timestamp}`);
      const checkResult = await checkResponse.json();
      const needsUpdate = checkResult.needsUpdate;
      
      if (needsUpdate) {
        // Show updating toast
        toast({
          title: "Refreshing data",
          description: "Fetching the latest Premier League standings...",
        });
        
        // Use the API endpoint instead of directly calling the function
        const updateResponse = await fetch('/api/v1/teams/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await updateResponse.json();
        
        // Instead of using router.refresh() which can cause issues with static generation,
        // use location.reload() to do a full client-side refresh
        window.location.reload();
        
        // Show success toast
        if (result.success) {
          toast({
            title: "Success",
            description: "Premier League data has been refreshed successfully!",
            variant: "default"
          });
        } else {
          toast({
            title: "Refresh failed",
            description: result.error || "Unable to refresh the Premier League data",
            variant: "destructive"
          });
        }
      } else {
        // Data is already fresh - no update needed
        toast({
          title: "Data already up to date",
          description: "Premier League data is already fresh (less than 3 minutes old)",
          variant: "default"
        });
        
        // Use window.location.reload() for consistency
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
      toast({
        title: "Refresh failed",
        description: "Unable to refresh the leaderboard data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-1"
    >
      <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
    </Button>
  );
}
