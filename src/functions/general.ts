// Generate subarrays for search purposes.
// If multiple words, split them by whitespace and return subarrays of each,
// summed up in one array.
export const genSubStrings = (str: string) => {
  const subStringsSet = new Set<string>();
  const splitWordsArray = str.split(" ");

  splitWordsArray.forEach((word, wordIndex) => {
    for (let index = 1; index <= word.length; index++) {
      const subString = word.slice(0, index).toLowerCase();
      subStringsSet.add(subString);
    }

    if (wordIndex > 0) {
      for (let index = 0; index < word.length; index++) {
        const subString = str.slice(0, str.indexOf(word) + index + 1).toLowerCase().trim();
        subStringsSet.add(subString);
      }
    }
  });

  return Array.from(subStringsSet);
}


// <---------------------------------------------------------------------------------------------------------->


// Combine two ids together. If one is bigger in length than another it will come first
// in concatenation, if they are equal in length then they will be sorted alphabetically
// and the first alphabet will come first.
export const combineIds = (id1: string, id2: string) => {
  if(id1.length > id2.length) {
    var combinedId = id1 + id2;
  } else if (id2.length > id1.length) {
    var combinedId = id2 + id1;
  } else {
    const sortedArray = [id1, id2].sort();
    var combinedId = sortedArray[0] + sortedArray[1];
  }

  return combinedId;
}


// <---------------------------------------------------------------------------------------------------------->


// Filter username for any whitespace, duplication, uppercase.
export const filterUsername = (str: string) => {
  // Transform to lowercase.
  const lowerCase = str.toLowerCase();
  // Trim any whitespaces.
  const trimmed = lowerCase.trim();
  // Split it without duplicate whitespaces, (OR WORD, I HOPE IT WON'T CAUSE A BUG).
  const splitted = Array.from(new Set(trimmed.split(" ")));
  // Join back together
  const joined = splitted.join(" ");

  return joined;
}


// <---------------------------------------------------------------------------------------------------------->


// Download image.
export const imageDownload = async (dwUrl: string, name: string) => {
  // Fetch image url and convert the response into a blob (binary large object).
  fetch(dwUrl).then(response => response.blob()).then(blob => {
    // window.URL.createObjectURL() is a method that creates a URL representing the Blob object passed to it.
    const url = window.URL.createObjectURL(new Blob([blob], {type: "image/jpeg"}));
    // Create anchor element (that is used for downloading data).
    const link = document.createElement("a");
    // Set it's url accordingly.
    link.href = url;
    // Set download attribute (which indicates that browser should proceed download, name is the name of downloaded file (name it whatever you want)).
    link.setAttribute("download", name);
    // Simulate click on the anchor tag.
    link.click();
  }).catch((err) => console.error(err));
}


// <---------------------------------------------------------------------------------------------------------->


// Find all instance substrings in a main string.
export const findAllInstances = (str: string, target: string) => {
  const indexes = [];
  let currentlyFound = str.indexOf(target);

  while(currentlyFound !== -1) {
    indexes.push(currentlyFound);
    currentlyFound = str.indexOf(target, currentlyFound + 1);
  }

  return indexes;
}


// <---------------------------------------------------------------------------------------------------------->


// Sort object in descending way if keys are strings which can be parsed as integers.
export const sortObject = (object: any, reverse: boolean = true) => {
  const sorted = Object.keys(object).sort((a: string, b: string) => parseInt(a) - parseInt(b));
  const reverseApplied = reverse ? sorted.reverse() : sorted;
  return reverseApplied.reduce((obj: any, key: string) => {
    obj[key] = object[key];
    return obj;
  }, {});
}


// <---------------------------------------------------------------------------------------------------------->


// Check if file is valid image or video.
export const isValidImageOrVideo = (src: File, sizeLimit = 50, options: {onlyImage: boolean, onlyVideo: boolean} = {onlyImage: false, onlyVideo: false}) => {
  const isImage: boolean = src.type.match("image.*") ? true : false;
  const isVideo: boolean = src.type.match("video.*") ? true : false;
  const sizeInMb = parseFloat((src.size / (1024 * 1024)).toFixed(2));
  
  // If media is more than 20mb in size it throws size error.
  if(sizeInMb > sizeLimit) {
    throw Error(`Media size can not exceed ${sizeLimit}mb`);
  }
  
  // If by options only image is set to true, we only check for image validity.
  // If by options only video is set to true, we only check for video validity.
  // If both options are set to true only image validation will be considered anyways,
  // therefore do not specify options if you want to check for both.
  if(options.onlyImage) {
    return {isValid: isImage, type: "image"};
  } else if (options.onlyVideo) {
    return {isValid: isVideo, type: "video"}
  } else {
    return {
      isValid: isImage || isVideo,
      type: isImage ? "image" : isVideo ? "video" : "no type"
    }
  }
}


// <---------------------------------------------------------------------------------------------------------->


// Function to get global unix time and not system time.
export const getGlobalTimeUnix = async () => {
  // Helper function that fetches data.
  const getGlobalTimeHelper = async () => {
    const globalTime: any = (await fetch("http://worldtimeapi.org/api/timezone/Asia/Tbilisi")).json();
    return globalTime;
  }

  const time = await getGlobalTimeHelper();
  return new Date(time.utc_datetime).getTime();
}