'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { shouldUpdateStandings, updateTeamStandings } from '@/lib/api';

export default function RefreshLeaderboardButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
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
      
      // Check if data needs updating
      const needsUpdate = await shouldUpdateStandings(`manual-check-${timestamp}`);
      
      if (needsUpdate) {
        // Show updating toast
        toast({
          title: "Refreshing data",
          description: "Fetching the latest Premier League standings...",
        });
        
        // Perform the update
        const result = await updateTeamStandings(`manual-refresh-${timestamp}`);
        
        // Force a refresh of the page to show new data
        router.refresh();
        
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
        
        // Still refresh the page to ensure we're showing the latest from DB
        router.refresh();
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
