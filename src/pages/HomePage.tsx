import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

function RoomForm() {

  const navigate = useNavigate();
  const { state } = useLocation();

  const [ isJoin, setIsJoin ] = useState( false );
  const [ failedConnection, setFailedConnection ] = useState( state ? state.failed : false );
  const [ failedReason, setFailedReason ] = useState( 'Connection Failed, Try Again' );

  const { register, unregister, formState: { errors }, handleSubmit, setValue } = useForm();

  const onSubmit = ( data: any ) => {
    axios.post( 
      import.meta.env.VITE_BACKEND_URL + 'search', 
      {
        name: data.name,
        code: data.code ? data.code : '',
        isJoin: isJoin,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    ).then(( response ) => {

      if ( response.data.success ) {

        sessionStorage.setItem('name', JSON.stringify( response.data.data.name ));
        sessionStorage.setItem('room', JSON.stringify( response.data.data.room ));

        setFailedConnection( false );

        navigate( `/room/${ response.data.data.room }` )

      } else {

        setFailedConnection( true );
        setFailedReason( response.data.reason );

      }

    }).catch(() => {

      setFailedConnection( true );
      setFailedReason( 'Connection Failed, Try Again' );
    
    });
  };

  const unregisterCode = () => {
    unregister( 'code' );
    setIsJoin( false );
  };

  useEffect(() => {

    if (( sessionStorage.getItem('name') && sessionStorage.getItem('name') !== 'undefined' )) {

      setValue( 'name', JSON.parse( sessionStorage.getItem('name')! ) );

    }

    if ( 
      (sessionStorage.getItem('name') && sessionStorage.getItem('name') !== 'undefined') &&
      (sessionStorage.getItem('room') && sessionStorage.getItem('room') !== 'undefined')
    ) {

      navigate( `/room/${ JSON.parse( sessionStorage.getItem('room')! ) }` );

    }

  }, []);

  return (
    <div className="flex flex-col items-center">
      { failedConnection && <div className="text-xs text-red-400">{ failedReason }</div> }
      <form 
        className={ 'flex flex-col gap-1 ' + ( failedConnection ? '' : 'mt-4' ) }
        onSubmit={ handleSubmit( onSubmit ) }
      >
        <div className="flex flex-col">
          <label className="text-xs" htmlFor="name">Username</label>
          <input 
            className={ 'p-1 border-b-1 ' + ( errors.name ? 'border-red-400' : 'mb-4' ) }
            id="name"
            type="text" 
            { ...register( 'name', { 
              required: { value: true, message: 'Your Username is Required' },
              pattern: { value: /^([ ]*)(\w+[ ]?)+([ ]*)$/g, message: 'This Username is Not Valid' }
            } ) }
            placeholder="Enter Your Username..."
            autoComplete="off"
          />
          { errors.name && <span className="text-xs text-red-400">{ errors.name?.message as string }</span> }
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col">
            <label className="text-xs" htmlFor="room">Room Code to Join Room</label>
            <input 
              className={ 'p-1 border-b-1 ' + ( errors.code?.message ? 'border-red-400' : 'mb-4' ) }
              type="text"
              id="room"
              { ...( isJoin && register( 'code', { 
                required: { value: true, message: 'To Join, The Room Code is Required' }, 
                minLength: { value: 4, message: 'Code is less than 4 Characters' }, 
                maxLength: { value: 4, message: 'Code is more than 4 Characters' }, 
              }))}
              placeholder="Enter The Room Code..."
              autoComplete="off"
            />
            { errors.code?.message && <span className="text-xs text-red-400">{ errors.code?.message as string }</span> }
          </div>
          <button 
            className="self-end ml-2 mb-4 px-2 py-1 bg-cyan-100 hover:bg-cyan-200 border-1 cursor-pointer transition-all delay-100 ease-in-out"
            type="submit" 
            onClick={ () => setIsJoin( true ) }
          >
            Join Room
          </button>
        </div>
        <button 
          className="mt-1 px-2 py-1 bg-cyan-100 hover:bg-cyan-200 border-1 cursor-pointer transition-all delay-100 ease-in-out"
          type="submit" 
          onClick={ () => unregisterCode() }
        >
          Create a Room
        </button>
      </form>
    </div>
  );
}

function Home() {

  return (
    <div className="size-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-2 p-4 border-2">
        <h1 className="text-xl font-bold">Enter Chat Room</h1>
        <RoomForm />
      </div>
    </div>
  );
}

export default Home;