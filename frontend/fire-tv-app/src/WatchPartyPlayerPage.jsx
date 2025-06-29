import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import Chat from './Chat';
import './WatchPartyPlayerPage.css';

// --- Configuration ---
const PARTY_API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hackon-backend.onrender.com';
// const WS_BASE_URL = 'ws://localhost:8080';
const WS_BASE_URL = "wss://hackon-backend.onrender.com";

const STATIC_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function WatchPartyPlayerPage({ user }) {
  const { partyId, videoId } = useParams();
  const navigate = useNavigate();
  
  // Extract user information
  const userId = user?.id;
  const currentUsername = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Anonymous';
  
  // Debug logging
  // console.log('🎬 WatchPartyPlayerPage - Props:', { user, userId, currentUsername, partyId, videoId });
  // console.log('🎬 WatchPartyPlayerPage - API Base URL:', PARTY_API_BASE_URL);
  // console.log('🎬 WatchPartyPlayerPage - WS Base URL:', WS_BASE_URL);

  // --- State Management ---
  const [isPartyMode, setIsPartyMode] = useState(!!partyId);
  const [partyDetails, setPartyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [userMap, setUserMap] = useState({}); // Map of userId -> username

  // --- Player State ---
  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // --- Refs ---
  const playerRef = useRef(null);
  const wsRef = useRef(null);

  const sendMessage = useCallback((payload) => {
    // console.log('📤 Sending message:', payload);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      // console.log('📤 Message sent successfully');
    } else {
      console.warn("❌ WebSocket is not connected. Message not sent:", payload);
      // console.log('📡 WebSocket state:', wsRef.current?.readyState);
    }
  }, []);

  // --- EFFECT 1: Fetch Party Data ---
  useEffect(() => {
    setIsPartyMode(!!partyId);
    if (partyId) {
      // console.log('🎉 Fetching party details for partyId:', partyId);
      setIsLoading(true);
      axios.get(`${PARTY_API_BASE_URL}/party/${partyId}`)
        .then(response => {
          // console.log('🎉 Party details received:', response.data);
          const details = response.data;
          setPartyDetails(details);
          setPlaying(details.playbackState === 'playing');
          
          // Initialize userMap with current user
          setUserMap(prev => ({
            ...prev,
            [userId]: currentUsername
          }));
          
          setChatMessages([{
            special: true,
            text: `Welcome to the watch party! 🎬`
          }]);
          setError(null); // Clear previous errors
        })
        .catch(err => {
          console.error("❌ Failed to get party details:", err);
          setError(`Party not found or has expired. Error: ${err.response?.data?.error || err.message}`);
        })
        .finally(() => setIsLoading(false));
    } else {
      // console.log('🎬 Solo viewing mode - no partyId');
      setIsLoading(false);
      setPartyDetails(null);
    }
  }, [partyId]);

  // --- EFFECT 2: Manage WebSocket Lifecycle ---
  useEffect(() => {
    if (!partyId || !userId) {
      // console.log('🔌 WebSocket not connecting - missing partyId or userId:', { partyId, userId });
      return; // Do nothing if not in party mode or no userId
    }

    // console.log('🔌 Attempting to connect WebSocket...');
    // Connect WebSocket
    const ws = new WebSocket(`${WS_BASE_URL}/party?partyId=${partyId}&userId=${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] ✅ Connected to party ${partyId} as user ${userId}`);
      
      // Announce that this user has joined
      const joinMessage = {
        type: 'user_joined',
        userId: userId,
        username: currentUsername,
        timestamp: new Date().toISOString()
      };
      
      // Send join message after a brief delay to ensure connection is stable
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(joinMessage));
        }
      }, 100);
    };

    ws.onmessage = (event) => {
      // console.log('[WS] 📨 Message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          // Handle incoming chat messages
          if (data.userId !== userId) {
            const username = data.username || userMap[data.userId] || data.userId.slice(0, 8) + '...';
            
            // Update userMap if we get a new username
            if (data.username && data.userId && !userMap[data.userId]) {
              setUserMap(prev => ({
                ...prev,
                [data.userId]: data.username
              }));
            }
            
            setChatMessages(prev => [...prev, { 
              text: data.message, 
              userId: data.userId, 
              timestamp: data.timestamp || new Date().toISOString()
            }]);
          }
        } else if (data.type === 'user_joined') {
          // Handle user joining - update userMap
          if (data.userId && data.username) {
            setUserMap(prev => ({
              ...prev,
              [data.userId]: data.username
            }));
            
            setChatMessages(prev => [...prev, {
              special: true,
              text: `${data.username} joined the party`
            }]);
          }
        } else if (data.type === 'user_left') {
          // Handle user leaving
          if (data.username) {
            setChatMessages(prev => [...prev, {
              special: true,
              text: `${data.username} left the party`
            }]);
          }
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
      } catch (e) { 
        console.error("[WS] ❌ Error parsing message:", e); 
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] ❌ WebSocket error:", err);
      // Only set error if we are not already displaying an HTTP error
      setError(prevError => prevError || "A WebSocket connection error occurred.");
    };

    // This cleanup function is crucial. It will run when the component
    // unmounts or when `partyId` changes.
    return () => {
      // console.log("[WS] 🔌 Closing WebSocket connection.");
      
      // Send user_left message before closing
      if (ws.readyState === WebSocket.OPEN) {
        const leaveMessage = {
          type: 'user_left',
          userId: userId,
          username: currentUsername,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(leaveMessage));
      }
      
      ws.close(1000, "Client disconnecting");
    };
  }, [partyId, userId, navigate]); // Added userId to dependencies

  // --- EFFECT 3: Synchronize Player Time ---
  useEffect(() => {
    if (isPartyMode && isPlayerReady && partyDetails) {
        // console.log(`[SYNC] Conditions met. Seeking player to ${partyDetails.timestamp}s`);
        playerRef.current?.seekTo(parseFloat(partyDetails.timestamp), 'seconds');
    }
  }, [isPlayerReady, partyDetails, isPartyMode]);

  // --- UI Action Handlers ---
  const handleCreateParty = async () => {
    if (!userId) {
      setError("❌ User ID is required to create a party. Please log in.");
      return;
    }
    
    // console.log('🎉 Creating party with mediaId:', videoId, 'hostId:', userId);
    try {
      const response = await axios.post(`${PARTY_API_BASE_URL}/party`, {
        mediaId: videoId,
        hostId: userId
      });
      // console.log('🎉 Party created successfully:', response.data);
      navigate(`/party/${response.data.id}`);
    } catch (err) {
      console.error("❌ Could not create the watch party:", err);
      setError(`Could not create the watch party: ${err.response?.data?.error || err.message}`);
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
    const messageData = { 
      type: 'chat', 
      message: messageText, 
      userId: userId,
      username: currentUsername,
      timestamp: new Date().toISOString()
    };
    
    sendMessage(messageData);
    setChatMessages(prev => [...prev, { 
      text: messageText, 
      userId: userId, 
      timestamp: messageData.timestamp
    }]);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed: ', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  // --- Render Logic ---
  if (isLoading) return (
    <div className="player-loading">
      <div>Joining Party...</div>
      <p>Setting up your watch party experience</p>
    </div>
  );
  
  if (error) return (
    <div className="player-error">
      <h2>Oops! Something went wrong</h2>
      <p>{error}</p>
      <button onClick={() => navigate('/')}>Return Home</button>
    </div>
  );

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
            <div className="party-info">
              <h4>🎉 Party Active</h4>
              <p>You're watching together with friends!</p>
            </div>
            
            <div className="share-link-container">
              <label className="share-link-label">Share this link to invite others:</label>
              <input 
                type="text" 
                value={window.location.href} 
                readOnly 
                className="share-link-input"
                onClick={(e) => e.target.select()}
              />
              <button onClick={copyToClipboard} className={`copy-link-button ${linkCopied ? 'copied' : ''}`}>
                {linkCopied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>
            
            <button onClick={handleLeaveParty} className="leave-button">
              Leave Party
            </button>
            
            <Chat 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentUserId={userId}
                currentUsername={currentUsername}
                userMap={userMap}
            />
          </div>
        ) : (
          <div className="solo-controls">
            <h2>Watching Solo</h2>
            <p>Enjoying the video? Why not invite some friends to watch together and make it more fun!</p>
            <button onClick={handleCreateParty} className="create-party-button">
              Create Watch Party
            </button>
            
            <div className="party-info">
              <h4>🎬 Watch Party Features</h4>
              <p>• Synchronized playback<br/>• Real-time chat<br/>• Share controls with friends</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchPartyPlayerPage;