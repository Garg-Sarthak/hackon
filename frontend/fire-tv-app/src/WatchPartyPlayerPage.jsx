
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Chat from './Chat';

const BACKEND_API_URL = "http://localhost:8080";
const WEBSOCKET_URL = "ws://localhost:8080";
const HARDCODED_USER_ID = "user_" + Math.random().toString(36).substr(2, 9);

function WatchPartyPlayerPage() {
  const { videoId: initialVideoIdFromUrl, partyId: currentPartyIdFromUrl } = useParams();
  const navigate = useNavigate();

  // Use state for partyId and initialVideoId to manage transitions
  const [currentPartyId, setCurrentPartyId] = useState(currentPartyIdFromUrl);
  const [initialVideoId, setInitialVideoId] = useState(initialVideoIdFromUrl);

  const [partyDetails, setPartyDetails] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [showShareableUrl, setShowShareableUrl] = useState(''); // To display the URL

  const playerRef = useRef(null);
  const ws = useRef(null);

  const isHost = partyDetails && partyDetails.hostId === HARDCODED_USER_ID;
  
  // Determine videoUrl based on partyDetails or initialVideoId
  const videoUrl = partyDetails ? "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : 
    partyDetails ? `/videos/${partyDetails.mediaId}.mp4` // If in a party, use party's mediaId
    : initialVideoId 
      ? `/videos/${initialVideoId}.mp4` // If solo viewing, use initialVideoId
      : "https://www.w3schools.com/html/mov_bbb.mp4"; // Fallback

  // Effect to update currentPartyId from URL params
  useEffect(() => {
    setCurrentPartyId(currentPartyIdFromUrl);
    if (!currentPartyIdFromUrl) { // If navigating away from a party URL
        setPartyDetails(null);
        setShowShareableUrl('');
        ws.current?.close(); // Clean up WebSocket if no longer in a party
    }
  }, [currentPartyIdFromUrl]);

  // Effect to update initialVideoId from URL params (for solo view)
  useEffect(() => {
    setInitialVideoId(initialVideoIdFromUrl);
    if (initialVideoIdFromUrl && !currentPartyIdFromUrl) {
      // Reset party state if navigating to a solo video page
      setPartyDetails(null);
      setShowShareableUrl('');
      ws.current?.close();
    }
  }, [initialVideoIdFromUrl, currentPartyIdFromUrl]);


  // Fetch party details if partyId is in URL
  useEffect(() => {
    if (currentPartyId) {
      console.log("Fetching party details for:", currentPartyId);
      fetch(`${BACKEND_API_URL}/party/${currentPartyId}`)
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) throw new Error('Party not found or has expired. The link may be invalid.');
            throw new Error('Failed to fetch party details');
          }
          return res.json();
        })
        .then(data => {
          setPartyDetails(data);
          // IMPORTANT: Only set showShareableUrl if the current user is the host
          // And only if they just landed on this page (i.e., partyDetails was previously null)
          if (data.hostId === HARDCODED_USER_ID && !partyDetails) { 
            setShowShareableUrl(`${window.location.origin}/party/${currentPartyId}`);
          }
        })
        .catch(err => {
          console.error("Error fetching party details:", err);
          alert(err.message);
          navigate('/'); 
        });
    } else {
      // Not in a party, clear party-specific state
      setPartyDetails(null);
      setShowShareableUrl('');
    }
  }, [currentPartyId, navigate]); // Removed partyDetails from deps to avoid re-fetch if partyDetails changes by WS

  // WebSocket connection (depends on currentPartyId and partyDetails being available)
  useEffect(() => {
    if (currentPartyId && partyDetails) { 
      console.log(`Attempting to connect to WebSocket for party: ${currentPartyId}, user: ${HARDCODED_USER_ID}`);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        // If already connected and partyId/details change (shouldn't happen often unless navigating between parties)
        ws.current.close();
      }
      
      ws.current = new WebSocket(`${WEBSOCKET_URL}/ws?partyId=${currentPartyId}&userId=${HARDCODED_USER_ID}`);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setChatMessages([{ special: true, text: "Connected to watch party!" }]);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WS Message received:", data);

          if (data.type === 'controls') {
            if (data.message === 'play') setIsPlaying(true);
            else if (data.message === 'pause') setIsPlaying(false);
            else if (data.message === 'seek' && playerRef.current && data.timestamp !== undefined) {
              const newTime = parseFloat(data.timestamp);
              const duration = playerRef.current.getDuration();
              if (duration) {
                playerRef.current.seekTo(newTime, 'seconds');
                setPlayed(newTime / duration);
              }
            } else if (data.message === 'party_ended_by_host') {
              alert("Party has been ended by the host.");
              ws.current?.close();
              navigate('/');
            }
          } else if (data.type === 'chat') {
            setChatMessages(prev => [...prev, { userId: data.userId, text: data.message, id: Math.random() }]); // Add unique ID for keys
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error, "Raw data:", event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
        setChatMessages(prev => [...prev, { special: true, text: "Disconnected from watch party." }]);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setChatMessages(prev => [...prev, { special: true, text: "WebSocket connection error." }]);
      };

      return () => {
        console.log("Cleaning up WebSocket connection for party:", currentPartyId);
        ws.current?.close();
      };
    }
  }, [currentPartyId, partyDetails, navigate]); // partyDetails is crucial here


  const handleCreateParty = async () => {
    // Use initialVideoIdFromUrl here as initialVideoId state might not be updated yet if coming from different page
    if (!initialVideoIdFromUrl) { 
      alert("Please select a video first (no videoId found in URL).");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_API_URL}/party`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: initialVideoIdFromUrl, hostId: HARDCODED_USER_ID }),
      });
      if (!response.ok) throw new Error('Failed to create party');
      const data = await response.json();
      // Navigate to the new party URL. This will trigger the useEffect for partyId
      navigate(`/party/${data.id}`);
    } catch (err) {
      console.error("Error creating party:", err);
      alert(err.message);
    }
  };

  const sendWsMessage = (type, payload) => { // Renamed to payload for clarity
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, ...payload }));
    }
  };

  // --- Player Event Handlers ---
  const handlePlay = () => {
    if (!isPlaying && isVideoReady) {
      setIsPlaying(true);
      if (currentPartyId) sendWsMessage('controls', { message: 'play' });
    }
  };

  const handlePause = () => {
    if (isPlaying && isVideoReady) {
      setIsPlaying(false);
      if (currentPartyId) sendWsMessage('controls', { message: 'pause' });
    }
  };
  
  // handleSeek is now triggered by onMouseUp of the range input
  const handleSeekFromRange = (newPlayedValue) => {
    if (playerRef.current && isVideoReady) {
        const duration = playerRef.current.getDuration();
        if (duration) {
            const newTimeInSeconds = newPlayedValue * duration;
            playerRef.current.seekTo(newTimeInSeconds, 'seconds');
            // No need to setPlayed here as onProgress will update it, or if it's an issue, set it.
            if (currentPartyId) sendWsMessage('controls', { message: 'seek', timestamp: newTimeInSeconds });
        }
    }
  };

  const handleProgress = (state) => {
    if (!seeking && isVideoReady) {
      setPlayed(state.played); // state.played is 0-1
    }
  };
  
  const handleReady = useCallback(() => {
    console.log("Player ready");
    setIsVideoReady(true);
    // Initial sync logic is now more robustly handled after partyDetails are fetched and WS connected
    // If we are joining an existing party, partyDetails will have a timestamp.
    if (currentPartyId && partyDetails && playerRef.current) {
        const duration = playerRef.current.getDuration();
        if (duration) {
            console.log("Video ready, syncing to party state:", partyDetails);
            playerRef.current.seekTo(partyDetails.timestamp, 'seconds');
            setPlayed(partyDetails.timestamp / duration);
            setIsPlaying(partyDetails.playbackState === 'playing');
        } else {
            console.warn("Player ready but duration is not available yet for initial sync.");
        }
    } else if (!currentPartyId && initialVideoId && playerRef.current) {
        // Solo viewing, reset player state
        console.log("Video ready for solo view.");
        setPlayed(0);
        setIsPlaying(false); // Or true if you want autoplay for solo
    }
  }, [currentPartyId, partyDetails, initialVideoId]);


  // Conditional rendering logic
  let content;
  if (currentPartyId && !partyDetails) {
    content = <div>Loading party details...</div>;
  } else if (!videoUrl && !initialVideoId) { // Adjusted to check both
    content = <div>No video selected or party specified. Please select a video from the home page.</div>;
  } else {
    content = (
      <div>
        <h1>Watch Party Player</h1>
        <p>Your User ID: {HARDCODED_USER_ID}</p>
        {currentPartyId && partyDetails && (
            <>
                <p>Party ID: {currentPartyId} (Host: {partyDetails.hostId})</p>
                {showShareableUrl && isHost && (
                    <div style={{margin: '10px 0', padding: '10px', border: '1px solid green'}}>
                        Share this URL with friends: <strong>{showShareableUrl}</strong>
                        <button onClick={() => navigator.clipboard.writeText(showShareableUrl)} style={{marginLeft: '10px'}}>Copy URL</button>
                    </div>
                )}
            </>
        )}

        <div style={{ display: 'flex' }}>
          <div style={{ flex: 3, marginRight: '20px' }}>
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={isPlaying}
              controls={!currentPartyId}
              onReady={handleReady}
              onPlay={handlePlay}
              onPause={handlePause}
              // onSeek is now handled by the custom range input
              onProgress={handleProgress}
              width="100%"
              height="auto"
              onError={(e) => console.error('ReactPlayer Error:', e, 'URL:', videoUrl)}
            />
            {currentPartyId && isVideoReady && (
              <div>
                <button onClick={handlePlay} disabled={isPlaying}>Play</button>
                <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
                <input
                  type="range" min={0} max={1} step="any"
                  value={played}
                  onMouseDown={() => setSeeking(true)}
                  onChange={e => setPlayed(parseFloat(e.target.value))}
                  onMouseUp={e => {
                    setSeeking(false);
                    handleSeekFromRange(parseFloat(e.target.value));
                  }}
                />
                <span>
                  {playerRef.current && playerRef.current.getDuration() ? 
                    `${Math.round(played * playerRef.current.getDuration())}s / ${Math.round(playerRef.current.getDuration())}s`
                    : '0s / 0s'}
                </span>
              </div>
            )}
          </div>

          {currentPartyId && partyDetails && ( // Only show chat if in a party and details loaded
            <div style={{ flex: 1 }}>
              <Chat 
                messages={chatMessages} 
                onSendMessage={(text) => sendWsMessage('chat', { userId: HARDCODED_USER_ID, message: text })} 
                currentUserId={HARDCODED_USER_ID} // Pass current user ID to Chat
              />
            </div>
          )}
        </div>

        {!currentPartyId && initialVideoId && (
          <button onClick={handleCreateParty} style={{ marginTop: '20px' }}>Create Watch Party</button>
        )}

        {currentPartyId && isHost && (
          <button onClick={() => {
            ws.current?.close();
            navigate('/');
          }} style={{ marginTop: '20px' }}>
            Leave & End Party
          </button>
        )}
         {currentPartyId && !isHost && (
          <button onClick={() => {
            ws.current?.close(); 
            navigate('/');
          }} style={{ marginTop: '20px' }}>
            Leave Party
          </button>
        )}
      </div>
    );
  }

  return content;
}

export default WatchPartyPlayerPage;