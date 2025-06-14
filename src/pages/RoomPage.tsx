
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from './socket';
import axios from 'axios';

function Chat({ connected, onLoaded }: { connected: boolean, onLoaded: () => void }) {

  const navigate = useNavigate();

  //const [ connected, setConnected ] = useState( false );
  const [ username, setUsername ] = useState( '' );
  const inputRef = useRef<HTMLInputElement>( null );
  const [ room, setRoom ] = useState( '' );
  const [ messages, setMessages ] = useState<{ 
    name: string, 
    message: string, 
    datetime: number, 
    datetimeString: string }[]
  >( [] );

  const sendMessage = ( name: string, room: string, message: string ) => {

    socket.emit( 'sendMessage', { name: name, room: room, message: message } );
    
  }

  const handleSubmit = ( event: any ) => {
    
    event.preventDefault();
    sendMessage( username, room, inputRef.current!.value );
    inputRef.current!.value = '';
    inputRef.current!.focus();

  }

  useEffect(() => {

    if ( 
      (sessionStorage.getItem('name') && sessionStorage.getItem('name') !== 'undefined') &&
      (sessionStorage.getItem('room') && sessionStorage.getItem('room') !== 'undefined')
    ) {

      axios.post( 
        import.meta.env.VITE_BACKEND_URL + 'room', 
        {
          room: JSON.parse( sessionStorage.getItem('room')! ),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      ).then(( response ) => {

        if ( response.data.success ) {

          setUsername( JSON.parse( sessionStorage.getItem('name')! ) );
          setRoom( JSON.parse( sessionStorage.getItem('room')! ) );
          socket.auth = { 
            name: JSON.parse( sessionStorage.getItem('name')! ), 
            room: JSON.parse( sessionStorage.getItem('room')! ) 
          };
          socket.connect();

        } else {

          sessionStorage.removeItem( 'room' );
          navigate( '/', { state: { failed: true } } );

        }

      }).catch(() => {

        sessionStorage.removeItem( 'room' );
        navigate( '/', { state: { failed: true } } );
      
      });

    } else {

      navigate( '/', { state: { failed: true } } );

    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function onConnect() {

      onLoaded();
      
    }

    function onDisconnect() {
      
      sessionStorage.removeItem( 'room' );

      navigate( '/', { state: { failed: false } } );

    }

    socket.on( 'connect', onConnect );
    socket.on( 'disconnect', onDisconnect );

    return () => {
      socket.off( 'connect', onConnect );
      socket.off( 'disconnect', onDisconnect );
    };
  }, []);

  useEffect(() => {
    function priorMessages( data: { name: string, message: string, datetime: number }[] ) {

      const previousMessages = data.map(( message ) => {
        return { 
          name: message.name, 
          message: message.message, 
          datetime: message.datetime, 
          datetimeString: new Date( message.datetime ).toLocaleString() 
        }
      });

      setMessages([ ...previousMessages ]);

    }

    function receiveMessage( data: { name: string, message: string, datetime: number } ) {
      
      setMessages([ ...messages, { 
        name: data.name, 
        message: data.message, 
        datetime: data.datetime, 
        datetimeString: new Date( data.datetime ).toLocaleString() 
      } ]);

    }

    socket.on('priorMessages', priorMessages);
    socket.on('message', receiveMessage);

    return () => {
      socket.off('priorMessages', priorMessages);
      socket.off('message', receiveMessage);
    };
  }, [ messages ]);

  return (
    <div className="flex-1 flex flex-col items-center gap-2 w-full h-full">
      { connected ? 
        <>
          <div className="flex-1 flex flex-col w-full h-0">
            <ul className="flex-1 flex flex-col gap-1 w-full overflow-auto">
              { messages.map(( message ) => {
                
                switch ( message.name ) {

                  case 'System':
                    return (
                      <li className="flex flex-col items-start" key={ message.datetime }>
                        <div className="text-xs">{ message.datetimeString }</div>
                        <span className="text-base"><i>{ message.message }</i></span>
                      </li>
                    );

                  case username:
                    return (
                      <li className="flex flex-col items-start" key={ message.datetime }>
                        <div className="text-xs">{ message.name } - { message.datetimeString }</div>
                        <span className="text-base">{ message.message }</span>
                      </li>
                    );

                  default:
                    return (
                      <li className="flex flex-col items-end" key={ message.datetime }>
                        <div className="text-xs">{ message.datetimeString } - { message.name }</div>
                        <span className="text-base">{ message.message }</span>
                      </li>
                    );

                }
              }) }
            </ul>
          </div>
          <div className="w-full border-1"></div>
          <form 
            className="flex flex-row gap-2 w-full"
            onSubmit={ handleSubmit }
          >
            <input
              className="flex-1 p-1 border-b-1" 
              type="text" 
              placeholder="Enter your Message to Send..."
              ref={ inputRef }
            />
            <button 
              className="mt-1 px-2 py-1 bg-cyan-100 hover:bg-cyan-200 border-1 cursor-pointer transition-all delay-100 ease-in-out"
              type="submit"
            >
              Send
            </button>
            <input type="submit" hidden />
          </form>
        </> : 
        <div className="size-8 border-5 border-cyan-100 border-t-5 border-t-cyan-400 rounded-[50%] animate-spin"></div>
      }
    </div>
  );
}

function Room() {

  const [ connected, setConnected ] = useState( false );

  const params = useParams<{ roomId: string }>();

  const disconnectSocket = () => {

    if ( connected ) {

      socket.disconnect();

    }

  };

  const socketConnected = () => {

    setConnected( true );

  }

  return (
    <div className="size-full flex justify-center">
      <div className="flex flex-col items-center gap-2 max-w-5xl size-full p-4 border-2">
        <div className="flex flex-row justify-between w-full">
          <button 
            className="w-35 mt-1 px-2 py-1 bg-cyan-100 hover:bg-cyan-200 border-1 cursor-pointer transition-all delay-100 ease-in-out disabled:bg-gray-100 disabled:cursor-default" 
            type="button"
            disabled={ !connected }
            onClick={ () => disconnectSocket() }
          >
            Leave Room
          </button>
          <h1 className="text-xl font-bold">Room: { params.roomId }</h1>
          <div className="w-35"></div>
        </div>
        <div className="w-full border-1"></div>
        <Chat connected={ connected } onLoaded={ socketConnected } />
      </div>
    </div>
  );
}

export default Room;