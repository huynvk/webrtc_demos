import FileSaver from 'file-saver';

const detectMimeType = () => {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  for (let mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return '';
};

const initMediaStream = async () => {
  const constraints = {
    audio: {
      echoCancellation: { exact: true },
    },
    video: {
      with: 1280,
      height: 720,
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(
    constraints,
  );
  return stream;
};

const stopMediaStream = async (stream) => {
  stream.getTracks().forEach((track) => track.stop());
};

const combineBlobs = (recordedBlobs) => {
  return new Blob(recordedBlobs, { type: 'video/webm' });
};

const createBlobURL = (blob) => {
  const url = window.URL.createObjectURL(blob);
  return url;
};

export const beginRecord = async (onStreamReady, onFinished) => {
  const stream = await initMediaStream();
  onStreamReady(stream);
  const options = { mimeType: detectMimeType() };
  const recordedBlobs = [];

  const mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    onFinished(recordedBlobs);
    stopMediaStream(stream);
  };

  mediaRecorder.start();

  return mediaRecorder;
};

export const stopPlaying = (videoElement) => {
  videoElement.pause();
  videoElement.src = null;
  videoElement.srcObject = null;
};

export const playRecordedBlobs = (videoElement, recordedBlobs) => {
  const blob = combineBlobs(recordedBlobs);
  const url = createBlobURL(blob);

  stopPlaying(videoElement);

  videoElement.controls = true;
  videoElement.src = url;
  videoElement.play();
};

export const playStream = (videoElement, stream) => {
  stopPlaying(videoElement);

  videoElement.srcObject = stream;
  videoElement.play();
};

export const download = (
  recordedBlobs,
  fileName = 'RecordedVideo.webm',
) => {
  const blob = combineBlobs(recordedBlobs);
  return FileSaver.saveAs(blob, fileName);
};
