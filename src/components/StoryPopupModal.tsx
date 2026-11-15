import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { RECORDER_IMAGE_URL } from '../data/planets';
import { RECORDINGS_BY_OBJECT_ID } from '../data/recordings';
import { Language } from '../types/game';
import { soundEngine } from '../utils/audio';
import { UI_TEXT } from '../utils/i18n';

interface StoryPopupModalProps {
  objectId: string;
  imageUrl: string;
  alt: string;
  lang: Language;
  onExit: () => void;
}

type ArchiveView = 'chooser' | 'logbook' | 'recorder';
type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'finished';

// Client-side cache of synthesized WAV Object URLs per `${objectId}:${lang}`
const clientAudioUrlCache = new Map<string, string>();

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function removeWhiteBackgroundToDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      try {
        const maxDim = 1500;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const work = document.createElement('canvas');
        work.width = w;
        work.height = h;
        const ctx = work.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isNearWhite = (idx: number) => {
          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return r > 224 && g > 224 && b > 224 && max - min < 28;
        };

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const idx = y * w + x;
          if (visited[idx] || !isNearWhite(idx)) return;
          visited[idx] = 1;
          queue[tail++] = idx;
        };

        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          enqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }

        while (head < tail) {
          const idx = queue[head++];
          data[idx * 4 + 3] = 0;
          const x = idx % w;
          const y = (idx - x) / w;
          enqueue(x + 1, y);
          enqueue(x - 1, y);
          enqueue(x, y + 1);
          enqueue(x, y - 1);
        }

        const spineMinX = Math.floor(w * 0.42);
        const spineMaxX = Math.ceil(w * 0.56);
        const compQueue = new Int32Array(w * h);
        for (let y = 0; y < h; y++) {
          for (let x = spineMinX; x <= spineMaxX; x++) {
            const startIdx = y * w + x;
            if (visited[startIdx] || !isNearWhite(startIdx)) continue;
            let cHead = 0;
            let cTail = 0;
            visited[startIdx] = 1;
            compQueue[cTail++] = startIdx;

            while (cHead < cTail) {
              const idx = compQueue[cHead++];
              const cx = idx % w;
              const cy = (idx - cx) / w;
              const neighbors = [
                [cx + 1, cy],
                [cx - 1, cy],
                [cx, cy + 1],
                [cx, cy - 1],
              ];
              for (let n = 0; n < 4; n++) {
                const nx = neighbors[n][0];
                const ny = neighbors[n][1];
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                const nIdx = ny * w + nx;
                if (!visited[nIdx] && isNearWhite(nIdx)) {
                  visited[nIdx] = 1;
                  compQueue[cTail++] = nIdx;
                }
              }
            }

            if (cTail > 80) {
              for (let k = 0; k < cTail; k++) {
                data[compQueue[k] * 4 + 3] = 0;
              }
            }
          }
        }

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const p = idx * 4;
            if (data[p + 3] === 0) continue;
            const adjCleared =
              data[(idx - 1) * 4 + 3] === 0 ||
              data[(idx + 1) * 4 + 3] === 0 ||
              data[(idx - w) * 4 + 3] === 0 ||
              data[(idx + w) * 4 + 3] === 0;
            if (adjCleared) {
              const lum = (data[p] + data[p + 1] + data[p + 2]) / 3;
              const sat =
                Math.max(data[p], data[p + 1], data[p + 2]) -
                Math.min(data[p], data[p + 1], data[p + 2]);
              if (lum > 205 && sat < 35) {
                data[p + 3] = Math.max(0, Math.round((245 - lum) * 4));
              }
            }
          }
        }

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 18) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const bw = Math.max(1, maxX - minX + 1);
        const bh = Math.max(1, maxY - minY + 1);
        const cropped = document.createElement('canvas');
        cropped.width = bw;
        cropped.height = bh;
        const cCtx = cropped.getContext('2d');
        if (!cCtx) {
          resolve(src);
          return;
        }
        cCtx.drawImage(work, minX, minY, bw, bh, 0, 0, bw, bh);
        resolve(cropped.toDataURL('image/png'));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
  });
}

function removeBlackBackgroundToDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      try {
        const maxDim = 1200;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const work = document.createElement('canvas');
        work.width = w;
        work.height = h;
        const ctx = work.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isNearBlack = (idx: number) => {
          const p = idx * 4;
          return data[p] <= 20 && data[p + 1] <= 20 && data[p + 2] <= 20;
        };

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const idx = y * w + x;
          if (visited[idx] || !isNearBlack(idx)) return;
          visited[idx] = 1;
          queue[tail++] = idx;
        };

        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          enqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }

        while (head < tail) {
          const idx = queue[head++];
          data[idx * 4 + 3] = 0;
          const x = idx % w;
          const y = (idx - x) / w;
          enqueue(x + 1, y);
          enqueue(x - 1, y);
          enqueue(x, y + 1);
          enqueue(x, y - 1);
        }

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 18) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const bw = Math.max(1, maxX - minX + 1);
        const bh = Math.max(1, maxY - minY + 1);
        const cropped = document.createElement('canvas');
        cropped.width = bw;
        cropped.height = bh;
        const cCtx = cropped.getContext('2d');
        if (!cCtx) {
          resolve(src);
          return;
        }
        cCtx.drawImage(work, minX, minY, bw, bh, 0, 0, bw, bh);
        resolve(cropped.toDataURL('image/png'));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
  });
}

function pickVoiceForLang(lang: Language): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const targetPrefixes =
    lang === 'es' ? ['es-MX', 'es-ES', 'es-419', 'es'] : ['en-US', 'en-GB', 'en'];
  for (const prefix of targetPrefixes) {
    const match = voices.find((v) =>
      v.lang.toLowerCase().startsWith(prefix.toLowerCase())
    );
    if (match) return match;
  }
  return null;
}

