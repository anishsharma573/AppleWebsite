import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { hightlightsSlides } from '../constants';
import { pauseImg, playImg, replayImg } from '../utils';
import { useGSAP } from '@gsap/react';

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const VideoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);
  const { startPlay, videoId, isLastVideo, isPlaying } = video;

  useGSAP(() => {
    gsap.to('#slider',{
        transform:`translateX(${-100*videoId}%)`,
        duration:2,
        ease:'power1.inOut'
    })
    gsap.to('#video', {
      scrollTrigger: {
        trigger: '#video',
        toggleActions: 'restart none none none',
      },
      onComplete: () => {
        setVideo((prev) => ({
          ...prev,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [videoId]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId]?.pause();
      } else if (startPlay) {
        videoRef.current[videoId]?.play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  const handleLoadedMetaData = (i, e) => setLoadedData((prev) => [...prev, e]);

  useEffect(() => {
    let currentProgress = 0;
    const span = videoSpanRef.current[videoId];
    let anim;

    if (span) {
      anim = gsap.to(span, {
        onUpdate: function () {
          const progress = Math.ceil(this.progress() * 100);
          if (progress !== currentProgress) {
            currentProgress = progress;
            gsap.set(VideoDivRef.current[videoId], {
              width: window.innerWidth < 760 ? "10vw" : window.innerWidth < 1200 ? '10vw' : '4vw',
            });
            gsap.set(span, {
              width: `${currentProgress}%`,
              backgroundColor: 'white',
            });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(VideoDivRef.current[videoId], {
              width: '12px',
            });
            gsap.to(span, {
              backgroundColor: '#afafaf',
            });
          }
        },
      });

      const animUpdate = () => {
        anim.progress(videoRef.current[videoId]?.currentTime / hightlightsSlides[videoId]?.videoDuration);
      };

      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }

      return () => {
        gsap.ticker.remove(animUpdate); // Clean up on unmount or dependencies change
        anim.kill(); // Clean up animation instance
      };
    }
  }, [videoId, startPlay]);

  const handleProcess = (type, i) => {
    setVideo((prevVideo) => {
      const updates = {};
      switch (type) {
        case 'video-end':
          updates.isEnd = true;
          updates.videoId = i + 1;
          break;
        case 'video-last':
          updates.isLastVideo = true;
          break;
        case 'video-reset':
          return {
            ...prevVideo,
            isLastVideo: false,
            videoId: 0,
            isPlaying: false,
          };
        case 'play':
          updates.isPlaying = !prevVideo.isPlaying;
          break;
        case 'pause':
          updates.isPlaying = false;
          break;
        default:
          break;
      }
      return { ...prevVideo, ...updates };
    });
  };

  return (
    <>
      <div className='flex items-center'>
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className='sm:pr-20 pr-10'>
            <div className='video-carousel_container'>
              <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                <video
                className={`${list.id ===2 && 'translate-x-44'}
                pointer-events-none`}
                  id='video'
                  playsInline
                  preload='auto'
                  muted
                  ref={(el) => (videoRef.current[i] = el)}
                  onPlay={() => {
                    setVideo((prevVideo) => ({ ...prevVideo, isPlaying: true }));
                  }}
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                  onEnded={()=>
                    i!==3
                    ? handleProcess('video-end',i)
                    :handleProcess('video-last')
                  }
                >
                  <source src={list.video} type='video/mp4' />
                </video>
              </div>
              <div className='absolute top-12 left-[5%] z-10%'>
                {list.textLists.map((text) => (
                  <p key={text} className='md:text-2xl text-xl font-medium'>
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='relative flex-center mt-10'>
        <div className='flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full'>
          {videoRef.current.map((_, i) => (
            <span
              key={i}
              ref={(el) => (VideoDivRef.current[i] = el)}
              className='mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer'
            >
              <span
                className='absolute h-full w-full rounded-full'
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>
        <button className='control-btn' onClick={() => handleProcess(isLastVideo ? 'video-reset' : isPlaying ? 'pause' : 'play')}>
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'}
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
