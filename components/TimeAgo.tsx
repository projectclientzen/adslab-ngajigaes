'use client';
import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';

interface TimeAgoProps {
  timestamp: string;
  className?: string;
  prefix?: string; // e.g. "Live " or "Stale · "
}

export function TimeAgo({ timestamp, className, prefix = '' }: TimeAgoProps) {
  const [display, setDisplay] = useState('');
  useEffect(() => { setDisplay(timeAgo(timestamp)); }, [timestamp]);
  return <span className={className}>{prefix}{display}</span>;
}
