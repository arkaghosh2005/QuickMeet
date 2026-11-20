import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ParticipantTile from '../../components/ParticipantTile';

// Helper props
const baseParticipant = {
    id: 'user-1',
    name: 'John Doe',
    video: true,
    audio: true,
    isMe: false,
    isHost: false,
};

const getInitials = (name) => name?.charAt(0).toUpperCase() || 'U';

describe('ParticipantTile', () => {
    it('renders participant name', () => {
        render(
            <ParticipantTile
                participant={baseParticipant}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows "(You)" label for local user', () => {
        render(
            <ParticipantTile
                participant={{ ...baseParticipant, isMe: true }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        expect(screen.getByText(/\(You\)/)).toBeInTheDocument();
    });

    it('shows "(Host)" label for host', () => {
        render(
            <ParticipantTile
                participant={{ ...baseParticipant, isHost: true }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        expect(screen.getByText('(Host)')).toBeInTheDocument();
    });

    it('shows mute icon when audio is off', () => {
        const { container } = render(
            <ParticipantTile
                participant={{ ...baseParticipant, audio: false }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        // MicOff icon is inside a red bg-red-600 circle
        const muteIndicator = container.querySelector('.bg-red-600');
        expect(muteIndicator).toBeTruthy();
    });

    it('does not show mute icon when audio is on', () => {
        const { container } = render(
            <ParticipantTile
                participant={{ ...baseParticipant, audio: true }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        const muteIndicator = container.querySelector('.bg-red-600');
        expect(muteIndicator).toBeNull();
    });

    it('always renders video element even when video is off (for audio playback)', () => {
        const getVideoEl = vi.fn(() => <video data-testid="video-el" />);
        render(
            <ParticipantTile
                participant={{ ...baseParticipant, video: false }}
                spanClass=""
                getParticipantVideoElement={getVideoEl}
                getInitials={getInitials}
                isVideoOn={false}
            />
        );
        // The video element must be in the DOM for audio to keep playing
        expect(getVideoEl).toHaveBeenCalled();
        expect(screen.getByTestId('video-el')).toBeInTheDocument();
    });

    it('shows avatar when video is off', () => {
        render(
            <ParticipantTile
                participant={{ ...baseParticipant, video: false }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={false}
            />
        );
        // Avatar shows the initial
        expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('hides avatar when video is on', () => {
        render(
            <ParticipantTile
                participant={{ ...baseParticipant, video: true }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        // The initials circle should NOT be present when video is on
        const initialsInCircle = screen.queryByText('J');
        // J appears in the name label "John Doe", but the avatar circle should not render
        const avatarOverlay = document.querySelector('.bg-gradient-to-br');
        expect(avatarOverlay).toBeNull();
    });

    it('video container is visible when video is on', () => {
        const { container } = render(
            <ParticipantTile
                participant={{ ...baseParticipant, video: true }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={true}
            />
        );
        const videoWrapper = screen.getByTestId('video-el').parentElement;
        expect(videoWrapper.className).toContain('w-full');
        expect(videoWrapper.className).toContain('h-full');
    });

    it('video container is hidden (w-0 h-0) when video is off', () => {
        render(
            <ParticipantTile
                participant={{ ...baseParticipant, video: false }}
                spanClass=""
                getParticipantVideoElement={() => <video data-testid="video-el" />}
                getInitials={getInitials}
                isVideoOn={false}
            />
        );
        const videoWrapper = screen.getByTestId('video-el').parentElement;
        expect(videoWrapper.className).toContain('w-0');
        expect(videoWrapper.className).toContain('h-0');
    });
});
