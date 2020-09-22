import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';


const App = () => {
  const [state, setState] = useState<any>();
  const [callerID, setCallerID] = useState<string>('');

  useEffect(() => {
    let pseudoRandomID = ('ID' + parseInt(Math.random() * 100 + '')).replace('.', '');
    let peer = new Peer(pseudoRandomID);
    setState({
      peer: peer
    });
    console.log(peer)
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices)
      return 
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (!(state && callerID))
          return;
        const call = state.peer.call(callerID, stream);
        call.on('stream', (remoteStream: MediaStream | MediaSource | Blob | null) => {
          console.log(remoteStream)
          let video = document.getElementById('video-chat') as HTMLVideoElement;
          video.srcObject = remoteStream;
        });
      }).catch(e => console.error({ e })
      )
  }, [callerID]);
  
  useEffect(() => {
    if (state)
    state.peer.on('call', (call: any) => {
      console.log('receiving call from ' + call.peer)
      navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream : any) => {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', (remoteStream : any) => {
          let video = document.getElementById('video-chat') as HTMLVideoElement;
          video.srcObject = remoteStream;
          // Show stream in some <video> element.
        });
      });
    });
  }, [state])

  return (
    <div className="App">
      { callerID &&  <video id="video-chat" autoPlay={true}> </video> }
      <h1>{state?.peer?.id}</h1>
      <form onSubmit={
        e => {
          e.preventDefault();
          console.log(callerID);
        }
      }>
        <input
          type='text'
          placeholder='Input who you want to call'
          id='callerID'
          value={callerID}
          onChange={e =>
            setCallerID(e.target.value)
          } />
        <button type='submit'> Call </button>
      </form>
      <br />
    </div>
  );
};

export default App;