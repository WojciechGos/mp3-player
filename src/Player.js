import React, { useState, useRef, useEffect } from "react";
import "./style.css"; // Make sure to create and import the CSS file

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [pan, setPan] = useState(0);
  const [delay, setDelay] = useState(0.5);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const bassNodeRef = useRef(null);
  const midNodeRef = useRef(null);
  const trebleNodeRef = useRef(null);
  const panNodeRef = useRef(null);
  const delayNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const canvasRef = useRef(null);

  const initializeAudioContext = () => {
    if (!audioInitialized) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const track = audioContext.createMediaElementSource(audioRef.current);
      const gainNode = audioContext.createGain();
      const bassNode = audioContext.createBiquadFilter();
      const midNode = audioContext.createBiquadFilter();
      const trebleNode = audioContext.createBiquadFilter();
      const panNode = audioContext.createStereoPanner();
      const delayNode = audioContext.createDelay();
      const analyserNode = audioContext.createAnalyser();

      bassNode.type = "lowshelf";
      bassNode.frequency.value = 200;
      midNode.type = "peaking";
      midNode.frequency.value = 1000;
      trebleNode.type = "highshelf";
      trebleNode.frequency.value = 3000;
      analyserNode.fftSize = 2048;

      track
        .connect(bassNode)
        .connect(midNode)
        .connect(trebleNode)
        .connect(panNode)
        .connect(delayNode)
        .connect(gainNode)
        .connect(analyserNode)
        .connect(audioContext.destination);

      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      bassNodeRef.current = bassNode;
      midNodeRef.current = midNode;
      trebleNodeRef.current = trebleNode;
      panNodeRef.current = panNode;
      delayNodeRef.current = delayNode;
      analyserNodeRef.current = analyserNode;

      setAudioInitialized(true);
      requestAnimationFrame(visualize);
    }
  };

  const togglePlayPause = () => {
    initializeAudioContext();
    const prevValue = isPlaying;
    setIsPlaying(!prevValue);
    if (!prevValue) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (bassNodeRef.current) {
      bassNodeRef.current.gain.value = bass;
    }
  }, [bass]);

  useEffect(() => {
    if (midNodeRef.current) {
      midNodeRef.current.gain.value = mid;
    }
  }, [mid]);

  useEffect(() => {
    if (trebleNodeRef.current) {
      trebleNodeRef.current.gain.value = treble;
    }
  }, [treble]);

  useEffect(() => {
    if (panNodeRef.current) {
      panNodeRef.current.pan.value = pan;
    }
  }, [pan]);

  useEffect(() => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = delay;
    }
  }, [delay]);

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSliderChange = (event) => {
    audioRef.current.currentTime = event.target.value;
    setCurrentTime(event.target.value);
  };

  const visualize = () => {
    if (analyserNodeRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const analyser = analyserNodeRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        analyser.getByteTimeDomainData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        requestAnimationFrame(draw);
      };

      draw();
    }
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src="/music.mp3"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
      />
      <button onClick={togglePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      <div>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSliderChange}
        />
      </div>
      <div>
        {Math.floor(currentTime / 60)}:
        {Math.floor(currentTime % 60)
          .toString()
          .padStart(2, "0")}{" "}
        /{Math.floor(duration / 60)}:
        {Math.floor(duration % 60)
          .toString()
          .padStart(2, "0")}
      </div>
      <div>
        <label>
          Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
          <span>{volume}</span>
        </label>
      </div>
      <div>
        <label>
          Playback Rate:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={playbackRate}
            onChange={(e) => setPlaybackRate(e.target.value)}
          />
          <span>{playbackRate}</span>
        </label>
      </div>
      <div>
        <label>
          Bass:
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={bass}
            onChange={(e) => setBass(e.target.value)}
          />
          <span>{bass}</span>
        </label>
      </div>
      <div>
        <label>
          Mid:
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={mid}
            onChange={(e) => setMid(e.target.value)}
          />
          <span>{mid}</span>
        </label>
      </div>
      <div>
        <label>
          Treble:
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={treble}
            onChange={(e) => setTreble(e.target.value)}
          />
          <span>{treble}</span>
        </label>
      </div>
      <div>
        <label>
          Pan:
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={pan}
            onChange={(e) => setPan(e.target.value)}
          />
          <span>{pan}</span>
        </label>
      </div>
      <div>
        <label>
          Delay:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
          />
          <span>{delay}</span>
        </label>
      </div>
      <canvas ref={canvasRef} width="600" height="100"></canvas>
    </div>
  );
};

export default AudioPlayer;
