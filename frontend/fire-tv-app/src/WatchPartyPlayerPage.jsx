// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import ReactPlayer from 'react-player';
// import axios from 'axios';
// import Chat from './Chat';
// import './WatchPartyPlayerPage.css';

// // --- Configuration ---
// // FIX: Use the /api prefix for consistency with the backend server.js file
// const API_BASE_URL = 'http://localhost:8080'; 
// const WS_BASE_URL = 'ws://localhost:8080';
// const STATIC_VIDEO_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
// const HARDCODED_USER_ID = "user_" + Math.random().toString(36).substr(2, 9);


// function WatchPartyPlayerPage() {
//   const { partyId, videoId } = useParams();
//   const navigate = useNavigate();

//   // --- State Management ---
//   const [isPartyMode, setIsPartyMode] = useState(!!partyId);
//   const [partyDetails, setPartyDetails] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [chatMessages, setChatMessages] = useState([]);

//   // --- Player State ---
//   const [playing, setPlaying] = useState(false);
//   const [seeking, setSeeking] = useState(false);
//   // NEW STATE: Tracks if the ReactPlayer component is ready to accept commands.
//   const [isPlayerReady, setIsPlayerReady] = useState(false); 
  
//   // --- Refs ---
//   const playerRef = useRef(null);
//   const wsRef = useRef(null);

//   // --- WebSocket Message Sender ---
//   const sendMessage = useCallback((payload) => {
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(payload));
//     } else {
//       console.warn("WebSocket is not connected. Message not sent:", payload);
//     }
//   }, []);

//   // --- Effect for Initialization and WebSocket Management ---
//   useEffect(() => {
//     const currentPartyId = partyId;
//     setIsPartyMode(!!currentPartyId);

//     if (currentPartyId) {
//       // --- PARTY MODE ---
//       console.log(`[PARTY MODE] Joining party: ${currentPartyId}`);

//       axios.get(`${API_BASE_URL}/party/${currentPartyId}`)
//         .then(response => {
//           const details = response.data;
//           console.log("[HTTP] Fetched party details:", details);
//           setPartyDetails(details);
//           setPlaying(details.playbackState === 'playing');
//           // REMOVED: playerRef.current?.seekTo(...) call from here to prevent race conditions.
//           setChatMessages([{
//             special: true,
//             text: `You have joined the party! The host is ${details.hostId === HARDCODED_USER_ID ? 'you' : details.hostId}.`
//           }]);
//         })
//         .catch(err => {
//           console.error("Failed to get party details:", err);
//           setError(`Party not found or has expired. Error: ${err.response?.data?.error || err.message}`);
//         }).finally(() => {
//             setIsLoading(false);
//         });

//       // Establish WebSocket Connection
//       wsRef.current = new WebSocket(`${WS_BASE_URL}?partyId=${currentPartyId}&userId=${HARDCODED_USER_ID}`);

//       wsRef.current.onopen = () => console.log(`[WS] Connected to party ${currentPartyId}`);

//       wsRef.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           console.log("[WS] Received:", data);

//           if (data.type === 'chat') {
//             // Prevent adding own optimistic message again
//             if (data.userId !== HARDCODED_USER_ID) {
//                 setChatMessages(prev => [...prev, { text: data.message, userId: data.userId }]);
//             }
//           } 
//           else if (data.type === 'controls') {
//             switch (data.message) {
//               case 'play':
//                 setPlaying(true);
//                 break;
//               case 'pause':
//                 setPlaying(false);
//                 break;
//               case 'party_ended_by_host':
//                 alert("The party has been ended by the host.");
//                 wsRef.current?.close();
//                 navigate('/');
//                 break;
//               default:
//                 if (data.message.startsWith('seek_to:')) {
//                   const time = parseFloat(data.message.split(':')[1]);
//                   if (playerRef.current && !isNaN(time)) {
//                     setSeeking(true);
//                     playerRef.current.seekTo(time, 'seconds');
//                   }
//                 }
//                 break;
//             }
//           }
//         } catch (e) {
//           console.error("[WS] Error parsing message:", e);
//         }
//       };

//       wsRef.current.onclose = () => {
//         console.log(`[WS] Disconnected from party ${currentPartyId}`);
//         if (!error) {
//             setChatMessages(prev => [...prev, { special: true, text: 'You have left the party.' }]);
//         }
//       };

//       wsRef.current.onerror = (err) => {
//         console.error("[WS] Error:", err);
//         setError("A WebSocket connection error occurred.");
//       };

//     } else {
//       // --- SOLO MODE ---
//       console.log(`[SOLO MODE] Viewing video: ${videoId}`);
//       setIsLoading(false);
//     }

//     // --- Cleanup function ---
//     return () => {
//       if (wsRef.current) {
//         console.log("[Cleanup] Closing WebSocket connection.");
//         wsRef.current.close();
//         wsRef.current = null;
//       }
//     };
//   // FIX: Removed `error` from the dependency array to prevent the infinite loop.
//   // The effect should only re-run if the party or video ID changes.
//   }, [partyId, videoId, navigate]);


//   // NEW EFFECT: Handles initial time synchronization safely.
//   // This runs only when the player is ready AND we have party details.
//   useEffect(() => {
//     if (isPartyMode && isPlayerReady && partyDetails) {
//         console.log(`[SYNC] Conditions met. Seeking player to ${partyDetails.timestamp}s`);
//         playerRef.current?.seekTo(parseFloat(partyDetails.timestamp), 'seconds');
//     }
//   }, [isPlayerReady, partyDetails, isPartyMode]);


//   // --- Event Handlers for UI actions ---

//   const handleCreateParty = async () => {
//     console.log("Creating party for video:", videoId);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/party`, {
//         mediaId: videoId,
//         hostId: HARDCODED_USER_ID
//       });
//       const newPartyId = response.data.id;
//       console.log("Party created successfully:", newPartyId);
//       navigate(`/party/${newPartyId}`);
//     } catch (err) {
//       console.error("Failed to create party:", err);
//       setError("Could not create the watch party. Please try again later.");
//     }
//   };

//   const handleLeaveParty = () => {
//     if (wsRef.current) {
//       wsRef.current.close();
//     }
//     navigate(`/video/${partyDetails?.mediaId || videoId}`);
//   };
  
//   // --- Handlers for ReactPlayer events ---
//   const handlePlay = () => {
//     if (isPartyMode) {
//       console.log("[PLAYER] Play triggered by user");
//       setPlaying(true);
//       sendMessage({ type: 'controls', message: 'play' });
//     } else {
//       setPlaying(true);
//     }
//   };

//   const handlePause = () => {
//     if (isPartyMode) {
//       console.log("[PLAYER] Pause triggered by user");
//       setPlaying(false);
//       sendMessage({ type: 'controls', message: 'pause' });
//     } else {
//       setPlaying(false);
//     }
//   };
  
//   const handleSeek = (seconds) => {
//     if (isPartyMode) {
//       if (seeking) {
//         setSeeking(false);
//         return;
//       }
//       console.log(`[PLAYER] User seeked to ${seconds}`);
//       sendMessage({ type: 'controls', message: `seek_to:${seconds}` });
//     }
//   };

//   const handleSendMessage = (messageText) => {
//     sendMessage({
//       type: 'chat',
//       message: messageText,
//       userId: HARDCODED_USER_ID
//     });
//     setChatMessages(prev => [...prev, { text: messageText, userId: HARDCODED_USER_ID }]);
//   };


//   // --- Render Logic ---
//   if (isLoading) return <div className="player-loading">Loading Party...</div>;
//   if (error) return <div className="player-error"><h2>Error</h2><p>{error}</p><button onClick={() => navigate('/')}>Go Home</button></div>;

//   return (
//     <div className="watch-party-page">
//       <div className="player-container">
//         <ReactPlayer
//           ref={playerRef}
//           className="react-player"
//           url={STATIC_VIDEO_URL}
//           width="100%"
//           height="100%"
//           playing={playing}
//           controls={true}
//           onPlay={handlePlay}
//           onPause={handlePause}
//           onSeek={handleSeek}
//           // FIX: The onReady callback now simply sets a state flag.
//           onReady={() => setIsPlayerReady(true)}
//         />
//       </div>
//       <div className="sidebar-container">
//         {isPartyMode ? (
//           <div className="party-controls">
//             <h2>Watch Party</h2>
//             <p>Share this link to invite others:</p>
//             <input type="text" value={window.location.href} readOnly className="share-link-input" />
//             <button onClick={handleLeaveParty} className="leave-button">Leave Party</button>
//             <Chat 
//                 messages={chatMessages}
//                 onSendMessage={handleSendMessage}
//                 currentUserId={HARDCODED_USER_ID}
//             />
//           </div>
//         ) : (
//           <div className="solo-controls">
//             <h2>Watching Solo</h2>
//             <p>Enjoy the video or start a party to watch with friends!</p>
//             <button onClick={handleCreateParty} className="create-party-button">
//               Create Watch Party
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default WatchPartyPlayerPage;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import Chat from './Chat';
import './WatchPartyPlayerPage.css';

// --- Configuration ---
const PARTY_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_BASE_URL = 'ws://localhost:8080';
const STATIC_VIDEO_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const HARDCODED_USER_ID = "user_" + Math.random().toString(36).substr(2, 9);

