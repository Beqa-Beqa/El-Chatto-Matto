import * as vids from "../../assets/videos";
import { useEffect } from "react";

const NotLoggedInSlider = () => {
  const vidProps = [
    {
      id: 1,
      title: "Video1",
      url: vids.Video1,
      playingTime: 16000
    },
    {
      id: 2,
      title: "Video2",
      url: vids.Video2,
      playingTime: 9500
    },
    {
      id: 3,
      title: "Video3",
      url: vids.Video3,
      playingTime: 10000
    },
    {
      id: 4,
      title: "Video4",
      url: vids.Video4,
      playingTime: 14000
    },
    {
      id: 5,
      title: "Video5",
      url: vids.Video5,
      playingTime: 20000
    },
  ]

  useEffect(() => {
    const target = document.getElementById("vid-container");
    let currentId = 0;

    const interval = setInterval(() => {
      currentId + 1 < vidProps.length ? currentId++ : currentId = 0;

      target!.style.transform = `translate(${-currentId * 100 / vidProps.length}%)`;
    }, vidProps[currentId].playingTime);

    return () => clearInterval(interval);
  }, [])

  return (
    <div id="vid-container" className="container-fluid p-0 video-container d-flex">
      {vidProps.map((vid) => {
       return <video width={`${100 / vidProps.length}%`} autoPlay loop muted key={vid.id}>
          <source src={vid.url} type="video/mp4" />
        </video>
      })}
    </div>
  );
}

export default NotLoggedInSlider;