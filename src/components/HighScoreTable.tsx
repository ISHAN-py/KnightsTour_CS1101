"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showError } from '@/utils/toast';

interface HighScore {
  id: string;
  player_name: string;
  score: number;
  difficulty_multiplier: number;
  board_size: number;
  created_at: string;
}

interface HighScoreTableProps {
  boardSize: number;
}

const HighScoreTable: React.FC<HighScoreTableProps> = ({ boardSize }) => {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighScores = async () => {
      setLoading(true);
      const tableName = `high_scores_${boardSize}x${boardSize}`;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('score', { ascending: false })
        .limit(10); // Fetch top 10 scores

      if (error) {
        console.error('Error fetching high scores:', error);
        showError('Failed to load high scores.');
      } else {
        setHighScores(data || []);
      }
      setLoading(false);
    };

    fetchHighScores();

    // Set up real-time subscription for high scores
    const channel = supabase
      .channel(`public:${`high_scores_${boardSize}x${boardSize}`}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: `high_scores_${boardSize}x${boardSize}` }, payload => {
        console.log('Change received!', payload);
        fetchHighScores(); // Re-fetch scores on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardSize]);

  return (
    <Card className="w-full max-w-md mt-8 bg-background/80 dark:bg-background/90 shadow-lg dark:shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Top 10 High Scores ({boardSize}x{boardSize})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading high scores...</p>
        ) : highScores.length === 0 ? (
          <p className="text-center text-muted-foreground">No high scores yet. Be the first!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highScores.map((scoreEntry, index) => (
                <TableRow key={scoreEntry.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{scoreEntry.player_name}</TableCell>
                  <TableCell className="text-right">{scoreEntry.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default HighScoreTable;