const Navbar = () => {
  return (
    <div id="navbar" className="bg-secondary d-flex align-center justify-space-between">
      <h1 className="fs-1" >Logo</h1>
      <div className="authorisation">
        <button>Sign In</button>
        <button>Sign Up</button>
      </div>
    </div>
  );
}

export default Navbar;