function WatchPartyPlayerPage() {
  const { partyId, videoId } = useParams();
  const navigate = useNavigate();

  // --- State Management ---
  const [isPartyMode, setIsPartyMode] = useState(!!partyId);
  const [partyDetails, setPartyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // --- Player State ---
  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // --- Refs ---
  const playerRef = useRef(null);
  const wsRef = useRef(null);

  const sendMessage = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", payload);
    }
  }, []);

  // --- EFFECT 1: Fetch Party Data ---
  useEffect(() => {
    setIsPartyMode(!!partyId);
    if (partyId) {
      setIsLoading(true);
      axios.get(`${PARTY_API_BASE_URL}/party/${partyId}`)
        .then(response => {
          const details = response.data;
          setPartyDetails(details);
          setPlaying(details.playbackState === 'playing');
          setChatMessages([{
            special: true,
            text: `Welcome! The party host is ${details.hostId}.`
          }]);
          setError(null); // Clear previous errors
        })
        .catch(err => {
          console.error("Failed to get party details:", err);
          setError(`Party not found or has expired. Error: ${err.response?.data?.error || err.message}`);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setPartyDetails(null);
    }
  }, [partyId]);

  // --- EFFECT 2: Manage WebSocket Lifecycle ---
  useEffect(() => {
    if (!partyId) {
      return; // Do nothing if not in party mode
    }

    // Connect WebSocket
    const ws = new WebSocket(`${WS_BASE_URL}?partyId=${partyId}&userId=${HARDCODED_USER_ID}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Connected to party ${partyId}`);
    };

    ws.onmessage = (event) => {
      // (Message handling logic remains the same)
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat' && data.userId !== HARDCODED_USER_ID) {
            setChatMessages(prev => [...prev, { text: data.message, userId: data.userId }]);
        } else if (data.type === 'controls') {
          switch (data.message) {
            case 'play': setPlaying(true); break;
            case 'pause': setPlaying(false); break;
            case 'party_ended_by_host':
              alert("The party has been ended by the host.");
              ws.close();
              navigate('/');
              break;
            default:
              if (data.message.startsWith('seek_to:')) {
                const time = parseFloat(data.message.split(':')[1]);
                if (playerRef.current && !isNaN(time)) {
                  setSeeking(true);
                  playerRef.current.seekTo(time, 'seconds');
                }
              }
              break;
          }
        }
      } catch (e) { console.error("[WS] Error parsing message:", e); }
    };

    ws.onerror = (err) => {
      console.error("[WS] WebSocket error:", err);
      // Only set error if we are not already displaying an HTTP error
      setError(prevError => prevError || "A WebSocket connection error occurred.");
    };

    // This cleanup function is crucial. It will run when the component
    // unmounts or when `partyId` changes.
    return () => {
      console.log("[WS] Closing WebSocket connection.");
      ws.close(1000, "Client disconnecting");
    };
  }, [partyId, navigate]); // This effect ONLY depends on partyId

  // --- EFFECT 3: Synchronize Player Time ---
  useEffect(() => {
    if (isPartyMode && isPlayerReady && partyDetails) {
        console.log(`[SYNC] Conditions met. Seeking player to ${partyDetails.timestamp}s`);
        playerRef.current?.seekTo(parseFloat(partyDetails.timestamp), 'seconds');
    }
  }, [isPlayerReady, partyDetails, isPartyMode]);

  // --- UI Action Handlers ---
  const handleCreateParty = async () => {
    try {
      const response = await axios.post(`${PARTY_API_BASE_URL}/party`, {
        mediaId: videoId,
        hostId: HARDCODED_USER_ID
      });
      navigate(`/party/${response.data.id}`);
    } catch (err) {
      setError("Could not create the watch party.");
    }
  };

  const handleLeaveParty = () => {
    if (wsRef.current) wsRef.current.close();
    navigate(`/video/${partyDetails?.mediaId || videoId}`);
  };

  // --- Player Event Handlers ---
  const handlePlay = () => {
    if (isPartyMode) sendMessage({ type: 'controls', message: 'play' });
    else setPlaying(true);
  };

  const handlePause = () => {
    if (isPartyMode) sendMessage({ type: 'controls', message: 'pause' });
    else setPlaying(false);
  };
  
  const handleSeek = (seconds) => {
    if (isPartyMode && !seeking) {
      sendMessage({ type: 'controls', message: `seek_to:${seconds}` });
    }
    if (seeking) setSeeking(false);
  };

  const handleSendMessage = (messageText) => {
    sendMessage({ type: 'chat', message: messageText, userId: HARDCODED_USER_ID });
    setChatMessages(prev => [...prev, { text: messageText, userId: HARDCODED_USER_ID }]);
  };

  // --- Render Logic ---
  if (isLoading) return <div className="player-loading">Joining Party...</div>;
  if (error) return <div className="player-error"><h2>Error</h2><p>{error}</p><button onClick={() => navigate('/')}>Go Home</button></div>;

  return (
    <div className="watch-party-page">
      <div className="player-container">
        <ReactPlayer
          ref={playerRef}
          className="react-player"
          url={STATIC_VIDEO_URL}
          width="100%"
          height="100%"
          playing={playing}
          controls={true}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          onReady={() => setIsPlayerReady(true)}
        />
      </div>
      <div className="sidebar-container">
        {isPartyMode ? (
          <div className="party-controls">
            <h2>Watch Party</h2>
            <p>Share this link to invite others:</p>
            <input type="text" value={window.location.href} readOnly className="share-link-input" />
            <button onClick={handleLeaveParty} className="leave-button">Leave Party</button>
            <Chat 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentUserId={HARDCODED_USER_ID}
            />
          </div>
        ) : (
          <div className="solo-controls">
            <h2>Watching Solo</h2>
            <p>Enjoy the video or start a party to watch with friends!</p>
            <button onClick={handleCreateParty} className="create-party-button">
              Create Watch Party
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchPartyPlayerPage;