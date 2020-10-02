import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import io, { Socket } from 'socket.io-client';
import { withRouter } from 'react-router';

const Room = (props: any) => {

    const [peers, setPeers] = useState<Array<any>>([]);
    const myVideo = useRef<HTMLVideoElement>();
    const socketRef = useRef<typeof Socket>();
    const peerRef = useRef<Array<any>>([]);
    let roomID = props.match.params.roomID;

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:8000");
        navigator.mediaDevices.getUserMedia({
            video: {
                height: window.innerHeight / 2,
                width: window.innerWidth / 2
            }, audio: true
        }).then(stream => {
            // @ts-ignore
            myVideo.current.srcObject = stream;
            socketRef.current?.emit('join room', roomID);
            socketRef.current?.on('all users', (users: any) => {
                let peers: any[] = [];
                users.forEach((userID: any) => {
                    // @ts-ignore
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peerRef.current.push({
                        peerID: userID,
                        peer
                    });
                    peers.push(peer);

                });
                setPeers(peers);
            });

            socketRef.current?.on('user joined', (payload: any) => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peerRef.current.push({
                    peerID: payload.callerID,
                    peer
                });
                setPeers(peers => [...peers, peer]);
            });



            /**
             *  1. Join a new room. `join room`
             *  2. When you join you need to get all the peers that are in that room. `all users` 
             *      2.1. Create a new peer for that user and add them in the peers array => Advice add them as {peerID: userID, peer}
             *          2.1.2 the creation of the peers will be done with the createPeer function
             *  3. When a new peer joins add that peer to your own list
             *      3.1 To create the peer object call the addPeer function
             */


            /**
             * When the signal returns `receiving returned signal`
             * signal the peer with that id;
             * send the signal to alert the other peers
             */


            socketRef.current?.on('receiving returned signal', (payload: any) => {
                const item = peerRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

        })
    }, []);

    const createPeer = (userToSignal: string, callerID: string, stream: any) => {
        /**
         * 
         * Create a new peer using the Peer constructor from simplepeer-js
         * This is the call initiator so it should be configured like this:
         *   {
         *     initiator: true,
         *     trickle: false,
         *     stream,
         *   }
         */
        const peer = new Peer(
            {
                initiator: true,
                trickle: false,
                stream,
            }
        );

        peer.on('signal', signal => {
            socketRef.current?.emit('sending signal', { userToSignal, callerID, signal });
        });

        return peer;

        /**
         * Than on signal you need to send the first signal
         * 'sending signal' action 
         */
    }

    const addPeer = (incomingSignal: string, callerID: string, stream: any) => {
        /**
          * 
          *  Add new peer this is not the initiator so it should be configured like this:
          *   {
          *     initiator: false,
          *     trickle: false,
          *     stream,
          *   }
          */

        /**
         * Than you send a returning signal
         */
        const peer = new Peer(
            {
                initiator: false,
                trickle: false,
                stream,
            }
        );

        peer.on('signal', signal => {
            socketRef.current?.emit("returning signal", { signal, callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }


    return <div>

        <VideoElement userVideo={myVideo} />
        {
            peers.map(peer =>  <Video12 peer={peer}/>)
        }
    </div>
};


const Video12 = (props: any) => {

    const ref = useRef();
    useEffect(() => {
        console.log(props)

        if(props.peer)
         {
             console.log('stream')
            props.peer.on("stream", (stream : any) => {
                // @ts-ignore
                ref.current.srcObject = stream;
            })
         }

    }, []);
    // @ts-ignore
    return <video autoPlay ref={ref} />;
}

const VideoElement = (
    {
        userVideo,
        autoPlay = true,
        muted,
        setMuted,
        name,
        color,
    }: {
        userVideo: React.MutableRefObject<any>,
        autoPlay?: boolean,
        muted?: boolean,
        setMuted?: React.Dispatch<React.SetStateAction<boolean>>,
        color?: string,
        name?: string,
    }) => {

    return <div style={{ display: 'inline-block', backgroundColor: color, padding: 20 }}>
        <video autoPlay={autoPlay} ref={userVideo} muted={true}>
        </video>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '10px'
        }}>
            <label style={{
                color: 'white'
            }}> {name} </label>
            <button
                style={{ display: 'inline' }}
            // onClick={() => setMuted(!muted)}
            > {`${muted ? 'Unmute' : 'Mute'} me`}</button>
        </div>
    </div>
}

export default withRouter(Room);
