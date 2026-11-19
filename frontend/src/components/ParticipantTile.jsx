import React from 'react';
import { MicOff } from 'lucide-react';

const ParticipantTile = React.memo(({
    participant,
    spanClass,
    tileStyle,
    getParticipantVideoElement,
    getInitials,
    isVideoOn,
}) => {
    return (
        <div
            className={`relative bg-gray-800 rounded-xl overflow-hidden ${!tileStyle ? 'min-h-[120px] sm:min-h-[180px] md:min-h-0' : ''} ${spanClass}`}
            style={tileStyle || {}}
        >
            {isVideoOn && participant.video ? (
                getParticipantVideoElement(participant)
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className={`${isVideoOn ? 'w-16 h-16 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-20 sm:h-20'} bg-gray-600 rounded-full flex items-center justify-center`}>
                        <span className="text-xl sm:text-2xl font-bold text-white">
                            {getInitials(participant.name)}
                        </span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-50 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm max-w-[calc(100%-0.5rem)] truncate">
                {participant.name}
                {participant.isMe && " (You)"}
                {participant.isHost && (
                    <span className="ml-1 text-xs text-blue-400">
                        (Host)
                    </span>
                )}
            </div>

            {!participant.audio && (
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 rounded-full p-1 sm:p-1.5">
                    <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    // Shallow compare tileStyle objects
    const sameStyle = prev.tileStyle === next.tileStyle || (
        prev.tileStyle && next.tileStyle
        && prev.tileStyle.width === next.tileStyle.width
        && prev.tileStyle.maxWidth === next.tileStyle.maxWidth
        && prev.tileStyle.height === next.tileStyle.height
    );

    return prev.participant.id === next.participant.id
        && prev.participant.video === next.participant.video
        && prev.participant.audio === next.participant.audio
        && prev.participant.name === next.participant.name
        && prev.participant.isMe === next.participant.isMe
        && prev.participant.isHost === next.participant.isHost
        && prev.spanClass === next.spanClass
        && prev.isVideoOn === next.isVideoOn
        && sameStyle;
});

ParticipantTile.displayName = 'ParticipantTile';

export default ParticipantTile;

