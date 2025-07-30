'use client';

import Button from './Button';

interface BattleModeToggleProps {
    mode: 'single' | 'team';
    setMode: (mode: 'single' | 'team') => void;
}

export default function BattleModeToggle({ mode, setMode }: BattleModeToggleProps) {
    return (
        <div className="inline-flex rounded-lg overflow-hidden border-2 min-h-[50px] w-full max-w-[600px] border-red-600 bg-green-100 shadow-md select-none mb-4">
            <Button
                label="One-on-One"
                isActive={mode === 'single'}
                onClick={() => setMode('single')}
                className="w-1/2"
            />
            <Button
                label="Teams of 3x3"
                isActive={mode === 'team'}
                onClick={() => setMode('team')}
                className="w-1/2"
            />
        </div>
    );
}
