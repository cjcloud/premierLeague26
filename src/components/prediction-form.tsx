'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Team } from '@/db/schema';
import { submitPredictions } from '@/app/predictions/actions';

interface PredictionFormProps {
  teams: Team[];
  initialPredictions: {
    teamId: number;
    predictedPosition: number;
  }[];
}

export function PredictionForm({ teams, initialPredictions }: PredictionFormProps) {
  const [predictions, setPredictions] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<number, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialData = initialPredictions.reduce((acc, p) => {
      acc[p.teamId] = String(p.predictedPosition);
      return acc;
    }, {} as Record<number, string>);
    setPredictions(initialData);
    validatePredictions(initialData);
  }, [initialPredictions]);

  const validatePredictions = (currentPredictions: Record<number, string>) => {
    const newErrors: string[] = [];
    const newFieldErrors: Record<number, string | null> = {};
    const seenPositions = new Map<string, number>();

    // Check for out-of-range values first
    for (const [teamId, positionStr] of Object.entries(currentPredictions)) {
      if (positionStr === '') continue;
      const position = parseInt(positionStr, 10);
      if (isNaN(position) || position < 1 || position > 20) {
        newFieldErrors[parseInt(teamId, 10)] = 'Must be 1-20';
      }
    }

    // Check for duplicates
    for (const [teamId, positionStr] of Object.entries(currentPredictions)) {
      if (positionStr === '') continue;
      if (seenPositions.has(positionStr)) {
        const firstTeamId = seenPositions.get(positionStr)!;
        newFieldErrors[parseInt(teamId, 10)] = 'Position already chosen!';
        newFieldErrors[firstTeamId] = 'Position already chosen!';
      } else {
        seenPositions.set(positionStr, parseInt(teamId, 10));
      }
    }

    setFieldErrors(newFieldErrors);

    // Create summary errors for the bottom section
    const hasDuplicates = Object.values(newFieldErrors).some(e => e === 'Position already chosen!');
    const hasRangeErrors = Object.values(newFieldErrors).some(e => e === 'Must be 1-20');

    if (hasDuplicates) newErrors.push('All positions must be unique.');
    if (hasRangeErrors) newErrors.push('All positions must be between 1 and 20.');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (teamId: number, value: string) => {
    const newPredictions = {
      ...predictions,
      [teamId]: value,
    };
    setPredictions(newPredictions);
    validatePredictions(newPredictions);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validatePredictions(predictions)) {
      return;
    }
    setIsSubmitting(true);

    const predictionsToSubmit = Object.entries(predictions)
      .map(([teamId, position]) => ({
        teamId: parseInt(teamId, 10),
        position: parseInt(position, 10),
      }))
      .filter(p => !isNaN(p.position));

    await submitPredictions(predictionsToSubmit);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Team</TableHead>
              <TableHead>Predicted Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      className={`w-24 ${fieldErrors[team.id] ? 'border-red-500' : ''}`}
                      value={predictions[team.id] || ''}
                      onChange={(e) => handleInputChange(team.id, e.target.value)}
                      required
                    />
                    {fieldErrors[team.id] && (
                      <span className="text-red-500 text-sm font-medium">{fieldErrors[team.id]}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6">
        <Button type="submit" disabled={isSubmitting || errors.length > 0}>
          {isSubmitting ? 'Submitting...' : 'Submit Predictions'}
        </Button>
        {errors.length > 0 && (
          <div className="mt-4 text-red-500">
            <h3 className="font-bold">Please fix the following errors:</h3>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  );
}