export const StoryPopupModal: React.FC<StoryPopupModalProps> = ({
  objectId,
  imageUrl,
  alt,
  lang,
  onExit,
}) => {
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [recorderUrl, setRecorderUrl] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ArchiveView>('chooser');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [sentenceIdx, setSentenceIdx] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [usingRealAudio, setUsingRealAudio] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<number>(0);
  const fallbackTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = UI_TEXT[lang];
  const recording = RECORDINGS_BY_OBJECT_ID[objectId];
  const sentences = useMemo(() => recording?.sentences[lang] ?? [], [recording, lang]);
  const totalSentences = sentences.length;
  const fullNarrationText = useMemo(() => sentences.join(' '), [sentences]);
  const cacheKey = `${objectId}:${lang}`;

  // Precompute character-weighted cumulative ratios so audio currentTime maps accurately to the active sentence
  const sentenceThresholds = useMemo(() => {
    const totalChars = sentences.reduce((acc, s) => acc + s.length, 0) || 1;
    let running = 0;
    return sentences.map((s) => {
      running += s.length;
      return running / totalChars;
    });
  }, [sentences]);

  useEffect(() => {
    let active = true;
    setProcessedUrl(null);
    setActiveView('chooser');
    removeWhiteBackgroundToDataUrl(imageUrl).then((res) => {
      if (active) setProcessedUrl(res);
    });
    return () => {
      active = false;
    };
  }, [imageUrl]);

  useEffect(() => {
    let active = true;
    removeBlackBackgroundToDataUrl(RECORDER_IMAGE_URL).then((res) => {
      if (active) setRecorderUrl(res);
    });
    return () => {
      active = false;
    };
  }, []);

  const stopAllAudio = useCallback(() => {
    sessionRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    soundEngine.setMusicDucked(true, false);
  }, []);

  useEffect(() => {
    stopAllAudio();
    setSentenceIdx(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setPlaybackState('idle');
    setUsingRealAudio(true);
  }, [objectId, lang, stopAllAudio]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // Fallback sentence-by-sentence SpeechSynthesis / caption playback if server TTS is unavailable
  const speakFallbackFromIndex = useCallback(
    (startIndex: number) => {
      if (!sentences.length) return;
      const safeIdx = Math.max(0, Math.min(sentences.length - 1, startIndex));

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      sessionRef.current += 1;
      const mySession = sessionRef.current;
      setUsingRealAudio(false);
      setSentenceIdx(safeIdx);
      setPlaybackState('playing');
      soundEngine.setMusicDucked(true, !soundEngine.muted);

      const advanceNext = () => {
        if (sessionRef.current !== mySession) return;
        const nextIdx = safeIdx + 1;
        if (nextIdx >= sentences.length) {
          setPlaybackState('finished');
          soundEngine.setMusicDucked(true, false);
          return;
        }
        speakFallbackFromIndex(nextIdx);
      };

      const canUseSpeech =
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof SpeechSynthesisUtterance !== 'undefined' &&
        !soundEngine.muted;

      if (canUseSpeech) {
        try {
          const utterance = new SpeechSynthesisUtterance(sentences[safeIdx]);
          utterance.lang = lang === 'es' ? 'es-MX' : 'en-US';
          utterance.rate = 0.96;
          utterance.pitch = 0.95;
          const voice = pickVoiceForLang(lang);
          if (voice) utterance.voice = voice;

          let settled = false;
          utterance.onend = () => {
            if (settled) return;
            settled = true;
            advanceNext();
          };
          utterance.onerror = () => {
            if (settled) return;
            settled = true;
            const ms = Math.max(2400, sentences[safeIdx].length * 52);
            fallbackTimerRef.current = window.setTimeout(advanceNext, ms);
          };

          window.speechSynthesis.speak(utterance);

          const maxWaitMs = Math.max(8500, sentences[safeIdx].length * 115);
          fallbackTimerRef.current = window.setTimeout(() => {
            if (!settled && sessionRef.current === mySession) {
              settled = true;
              advanceNext();
            }
          }, maxWaitMs);
          return;
        } catch {
          // Fall through
        }
      }

      const fallbackMs = Math.max(2600, sentences[safeIdx].length * 55);
      fallbackTimerRef.current = window.setTimeout(advanceNext, fallbackMs);
    },
    [sentences, lang]
  );

  const attachAndPlayAudioUrl = useCallback(
    (blobUrl: string, mySession: number) => {
      if (sessionRef.current !== mySession) return;

      const audio = new Audio(blobUrl);
      audio.volume = 0.96;
      audio.muted = soundEngine.muted;
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        if (sessionRef.current !== mySession) return;
        setAudioDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        if (sessionRef.current !== mySession) return;
        const cur = audio.currentTime;
        const dur = audio.duration || 0;
        setAudioCurrentTime(cur);
        if (dur > 0) {
          setAudioDuration(dur);
          const ratio = cur / dur;
          const idx = sentenceThresholds.findIndex((th) => ratio <= th);
          setSentenceIdx(idx === -1 ? Math.max(0, sentences.length - 1) : idx);
        }
      };

      audio.onended = () => {
        if (sessionRef.current !== mySession) return;
        setPlaybackState('finished');
        setAudioCurrentTime(audio.duration || 0);
        setSentenceIdx(Math.max(0, sentences.length - 1));
        soundEngine.setMusicDucked(true, false);
      };

      setUsingRealAudio(true);
      setPlaybackState('playing');
      soundEngine.setMusicDucked(true, !soundEngine.muted);
      audio.play().catch(() => {
        if (sessionRef.current === mySession) {
          speakFallbackFromIndex(0);
        }
      });
    },
    [sentenceThresholds, sentences.length, speakFallbackFromIndex]
  );

  const fetchAndPlayTts = useCallback(async () => {
    if (!fullNarrationText) return;

    // Resume existing paused HTMLAudioElement immediately
    if (audioRef.current && usingRealAudio) {
      if (playbackState === 'finished') {
        audioRef.current.currentTime = 0;
        setAudioCurrentTime(0);
        setSentenceIdx(0);
      }
      audioRef.current.muted = soundEngine.muted;
      setPlaybackState('playing');
      soundEngine.setMusicDucked(true, !soundEngine.muted);
      audioRef.current.play().catch(() => {});
      return;
    }

    sessionRef.current += 1;
    const mySession = sessionRef.current;

    const cachedUrl = clientAudioUrlCache.get(cacheKey);
    if (cachedUrl) {
      attachAndPlayAudioUrl(cachedUrl, mySession);
      return;
    }

    setPlaybackState('loading');
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cacheKey: objectId,
          text: fullNarrationText,
          lang,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const wavBlob = await response.blob();
      if (sessionRef.current !== mySession) return;

      const blobUrl = URL.createObjectURL(wavBlob);
      clientAudioUrlCache.set(cacheKey, blobUrl);
      attachAndPlayAudioUrl(blobUrl, mySession);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      if (sessionRef.current === mySession) {
        speakFallbackFromIndex(sentenceIdx);
      }
    }
  }, [
    fullNarrationText,
    usingRealAudio,
    playbackState,
    cacheKey,
    objectId,
    lang,
    attachAndPlayAudioUrl,
    speakFallbackFromIndex,
    sentenceIdx,
  ]);

  // Pre-warm audio cache when user switches into the recorder view so Play is instant
  useEffect(() => {
    if (activeView !== 'recorder' || !fullNarrationText) return;
    if (clientAudioUrlCache.has(cacheKey)) return;

    const controller = new AbortController();
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cacheKey: objectId,
        text: fullNarrationText,
        lang,
      }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (blob && !clientAudioUrlCache.has(cacheKey)) {
          clientAudioUrlCache.set(cacheKey, URL.createObjectURL(blob));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [activeView, fullNarrationText, cacheKey, objectId, lang]);

  const handlePlay = useCallback(() => {
    soundEngine.playTapeClick();
    if (!sentences.length) return;
    if (playbackState === 'playing' || playbackState === 'loading') return;

    if (!usingRealAudio) {
      const startIdx = playbackState === 'finished' ? 0 : sentenceIdx;
      speakFallbackFromIndex(startIdx);
      return;
    }

    fetchAndPlayTts();
  }, [
    sentences.length,
    playbackState,
    usingRealAudio,
    sentenceIdx,
    speakFallbackFromIndex,
    fetchAndPlayTts,
  ]);

  const handlePause = useCallback(() => {
    soundEngine.playTapeClick();
    if (playbackState === 'loading') {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      sessionRef.current += 1;
      setPlaybackState('idle');
      soundEngine.setMusicDucked(true, false);
      return;
    }
    if (playbackState !== 'playing') return;

    if (audioRef.current && usingRealAudio) {
      audioRef.current.pause();
      soundEngine.setMusicDucked(true, false);
      setPlaybackState('paused');
      return;
    }

    sessionRef.current += 1;
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    soundEngine.setMusicDucked(true, false);
    setPlaybackState('paused');
  }, [playbackState, usingRealAudio]);

  const handleTogglePlayPause = useCallback(() => {
    if (playbackState === 'playing' || playbackState === 'loading') {
      handlePause();
    } else {
      handlePlay();
    }
  }, [playbackState, handlePause, handlePlay]);

  const handleRewind = useCallback(() => {
    soundEngine.playTapeRewind();
    if (!sentences.length) return;

    if (audioRef.current && usingRealAudio) {
      const audio = audioRef.current;
      const nextTime = Math.max(0, audio.currentTime - 8);
      audio.currentTime = nextTime;
      setAudioCurrentTime(nextTime);
      const dur = audio.duration || 0;
      if (dur > 0) {
        const ratio = nextTime / dur;
        const idx = sentenceThresholds.findIndex((th) => ratio <= th);
        setSentenceIdx(idx === -1 ? Math.max(0, sentences.length - 1) : idx);
      } else {
        setSentenceIdx(0);
      }
      if (playbackState === 'finished') {
        setPlaybackState('paused');
      }
      return;
    }

    const prevIdx =
      playbackState === 'finished'
        ? Math.max(0, sentences.length - 1)
        : Math.max(0, sentenceIdx - 1);

    if (playbackState === 'playing') {
      speakFallbackFromIndex(prevIdx);
    } else {
      sessionRef.current += 1;
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      soundEngine.setMusicDucked(true, false);
      setSentenceIdx(prevIdx);
      setPlaybackState(prevIdx === 0 ? 'idle' : 'paused');
    }
  }, [
    sentences.length,
    usingRealAudio,
    sentenceThresholds,
    playbackState,
    sentenceIdx,
    speakFallbackFromIndex,
  ]);

  const handleSelectView = (next: ArchiveView) => {
    soundEngine.playTapeClick();
    setActiveView(next);
  };

  const handleExit = () => {
    stopAllAudio();
    onExit();
  };

  const progressPct =
    usingRealAudio && audioDuration > 0
      ? Math.min(100, Math.round((audioCurrentTime / audioDuration) * 100))
      : totalSentences > 0
      ? playbackState === 'finished'
        ? 100
        : Math.round(
            ((sentenceIdx + (playbackState === 'playing' ? 0.5 : 0)) / totalSentences) *
              100
          )
      : 0;

  const statusText =
    playbackState === 'loading'
      ? t.recorderLoadingStatus
      : playbackState === 'playing'
      ? t.recorderPlayingStatus
      : playbackState === 'paused'
      ? t.recorderPausedStatus
      : playbackState === 'finished'
      ? t.recorderFinishedStatus
      : t.recorderReadyStatus;

  const timeLabel =
    usingRealAudio && audioDuration > 0
      ? `${formatTime(audioCurrentTime)} / ${formatTime(audioDuration)}`
      : totalSentences > 0
      ? `${String(Math.min(sentenceIdx + 1, totalSentences)).padStart(2, '0')}/${String(totalSentences).padStart(2, '0')}`
      : '00/00';

  return (
    <div className="absolute inset-0 z-20 bg-[#07090E]/88 backdrop-blur-xs flex flex-col items-center justify-between p-4 sm:p-6 gap-3 overflow-y-auto custom-scrollbar">
      {/* Main Stage with Smooth Animated View Transitions */}
      <div className="w-full max-w-4xl flex-1 min-h-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeView === 'chooser' && (
            <motion.div
              key="chooser"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl flex flex-col items-center gap-5"
            >
              <div className="text-center">
                <h2 className="font-crayon text-2xl sm:text-3xl font-bold text-slate-50">
                  {recording?.title[lang] ?? alt}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {t.chooseArchiveMode}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
                {/* Option 1: Logbook Written Page + Mini Visual Preview */}
                <button
                  type="button"
                  onClick={() => handleSelectView('logbook')}
                  className="crayon-box crayon-box-mars p-4 flex flex-col gap-3 text-left cursor-pointer group transition-transform duration-150 hover:-translate-y-1 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-amber-300"
                >
                  <div className="crayon-box crayon-box-slate w-full h-36 sm:h-44 flex items-center justify-center p-2.5 overflow-hidden">
                    {processedUrl ? (
                      <img
                        src={processedUrl}
                        alt={alt}
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full w-auto h-auto object-contain select-none transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)]"
                      />
                    ) : (
                      <BookOpen className="w-10 h-10 text-amber-300/50" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-crayon text-xl font-bold text-amber-200 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>{t.readLogbookOption}</span>
                      </div>
                      <p className="font-crayon text-sm text-slate-300 mt-0.5 leading-snug">
                        {t.readLogbookDesc}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-amber-300 shrink-0 transition-transform duration-150 group-hover:-translate-x-1" />
                  </div>
                </button>

                {/* Option 2: Audio Tape Recorder + Mini Visual Preview */}
                <button
                  type="button"
                  onClick={() => handleSelectView('recorder')}
                  className="crayon-box crayon-box-moon p-4 flex flex-col gap-3 text-left cursor-pointer group transition-transform duration-150 hover:-translate-y-1 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                  <div className="crayon-box crayon-box-slate w-full h-36 sm:h-44 flex items-center justify-center p-3 overflow-hidden">
                    {recorderUrl ? (
                      <img
                        src={recorderUrl}
                        alt={t.listenRecordingOption}
                        className="max-w-[85%] max-h-full w-auto h-auto object-contain select-none transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]"
                      />
                    ) : (
                      <Volume2 className="w-10 h-10 text-emerald-300/50" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-crayon text-xl font-bold text-emerald-300 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 shrink-0" />
                        <span>{t.listenRecordingOption}</span>
                      </div>
                      <p className="font-crayon text-sm text-slate-300 mt-0.5 leading-snug">
                        {t.listenRecordingDesc}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-300 shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeView === 'logbook' && (
            <motion.div
              key="logbook"
              initial={{ opacity: 0, x: -36, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center justify-center gap-3"
            >
              {/* Top Navigation Bar */}
              <div className="w-full max-w-3xl flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectView('chooser')}
                  className="crayon-btn crayon-btn-dark inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                  <span>{t.backToOptions}</span>
                </button>

                {recording && (
                  <button
                    type="button"
                    onClick={() => handleSelectView('recorder')}
                    className="crayon-btn crayon-btn-emerald inline-flex items-center gap-2 px-4 py-2 text-sm font-bold cursor-pointer group"
                  >
                    <Volume2 className="w-4 h-4 shrink-0" />
                    <span>{t.listenRecording}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
                  </button>
                )}
              </div>

              {/* Full Logbook Page */}
              <div className="w-full flex items-center justify-center">
                {processedUrl && (
                  <img
                    src={processedUrl}
                    alt={alt}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[62vh] w-auto h-auto object-contain select-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.75)]"
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'recorder' && (
            <motion.div
              key="recorder"
              initial={{ opacity: 0, x: 36, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center justify-center gap-3.5"
            >
              {/* Top Navigation Bar */}
              <div className="w-full max-w-lg flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectView('chooser')}
                  className="crayon-btn crayon-btn-dark inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                  <span>{t.backToOptions}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectView('logbook')}
                  className="crayon-btn crayon-btn-amber inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:-translate-x-1" />
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>{t.viewLogbookBtn}</span>
                </button>
              </div>

              {/* Interactive Crayon Recorder Image with Functional Button Hotspots */}
              <div className="relative w-full max-w-[380px] sm:max-w-[420px] select-none">
                {recorderUrl && (
                  <img
                    src={recorderUrl}
                    alt={recording?.title[lang] ?? alt}
                    className="w-full h-auto block drop-shadow-[0_18px_38px_rgba(0,0,0,0.85)]"
                    draggable={false}
                  />
                )}

                {/* Left painted button on image: PAUSAR */}
                <button
                  type="button"
                  onClick={handlePause}
                  aria-label={t.recorderPause}
                  title={t.recorderPause}
                  style={{ left: '5.5%', top: '29%', width: '14%', height: '28%' }}
                  className={`absolute rounded-lg cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-300 ${
                    playbackState === 'paused'
                      ? 'ring-2 ring-amber-300 bg-amber-300/18 shadow-[0_0_14px_rgba(251,191,36,0.45)]'
                      : 'hover:ring-2 hover:ring-amber-300/85 hover:bg-amber-300/12 active:scale-95'
                  }`}
                />

                {/* Middle painted button on image (▶): REPRODUCIR / PAUSAR */}
                <button
                  type="button"
                  onClick={handleTogglePlayPause}
                  aria-label={
                    playbackState === 'playing' ? t.recorderPause : t.recorderPlay
                  }
                  title={
                    playbackState === 'playing' ? t.recorderPause : t.recorderPlay
                  }
                  style={{ left: '25.8%', top: '33.8%', width: '16%', height: '28.5%' }}
                  className={`absolute rounded-lg cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-300 ${
                    playbackState === 'playing'
                      ? 'ring-2 ring-emerald-300 bg-emerald-300/20 shadow-[0_0_16px_rgba(52,211,153,0.55)]'
                      : 'hover:ring-2 hover:ring-emerald-300/85 hover:bg-emerald-300/15 active:scale-95'
                  }`}
                />

                {/* Right painted button on image (|<): RETROCEDER */}
                <button
                  type="button"
                  onClick={handleRewind}
                  aria-label={t.recorderRewind}
                  title={t.recorderRewind}
                  style={{ left: '51.8%', top: '39.4%', width: '16.5%', height: '27.8%' }}
                  className="absolute rounded-lg cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-cyan-300/85 hover:bg-cyan-300/15 active:scale-95 focus-visible:outline-2 focus-visible:outline-cyan-300"
                />

                {/* Live playing / loading indicator on the teal cassette display window */}
                {playbackState === 'playing' && (
                  <div
                    style={{ left: '78%', top: '32%', width: '14%', height: '32%' }}
                    className="pointer-events-none absolute flex items-end justify-center gap-1"
                  >
                    <span className="w-1 bg-slate-900/80 rounded-full animate-pulse h-3" />
                    <span className="w-1 bg-slate-900/80 rounded-full animate-bounce h-5" />
                    <span className="w-1 bg-slate-900/80 rounded-full animate-pulse h-4" />
                  </div>
                )}
                {playbackState === 'loading' && (
                  <div
                    style={{ left: '78%', top: '32%', width: '14%', height: '32%' }}
                    className="pointer-events-none absolute flex items-center justify-center"
                  >
                    <Loader2 className="w-5 h-5 text-slate-900/80 animate-spin" />
                  </div>
                )}
              </div>

              {/* Synced Crayon Tape Telemetry & Accessible Controls */}
              <div className="crayon-box crayon-box-slate w-full max-w-lg p-4 flex flex-col gap-3 shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-crayon text-lg font-bold text-slate-100 truncate">
                      {recording?.title[lang] ?? alt}
                    </div>
                    <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                      {playbackState === 'loading' ? (
                        <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{statusText}</span>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs text-slate-300 shrink-0">
                    {timeLabel}
                  </span>
                </div>

                {/* Crayon Progress Bar */}
                <div className="crayon-bar-track w-full h-3">
                  <div
                    className="crayon-bar-fill bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Active Sentence Caption */}
                {totalSentences > 0 && (
                  <p className="font-crayon text-base sm:text-lg text-slate-100 leading-snug min-h-[3.2rem]">
                    {sentences[sentenceIdx]}
                  </p>
                )}

                {/* Synced Button Strip */}
                <div className="grid grid-cols-3 gap-2.5 pt-0.5">
                  <button
                    type="button"
                    onClick={handlePause}
                    disabled={playbackState !== 'playing' && playbackState !== 'loading'}
                    className={`crayon-btn inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs sm:text-sm font-bold ${
                      playbackState === 'playing' || playbackState === 'loading'
                        ? 'crayon-btn-amber cursor-pointer'
                        : 'crayon-btn-disabled cursor-not-allowed'
                    }`}
                  >
                    <Pause className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.recorderPause}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlay}
                    disabled={playbackState === 'playing' || playbackState === 'loading'}
                    className={`crayon-btn inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs sm:text-sm font-bold ${
                      playbackState === 'playing' || playbackState === 'loading'
                        ? 'crayon-btn-disabled cursor-not-allowed'
                        : 'crayon-btn-emerald cursor-pointer'
                    }`}
                  >
                    {playbackState === 'loading' ? (
                      <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{t.recorderPlay}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRewind}
                    className="crayon-btn crayon-btn-cyan inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.recorderRewind}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Exit Button */}
      <button
        type="button"
        onClick={handleExit}
        className="crayon-btn crayon-btn-amber inline-flex items-center justify-center px-8 py-2 text-base font-bold whitespace-nowrap shrink-0 cursor-pointer"
      >
        {t.exitStory}
      </button>
    </div>
  );
};
