import { NavLink } from 'react-router-dom';

function Error() {

  return (
    <div>
      <h1>404 Error Page</h1>
      <NavLink to='/'>Return to Home</NavLink>
    </div>
  );
}

export default Error;