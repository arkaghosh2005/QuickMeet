import React from 'react';
import { MicOff } from 'lucide-react';

const ParticipantTile = React.memo(({
    participant,
    spanClass,
    getParticipantVideoElement,
    getInitials,
    isVideoOn,
}) => {
    return (
        <div
            className={`relative bg-gray-800 rounded-lg overflow-hidden min-h-[200px] sm:min-h-0 ${spanClass}`}
        >
            {isVideoOn && participant.video ? (
                getParticipantVideoElement(participant)
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className={`${isVideoOn ? 'w-24 h-24' : 'w-20 h-20'} bg-gray-600 rounded-full flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">
                            {getInitials(participant.name)}
                        </span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {participant.name}
                {participant.isMe && " (You)"}
                {participant.isHost && (
                    <span className="ml-1 text-xs text-blue-400">
                        (Host)
                    </span>
                )}
            </div>

            {!participant.audio && (
                <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1.5">
                    <MicOff className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    return prev.participant.id === next.participant.id
        && prev.participant.video === next.participant.video
        && prev.participant.audio === next.participant.audio
        && prev.participant.name === next.participant.name
        && prev.participant.isMe === next.participant.isMe
        && prev.participant.isHost === next.participant.isHost
        && prev.spanClass === next.spanClass
        && prev.isVideoOn === next.isVideoOn;
});

ParticipantTile.displayName = 'ParticipantTile';

export default ParticipantTile;

