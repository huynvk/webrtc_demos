import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  beginRecord,
  download,
  playRecordedBlobs,
  playStream,
  stopPlaying,
} from './record';

const Container = styled.div`
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const Row = styled.div`
  width: 100vw;
  display: flex;
  justify-content: space-around;
`;

const Button = styled.button`
  margin: 0 3px 10px 0;
  padding-left: 2px;
  padding-right: 2px;
  width: 150px;
  height: 50px;
`;

const Video = styled.video`
  --width: 40vw;

  vertical-align: top;
  width: var(--width);
  height: calc(var(--width) * 0.5625);
  border: 1px solid black;
`;

const App = () => {
  const [started, setStarted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [data, setData] = useState([]);
  const [recorder, setRecorder] = useState(undefined);

  const recordingVideoEl = useRef(null);
  const playingVideoEl = useRef(null);

  return (
    <Container>
      <Row>
        <Video
          id="gum"
          ref={recordingVideoEl}
          playsinline
          autoplay
          muted
        />
        <Video id="recorded" ref={playingVideoEl} playsinline loop />
      </Row>
      <Row>
        <Button
          id="record"
          onClick={async () => {
            try {
              if (!recorder) {
                const mediaRecorder = await beginRecord(
                  (stream) => {
                    console.log('play stream', stream);
                    playStream(recordingVideoEl.current, stream);
                  },
                  (recordedBlobs) => {
                    setData(recordedBlobs);
                    console.log('Finished records', recordedBlobs);
                  },
                );
                setRecorder(mediaRecorder);
              } else {
                recorder.stop();
                stopPlaying(recordingVideoEl.current);

                setRecorder(undefined);
                setRecorded(true);
              }
            } catch (err) {
              console.error(err);
            }
          }}
        >
          {recorder ? 'Stop Recording' : 'Start Recording'}
        </Button>
        <Button
          id="play"
          disabled={!recorded}
          onClick={() => {
            try {
              if (!playing) {
                setPlaying(true);
                playRecordedBlobs(playingVideoEl.current, data);
              } else {
                stopPlaying(playingVideoEl.current);
                setPlaying(false);
              }
            } catch (err) {
              console.error(err);
            }
          }}
        >
          {playing ? 'Stop Playing' : 'Play Video'}
        </Button>
        <Button
          id="download"
          disabled={!recorded}
          onClick={() => {
            try {
              download(data);
            } catch (err) {
              console.error(err);
            }
          }}
        >
          Download
        </Button>
      </Row>
    </Container>
  );
};

export default App;
