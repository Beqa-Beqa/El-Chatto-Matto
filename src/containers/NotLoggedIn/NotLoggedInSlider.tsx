import * as vids from "../../assets/videos";
import { HomeContentNotLoggedIn } from "..";
import { useEffect, useState } from "react";

const NotLoggedInSlider = () => {
  const vidProps = [
    {
      id: 0,
      title: "Video1",
      url: vids.Video1,
      playingTime: 16000
    },
    {
      id: 1,
      title: "Video2",
      url: vids.Video2,
      playingTime: 9500
    },
    {
      id: 2,
      title: "Video3",
      url: vids.Video3,
      playingTime: 10000
    },
    {
      id: 3,
      title: "Video4",
      url: vids.Video4,
      playingTime: 14000
    },
    {
      id: 4,
      title: "Video5",
      url: vids.Video5,
      playingTime: 20000
    },
  ]

  const [vidIndex, setVidIndex] = useState<number>(Math.floor(Math.random() * vidProps.length));
  const [nextVidIndex, setNextVidIndex] = useState<number>(vidIndex + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      vidIndex + 1 < vidProps.length ? setVidIndex(vidIndex + 1) : setVidIndex(0);
      setNextVidIndex((prevIndex) => (prevIndex + 1 < vidProps.length ? prevIndex + 1 : 0));

    }, vidProps[vidIndex].playingTime || 10000);

    return () => clearInterval(interval);
  }, [vidIndex])

  return (
    <div id="vid-container" className="container-fluid p-0 video-container">
      <video preload="auto" key={vidIndex} autoPlay loop muted>
        <source src={vidProps[vidIndex].url} type="video/mp4" />
      </video>
      <video preload="auto" key={nextVidIndex} autoPlay loop muted>
        <source src={vidProps[nextVidIndex].url} type="video/mp4" />
      </video>
      <div className="content">
        <HomeContentNotLoggedIn />
      </div>
    </div>
  );
}

export default NotLoggedInSlider;