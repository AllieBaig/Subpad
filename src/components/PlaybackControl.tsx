import React from 'react';
import { Play } from 'lucide-react';
import { Group } from './SettingsUI';
import { PlaybackSettingsContent } from './PlaybackSettingsContent';

interface PlaybackControlProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const PlaybackControl = ({ isExpanded = false, onToggle = () => {} }: PlaybackControlProps) => {
  return (
    <Group 
      title="Playback Control" 
      icon={Play} 
      color="bg-orange-500/10 text-orange-600"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <PlaybackSettingsContent />
    </Group>
  );
};
